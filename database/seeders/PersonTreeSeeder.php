<?php

namespace Database\Seeders;

use App\Models\Marriage;
use App\Models\ParentChild;
use App\Models\Person;
use App\Models\Tribe;
use Illuminate\Database\Seeder;

/**
 * PersonTreeSeeder
 *
 * ينشئ شجرة نسب تجريبية لقبيلة "آل قاسم":
 *
 *   قاسم (الجد الأكبر)
 *     ├─ راشد
 *     │    ├─ صقر
 *     │    │    ├─ سلطان
 *     │    │    │    ├─ محمد
 *     │    │    │    └─ نورة
 *     │    │    └─ هيا
 *     │    └─ خالد
 *     └─ ناصر
 *          └─ فهد
 */
class PersonTreeSeeder extends Seeder
{
    public function run(): void
    {
        $qasimi = Tribe::where('slug', 'qasimi')->firstOrFail();

        $persons = [];

        // المستوى ٠ — الجد الأكبر
        $persons['qasim'] = $this->createMale($qasimi, 'قاسم بن عبدالله', 'قاسم', 1780, 1850, title: 'شيخ القبيلة');

        // المستوى ١
        $persons['rashid'] = $this->createMale($qasimi, 'راشد بن قاسم', 'راشد', 1810, 1885);
        $persons['nasser'] = $this->createMale($qasimi, 'ناصر بن قاسم', 'ناصر', 1815, 1890);

        // المستوى ٢
        $persons['saqr']   = $this->createMale($qasimi, 'صقر بن راشد', 'صقر', 1845, 1920, title: 'شيخ');
        $persons['khaled'] = $this->createMale($qasimi, 'خالد بن راشد', 'خالد', 1850, 1925);
        $persons['fahd']   = $this->createMale($qasimi, 'فهد بن ناصر', 'فهد', 1855, 1930);

        // المستوى ٣
        $persons['sultan']  = $this->createMale($qasimi, 'سلطان بن صقر', 'سلطان', 1880, 1955, title: 'أمير');
        $persons['haya']    = $this->createFemale($qasimi, 'هيا بنت صقر', 'هيا', 1885, 1960);

        // زوجة سلطان
        $persons['latifa']  = $this->createFemale($qasimi, 'لطيفة بنت محمد', 'لطيفة', 1890, 1970);

        // المستوى ٤ — أبناء سلطان
        $persons['mohammed'] = $this->createMale($qasimi, 'محمد بن سلطان', 'محمد', 1915, 1995);
        $persons['noura']    = $this->createFemale($qasimi, 'نورة بنت سلطان', 'نورة', 1920, 2000);

        /* ───────────── علاقات النسب ───────────── */

        // أبناء قاسم
        $this->link($qasimi, $persons['qasim'], null, $persons['rashid']);
        $this->link($qasimi, $persons['qasim'], null, $persons['nasser']);

        // أبناء راشد
        $this->link($qasimi, $persons['rashid'], null, $persons['saqr']);
        $this->link($qasimi, $persons['rashid'], null, $persons['khaled']);

        // أبناء ناصر
        $this->link($qasimi, $persons['nasser'], null, $persons['fahd']);

        // أبناء صقر
        $this->link($qasimi, $persons['saqr'], null, $persons['sultan']);
        $this->link($qasimi, $persons['saqr'], null, $persons['haya']);

        // أبناء سلطان (مع لطيفة)
        $this->link($qasimi, $persons['sultan'], $persons['latifa'], $persons['mohammed']);
        $this->link($qasimi, $persons['sultan'], $persons['latifa'], $persons['noura']);

        /* ───────────── الزيجات ───────────── */
        Marriage::create([
            'tribe_id'       => $qasimi->id,
            'husband_id'     => $persons['sultan']->id,
            'wife_id'        => $persons['latifa']->id,
            'marriage_order' => 1,
            'marriage_year'  => 1910,
            'is_current'     => true,
            'status'         => 'approved',
        ]);

        /* ───────────── تعيين الجذر ───────────── */
        $qasimi->update(['root_person_id' => $persons['qasim']->id]);
    }

    protected function createMale(Tribe $tribe, string $nameAr, string $short, ?int $birth, ?int $death, ?string $title = null): Person
    {
        return Person::create([
            'tribe_id'      => $tribe->id,
            'name_ar'       => $nameAr,
            'short_name_ar' => $short,
            'gender'        => 'male',
            'title'         => $title,
            'birth_year'    => $birth,
            'death_year'    => $death,
            'status'        => 'approved',
        ]);
    }

    protected function createFemale(Tribe $tribe, string $nameAr, string $short, ?int $birth, ?int $death, ?string $title = null): Person
    {
        return Person::create([
            'tribe_id'      => $tribe->id,
            'name_ar'       => $nameAr,
            'short_name_ar' => $short,
            'gender'        => 'female',
            'title'         => $title,
            'birth_year'    => $birth,
            'death_year'    => $death,
            'status'        => 'approved',
        ]);
    }

    protected function link(Tribe $tribe, ?Person $father, ?Person $mother, Person $child): void
    {
        ParentChild::create([
            'tribe_id'  => $tribe->id,
            'father_id' => $father?->id,
            'mother_id' => $mother?->id,
            'child_id'  => $child->id,
            'status'    => 'approved',
        ]);
    }
}
