<?php

namespace App\Services;

use App\Models\Marriage;
use App\Models\ParentChild;
use App\Models\PendingEdit;
use App\Models\Person;
use App\Models\Tribe;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use RuntimeException;

/**
 * EditApplier
 *
 * يطبّق PendingEdit المعتمد على قاعدة البيانات الفعلية:
 *   - add_person: ينشئ شخصاً جديداً + علاقة parent_child (إن وُجدت)
 *   - edit_person: يُحدّث بيانات شخص موجود
 *
 * الخدمة idempotent بقدر الإمكان (تعمل داخل transaction).
 */
class EditApplier
{
    /**
     * @throws InvalidArgumentException إذا كانت البيانات غير صالحة
     * @throws RuntimeException إذا كانت الحالة ليست pending
     */
    public function apply(PendingEdit $edit): Person
    {
        if ($edit->status !== 'pending') {
            throw new RuntimeException("لا يمكن تطبيق طلب حالته: {$edit->status}");
        }

        $person = DB::transaction(function () use ($edit) {
            return match ($edit->edit_type) {
                'add_person'  => $this->applyAddPerson($edit),
                'edit_person' => $this->applyEditPerson($edit),
                'delete'      => $this->applyDeletePerson($edit),
                default       => throw new InvalidArgumentException(
                    "نوع التعديل غير مدعوم بعد: {$edit->edit_type}"
                ),
            };
        });

        // نُبطل كاش الشجرة — البيانات تغيّرت
        TreeBuilder::invalidate($edit->tribe_id);

        return $person;
    }

    /**
     * applyDeletePerson — يحذف شخصاً بأمان:
     *   1) يمنع الحذف لو له أبناء (لتجنب يتم العلاقات)
     *   2) يحذف الزيجات + علاقة parent_child حيث هو ابن
     *   3) يُفرغ root_person_id للقبيلة لو كان هو الجذر
     *   4) يحذف الشخص نفسه
     *
     * يُرجع نسخة من الشخص المحذوف (للسجل/المرجعية).
     */
    protected function applyDeletePerson(PendingEdit $edit): Person
    {
        $personId = $edit->target_id;
        if (! $personId) {
            throw new InvalidArgumentException('target_id مطلوب لحذف شخص');
        }

        $person = Person::where('tribe_id', $edit->tribe_id)->findOrFail($personId);

        // ١) منع الحذف لو له أبناء
        $childrenCount = ParentChild::where('tribe_id', $edit->tribe_id)
            ->where(function ($q) use ($personId) {
                $q->where('father_id', $personId)
                  ->orWhere('mother_id', $personId);
            })
            ->count();

        if ($childrenCount > 0) {
            throw new RuntimeException(
                "لا يمكن حذف هذا الشخص لأن له {$childrenCount} من الأبناء. احذف أبناءه أولاً."
            );
        }

        // ٢) حذف الزيجات (كزوج أو زوجة)
        \App\Models\Marriage::where('tribe_id', $edit->tribe_id)
            ->where(function ($q) use ($personId) {
                $q->where('husband_id', $personId)
                  ->orWhere('wife_id', $personId);
            })
            ->delete();

        // ٣) حذف علاقة parent_child حيث هو الابن (الـ child_id فريد)
        ParentChild::where('tribe_id', $edit->tribe_id)
            ->where('child_id', $personId)
            ->delete();

        // ٤) لو كان جذر القبيلة → نُفرّغ root_person_id
        $tribe = $person->tribe;
        if ($tribe && $tribe->root_person_id === $personId) {
            $tribe->update(['root_person_id' => null]);
        }

        // ٥) حذف الشخص نفسه
        $deletedSnapshot = $person->replicate();
        $deletedSnapshot->id = $personId;
        $person->delete();

        return $deletedSnapshot;
    }

    /**
     * حقول الشخص المسموح حفظها.
     */
    protected const PERSON_FIELDS = [
        'name_ar', 'name_en', 'short_name_ar', 'gender', 'title',
        'birth_year', 'death_year', 'life_status',
        'birth_place', 'death_place', 'bio_ar',
        'photo',
    ];

