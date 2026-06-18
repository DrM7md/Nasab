<?php

namespace App\Services;

use App\Models\Person;

/**
 * KinshipFinder
 *
 * يُحدد صلة القرابة بين شخصين بخوارزمية BFS:
 *   1) يبني خريطة [ancestor_id => depth] لكل شخص (عبر father_id فقط — السلسلة الأبوية)
 *   2) يوجد الجد المشترك الأقرب (LCA)
 *   3) يصف العلاقة عربياً بحسب depth_a و depth_b وجنسي الشخصين
 */
class KinshipFinder
{
    public function __construct(protected LineageChain $lineage) {}

    /**
     * @return array{
     *     common_ancestor: Person|null,
     *     depth_a: int,
     *     depth_b: int,
     *     relation_label: string
     * }
     */
    public function find(Person $a, Person $b): array
    {
        if ($a->id === $b->id) {
            return [
                'common_ancestor' => $a,
                'depth_a'         => 0,
                'depth_b'         => 0,
                'relation_label'  => 'نفس الشخص',
            ];
        }

        $mapA = $this->lineage->getAncestorMap($a);
        $mapB = $this->lineage->getAncestorMap($b);

        $common = array_intersect_key($mapA, $mapB);

        if (empty($common)) {
            return [
                'common_ancestor' => null,
                'depth_a'         => -1,
                'depth_b'         => -1,
                'relation_label'  => 'لا توجد صلة قرابة مباشرة',
            ];
        }

        // LCA = الشخص المشترك ذو أقل (depthA + depthB)
        $lcaId = null;
        $minSum = PHP_INT_MAX;
        foreach ($common as $id => $_) {
            $sum = $mapA[$id] + $mapB[$id];
            if ($sum < $minSum) {
                $minSum = $sum;
                $lcaId = $id;
            }
        }

        $depthA = $mapA[$lcaId];
        $depthB = $mapB[$lcaId];

        return [
            'common_ancestor' => Person::find($lcaId),
            'depth_a'         => $depthA,
            'depth_b'         => $depthB,
            'relation_label'  => $this->describeRelation($depthA, $depthB, $a, $b),
        ];
    }

    /**
     * يصف صلة A إلى B عربياً.
     *
     *   dA, dB = عمق الجد المشترك من A ومن B
     *   dA=0 يعني B هو الجد المشترك (أي B هو جد A أو B نفسه)
     *   dB=0 يعني A هو الجد المشترك (أي A هو جد B)
     */
    protected function describeRelation(int $dA, int $dB, Person $a, Person $b): string
    {
        $aIsMale = $a->isMale();

        // ═════════ خط الأبوة المباشر ═════════
        if ($dB === 0) {
            // A ينتمي لـ B في سلسلة النسب — A هو ابن/حفيد/.. B
            return match ($dA) {
                1 => $aIsMale ? 'ابن' : 'ابنة',
                2 => $aIsMale ? 'حفيد' : 'حفيدة',
                3 => $aIsMale ? 'ابن الحفيد' : 'ابنة الحفيد',
                default => 'من ذريته (الجيل الـ' . $dA . ')',
            };
        }

        if ($dA === 0) {
            // B ينتمي لسلسلة نسب A — A هو أب/جد/.. B
            return match ($dB) {
                1 => $aIsMale ? 'أب' : 'أم',
                2 => $aIsMale ? 'جد' : 'جدة',
                3 => $aIsMale ? 'جد الأب' : 'جدة الأب',
                default => 'من الأجداد (الجيل الـ' . $dB . ')',
            };
        }

        // ═════════ الإخوة ═════════
        if ($dA === 1 && $dB === 1) {
            return $aIsMale ? 'أخ' : 'أخت';
        }

        // ═════════ العم/العمة وأولاد العم ═════════
        // dA=2, dB=1: A هو ابن أخي B (من ناحية B: A هو ابن أخي)
        if ($dA === 2 && $dB === 1) {
            return $aIsMale ? 'ابن أخ' : 'ابنة أخ';
        }

        // dA=1, dB=2: A هو عم B
        if ($dA === 1 && $dB === 2) {
            return $aIsMale ? 'عم' : 'عمة';
        }

        // dA=2, dB=2: أبناء عم
        if ($dA === 2 && $dB === 2) {
            return $aIsMale ? 'ابن عم' : 'ابنة عم';
        }

        // dA=3, dB=2: A هو ابن ابن عم B (حفيد العم)
        if ($dA === 3 && $dB === 2) {
            return $aIsMale ? 'ابن ابن عم' : 'ابنة ابن عم';
        }

        // dA=2, dB=3: A هو عم أب B (عم الأب)
        if ($dA === 2 && $dB === 3) {
            return $aIsMale ? 'عم الأب' : 'عمة الأب';
        }

        // dA=3, dB=3: أبناء عم الأب
        if ($dA === 3 && $dB === 3) {
            return $aIsMale ? 'ابن عم الأب' : 'ابنة عم الأب';
        }

        // ═════════ عام ═════════
        $distance = $dA + $dB;
        return "قريب من الدرجة {$distance}";
    }
}
