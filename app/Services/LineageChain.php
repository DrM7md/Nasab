<?php

namespace App\Services;

use App\Models\Person;
use Illuminate\Support\Collection;

/**
 * LineageChain
 *
 * يبني سلسلة الأجداد لشخص ما بالصعود عبر father_id فقط
 * (سلسلة النسب الأبوية — كما هي العادة في الأسماء العربية).
 *
 * مثال للناتج: [سلطان، صقر، راشد، قاسم]
 */
class LineageChain
{
    public const MAX_DEPTH = 50; // حماية من الحلقات اللانهائية

    /**
     * @return Collection<int, Person>
     */
    public function getAncestorChain(Person $person): Collection
    {
        $chain = collect([$person]);
        $current = $person;
        $depth = 0;

        while (($father = $current->father) && $depth < self::MAX_DEPTH) {
            // حماية: لو ظهر شخص مكرر (دورة)، توقف
            if ($chain->contains('id', $father->id)) {
                break;
            }
            $chain->push($father);
            $current = $father;
            $depth++;
        }

        return $chain;
    }

    /**
     * صياغة السلسلة كنص: "سلطان بن صقر بن راشد..."
     * الرابط الأول يتحدد بجنس الشخص الأصلي ($chain[0]):
     *   - ذكر → بن | أنثى → بنت
     * بقية الروابط دائماً "بن" (لأنها آباء).
     */
    public function formatChain(Collection $chain): string
    {
        if ($chain->isEmpty()) {
            return '';
        }

        $parts = [];
        foreach ($chain as $index => $person) {
            if ($index === 0) {
                $parts[] = $person->short_name_ar;
            } else {
                $previous = $chain[$index - 1];
                $connector = $previous->gender === 'female' ? 'بنت' : 'بن';
                $parts[] = $connector;
                $parts[] = $person->short_name_ar;
            }
        }

        return implode(' ', $parts);
    }

    /**
     * يُرجع خريطة [person_id => depth] لكل الأجداد.
     * يُستخدم في KinshipFinder (المرحلة القادمة).
     *
     * @return array<int, int>
     */
    public function getAncestorMap(Person $person): array
    {
        $map = [$person->id => 0];
        $current = $person;
        $depth = 0;

        while (($father = $current->father) && $depth < self::MAX_DEPTH) {
            if (isset($map[$father->id])) {
                break;
            }
            $depth++;
            $map[$father->id] = $depth;
            $current = $father;
        }

        return $map;
    }
}