    /**
     * add_person — ينشئ person جديد + علاقة parent_child.
     *
     * proposed_data يحتوي:
     *   - حقول الشخص (name_ar, short_name_ar, gender, ...)
     *   - father_id (اختياري)
     *   - mother_id (اختياري)
     */
    protected function applyAddPerson(PendingEdit $edit): Person
    {
        // فرض حدّ الأشخاص حسب باقة القبيلة (المدير العام مستثنى)
        $tribe = Tribe::find($edit->tribe_id);
        if ($tribe && ! $tribe->canAddPerson() && ! $edit->requester?->isSuperAdmin()) {
            throw new RuntimeException(
                "بلغت القبيلة الحدّ الأقصى لباقتها ({$tribe->personLimit()} شخص). يلزم ترقية الباقة لإضافة المزيد."
            );
        }

        $data = $edit->proposed_data;

        $personData = array_intersect_key($data, array_flip(self::PERSON_FIELDS));
        $personData['tribe_id']    = $edit->tribe_id;
        $personData['status']      = 'approved';
        $personData['added_by']    = $edit->requested_by;
        $personData['approved_by'] = $edit->reviewer_id;

        $person = Person::create($personData);

        $fatherId = $data['father_id'] ?? null;
        $motherId = $data['mother_id'] ?? null;

        if ($fatherId || $motherId) {
            // نتحقق أن الأب/الأم ينتميان للقبيلة نفسها
            if ($fatherId) {
                $this->assertSameTribe($fatherId, $edit->tribe_id, 'الأب');
            }
            if ($motherId) {
                $this->assertSameTribe($motherId, $edit->tribe_id, 'الأم');
            }

            ParentChild::create([
                'tribe_id'  => $edit->tribe_id,
                'father_id' => $fatherId,
                'mother_id' => $motherId,
                'child_id'  => $person->id,
                'status'    => 'approved',
            ]);
        } else {
            // لو بلا والدَين: هذا الشخص "جذر" محتمل.
            // نُعيّنه تلقائياً root_person_id للقبيلة لو لم يكن هناك جذر بعد.
            $tribe = Tribe::find($edit->tribe_id);
            if ($tribe && ! $tribe->root_person_id) {
                $tribe->update(['root_person_id' => $person->id]);
            }
        }

        // الأزواج/الزوجات (اختياري) — ننشئ سجل زواج لكل واحد
        $spouseIds = $data['spouse_ids'] ?? [];
        if (! is_array($spouseIds)) {
            $spouseIds = [];
        }

        // backward-compat: لو وصل spouse_id (مفرد) من نسخة قديمة
        if (! empty($data['spouse_id'])) {
            $spouseIds[] = $data['spouse_id'];
        }

        // إزالة التكرارات
        $spouseIds = array_values(array_unique(array_filter($spouseIds)));

        foreach ($spouseIds as $spouseId) {
            $this->assertSameTribe($spouseId, $edit->tribe_id, 'الزوج/الزوجة');

            // husband دائماً ذكر، wife دائماً أنثى
            $husbandId = $person->isMale() ? $person->id : $spouseId;
            $wifeId    = $person->isMale() ? $spouseId : $person->id;

            // تجاهل لو الزواج موجود مسبقاً
            $exists = Marriage::where('tribe_id', $edit->tribe_id)
                ->where('husband_id', $husbandId)
                ->where('wife_id', $wifeId)
                ->exists();
            if ($exists) {
                continue;
            }

            $order = Marriage::where('tribe_id', $edit->tribe_id)
                ->where('husband_id', $husbandId)
                ->count() + 1;

            Marriage::create([
                'tribe_id'       => $edit->tribe_id,
                'husband_id'     => $husbandId,
                'wife_id'        => $wifeId,
                'marriage_order' => $order,
                'is_current'     => true,
                'status'         => 'approved',
            ]);
        }

        return $person;
    }

