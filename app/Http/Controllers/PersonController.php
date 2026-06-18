<?php

namespace App\Http\Controllers;

use App\Models\Person;
use App\Models\Tribe;
use App\Services\LineageChain;
use App\Services\TreeBuilder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PersonController extends Controller
{
    public function __construct(protected LineageChain $lineage) {}

    /**
     * عرض ملف الشخص الكامل.
     */
    public function show(Tribe $tribe, Person $person): Response
    {
        abort_unless($person->tribe_id === $tribe->id, 404);

        $person->load([
            'father',
            'mother',
            'marriages.wife',
            'marriages.husband',
            'parentRelation',
            'father.marriagesAsHusband.wife',
        ]);

        $ancestorChain = $this->lineage->getAncestorChain($person);

        // الأبناء — مع الأم لكل ابن للسماح بالتصفية في الواجهة
        $childrenColumn = $person->isFemale() ? 'mother_id' : 'father_id';
        $children = Person::where('tribe_id', $tribe->id)
            ->whereHas('parentRelation', fn ($q) =>
                $q->where($childrenColumn, $person->id)
            )
            ->with(['parentRelation.father', 'parentRelation.mother'])
            ->orderBy('birth_year')
            ->get();

        return Inertia::render('Person/Show', [
            'person' => [
                'id'             => $person->id,
                'tribe_id'       => $person->tribe_id,
                'name_ar'        => $person->name_ar,
                'name_en'        => $person->name_en,
                'short_name_ar'  => $person->short_name_ar,
                'gender'         => $person->gender,
                'title'          => $person->title,
                'birth_year'     => $person->birth_year,
                'death_year'     => $person->death_year,
                'life_status'    => $person->life_status,
                'birth_place'    => $person->birth_place,
                'death_place'    => $person->death_place,
                'photo'          => $person->photo ? asset('storage/' . $person->photo) : null,
                'bio_ar'         => $person->bio_ar,
                'status'         => $person->status,
            ],

            'father' => $person->father ? $this->brief($person->father) : null,
            'mother' => $person->mother ? $this->brief($person->mother) : null,

            'ancestorChain' => $ancestorChain->map(fn ($p) => [
                'id'            => $p->id,
                'short_name_ar' => $p->short_name_ar,
                'gender'        => $p->gender,
                'title'         => $p->title,
            ])->values(),

            'formattedLineage' => $this->lineage->formatChain($ancestorChain),

            'marriages' => $person->marriages->map(function ($m) use ($person) {
                $spouse = $person->isFemale() ? $m->husband : $m->wife;
                return [
                    'id'              => $m->id,
                    'marriage_order'  => $m->marriage_order,
                    'marriage_year'   => $m->marriage_year,
                    'divorce_year'    => $m->divorce_year,
                    'is_current'      => $m->is_current,
                    'spouse'          => $spouse ? $this->brief($spouse) : null,
                ];
            })->values(),

            'children' => $children->map(fn ($child) => [
                ...$this->brief($child),
                'mother_id' => $child->parentRelation?->mother_id,
                'mother'    => $child->parentRelation?->mother
                    ? $this->brief($child->parentRelation->mother) : null,
            ])->values(),

            'siblings'     => $person->siblings()->map(fn ($p) => $this->brief($p))->values(),
            'fullSiblings' => $person->fullSiblings()->map(fn ($p) => $this->brief($p))->values(),

            // ═════════ بيانات إضافية للتعديل (EditPersonModal) ═════════

            // الأزواج/الزوجات الحاليون كاملين (للـ chips في وضع التعديل)
            'currentSpouses' => $person->marriages
                ->map(fn ($m) => $person->isFemale() ? $m->husband : $m->wife)
                ->filter()
                ->values()
                ->map(fn ($s) => $this->brief($s))
                ->values(),

            // معرّف الأم الحالي + بياناتها
            'currentMotherId' => $person->parentRelation?->mother_id,

            // زوجات الأب (للاختيار الذكي للأم لو كان للأب زوجات معروفة)
            'fatherWives' => $person->father && $person->father->isMale()
                ? $person->father->marriagesAsHusband
                    ->map(fn ($m) => $m->wife)
                    ->filter()
                    ->values()
                    ->map(fn ($w) => $this->brief($w))
                    ->values()
                : [],
        ]);
    }

    /**
     * إنشاء سريع لشخص (للمشرفين فقط) — يُستخدم في فورم إضافة شخص لإنشاء
     * زوجة/زوج/أم بسرعة دون مغادرة النموذج.
     *
     * يُرجع JSON ببيانات الشخص الجديد لإضافته مباشرة.
     */
    public function store(Tribe $tribe, Request $request): JsonResponse
    {
        $user = $request->user();

        abort_unless(
            $user && (
                $user->isSuperAdmin()
                || ($user->canModerate() && $user->tribe_id === $tribe->id)
            ),
            403,
            'الإنشاء السريع متاح للمشرفين فقط.'
        );

        if (! $user->isSuperAdmin() && ! $tribe->canAddPerson()) {
            return response()->json([
                'message' => "بلغت قبيلتك الحدّ الأقصى لباقتها ({$tribe->personLimit()} شخص). يلزم ترقية الباقة لإضافة المزيد.",
            ], 422);
        }

        $validated = $request->validate([
            'name_ar'       => 'required|string|max:255',
            'short_name_ar' => 'required|string|max:100',
            'gender'        => 'required|in:male,female',
            'birth_year'    => 'nullable|integer|min:1000|max:2200',
            'death_year'    => 'nullable|integer|min:1000|max:2200|gte:birth_year',
            'title'         => 'nullable|string|max:50',
        ]);

        $person = Person::create([
            ...$validated,
            'tribe_id'    => $tribe->id,
            'status'      => 'approved',
            'added_by'    => $user->id,
            'approved_by' => $user->id,
        ]);

        TreeBuilder::invalidate($tribe->id);

        return response()->json([
            'id'            => $person->id,
            'name_ar'       => $person->name_ar,
            'short_name_ar' => $person->short_name_ar,
            'gender'        => $person->gender,
            'title'         => $person->title,
            'birth_year'    => $person->birth_year,
            'death_year'    => $person->death_year,
            'photo'         => null,
        ]);
    }

    /**
     * اختصار بيانات شخص (للروابط والقوائم).
     */
    protected function brief(Person $p): array
    {
        return [
            'id'            => $p->id,
            'name_ar'       => $p->name_ar,
            'short_name_ar' => $p->short_name_ar,
            'gender'        => $p->gender,
            'title'         => $p->title,
            'birth_year'    => $p->birth_year,
            'death_year'    => $p->death_year,
            'life_status'   => $p->life_status,
            'photo'         => $p->photo ? asset('storage/' . $p->photo) : null,
        ];
    }
}