    /**
     * edit_person — يُحدّث حقول شخص موجود + إدارة الأم والأزواج (اختياري).
     */
    protected function applyEditPerson(PendingEdit $edit): Person
    {
        $personId = $edit->target_id;
        if (! $personId) {
            throw new InvalidArgumentException('target_id مطلوب لتعديل شخص');
        }

        $person = Person::where('tribe_id', $edit->tribe_id)->findOrFail($personId);
        $payload = $edit->proposed_data ?? [];

        $data = array_intersect_key($payload, array_flip(self::PERSON_FIELDS));

        // لو يُستبدل photo بصورة جديدة → احذف القديمة من التخزين
        if (
            array_key_exists('photo', $data)
            && $person->photo
            && $person->photo !== $data['photo']
        ) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($person->photo);
        }

        $person->fill($data);
        $person->approved_by = $edit->reviewer_id;
        $person->save();

        // ═════════ الأم — تحديث parent_child إن طُلب ═════════
        // نعتبر mother_id موجوداً في proposed_data لو المفتاح موجود (حتى لو null)
        if (array_key_exists('mother_id', $payload)) {
            $newMotherId = $payload['mother_id'] ?: null;
            if ($newMotherId) {
                $this->assertSameTribe($newMotherId, $edit->tribe_id, 'الأم');
            }

            $rel = $person->parentRelation;
            if ($rel) {
                if ($rel->mother_id !== $newMotherId) {
                    $rel->update(['mother_id' => $newMotherId]);
                }
            } elseif ($newMotherId) {
                ParentChild::create([
                    'tribe_id'  => $edit->tribe_id,
                    'father_id' => null,
                    'mother_id' => $newMotherId,
                    'child_id'  => $person->id,
                    'status'    => 'approved',
                ]);
            }
        }

        // ═════════ الأزواج/الزوجات — diff الموجود ═════════
        if (array_key_exists('spouse_ids', $payload) && is_array($payload['spouse_ids'])) {
            $this->syncSpouses($person, array_values(array_unique(array_filter(
                array_map('intval', $payload['spouse_ids'])
            ))));
        }

        return $person;
    }

    /**
     * يزامن قائمة الأزواج/الزوجات مع الموجود:
     *   - يحذف الزيجات التي لم تعد في القائمة
     *   - يضيف الزيجات الجديدة
     *
     * @param  array<int>  $desiredSpouseIds
     */
    protected function syncSpouses(Person $person, array $desiredSpouseIds): void
    {
        $personId = $person->id;
        $tribeId  = $person->tribe_id;

        // الزيجات الحالية لهذا الشخص (كزوج أو زوجة)
        $existing = \App\Models\Marriage::where('tribe_id', $tribeId)
            ->where(function ($q) use ($personId) {
                $q->where('husband_id', $personId)->orWhere('wife_id', $personId);
            })
            ->get();

        $existingSpouseIds = $existing->map(
            fn ($m) => $m->husband_id === $personId ? $m->wife_id : $m->husband_id
        )->all();

        // حذف الزيجات التي تم استبعادها
        foreach ($existing as $m) {
            $spouseId = $m->husband_id === $personId ? $m->wife_id : $m->husband_id;
            if (! in_array($spouseId, $desiredSpouseIds, true)) {
                $m->delete();
            }
        }

        // إضافة الزيجات الجديدة
        foreach ($desiredSpouseIds as $spouseId) {
            if (in_array($spouseId, $existingSpouseIds, true)) {
                continue;
            }
            $this->assertSameTribe($spouseId, $tribeId, 'الزوج/الزوجة');

            $husbandId = $person->isMale() ? $personId : $spouseId;
            $wifeId    = $person->isMale() ? $spouseId : $personId;

            $order = \App\Models\Marriage::where('tribe_id', $tribeId)
                ->where('husband_id', $husbandId)
                ->count() + 1;

            \App\Models\Marriage::create([
                'tribe_id'       => $tribeId,
                'husband_id'     => $husbandId,
                'wife_id'        => $wifeId,
                'marriage_order' => $order,
                'is_current'     => true,
                'status'         => 'approved',
            ]);
        }
    }

    protected function assertSameTribe(int $personId, int $tribeId, string $role): void
    {
        $exists = Person::where('id', $personId)
            ->where('tribe_id', $tribeId)
            ->exists();

        if (! $exists) {
            throw new InvalidArgumentException("{$role} المحدد لا ينتمي لنفس القبيلة.");
        }
    }
}
