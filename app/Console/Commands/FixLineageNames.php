<?php

namespace App\Console\Commands;

use App\Models\Person;
use App\Models\Tribe;
use App\Services\LineageChain;
use App\Services\TreeBuilder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * يُصحّح حقل name_ar لكل شخص ليُطابق سلسلة نسبه الفعلية.
 *
 * بشكل افتراضي يعمل فقط على الأشخاص الذين name_ar = short_name_ar
 * (الحالة التي يكون فيها المستخدم كتب الاسم المختصر فقط).
 *
 * مع --force يعيد كتابة الكل من سلسلة النسب الحقيقية.
 */
class FixLineageNames extends Command
{
    protected $signature = 'nasab:fix-lineage-names
        {--tribe= : slug القبيلة لحصر العملية فيها}
        {--dry-run : معاينة فقط بدون كتابة}
        {--force : إعادة كتابة كل name_ar حتى المكتمل}';

    protected $description = 'يُصحح الاسم الكامل (name_ar) للأشخاص ليُطابق سلسلة النسب';

    public function handle(LineageChain $lineage): int
    {
        $query = Person::query()->orderBy('id');

        if ($slug = $this->option('tribe')) {
            $tribe = Tribe::where('slug', $slug)->first();
            if (! $tribe) {
                $this->error("قبيلة بـ slug='{$slug}' غير موجودة.");
                return self::FAILURE;
            }
            $query->where('tribe_id', $tribe->id);
            $this->info("نطاق العملية: قبيلة {$tribe->name_ar}");
        } else {
            $this->info('نطاق العملية: كل القبائل');
        }

        $persons = $query->get();
        $this->info("إجمالي الأشخاص في النطاق: {$persons->count()}");

        $dryRun = (bool) $this->option('dry-run');
        $force  = (bool) $this->option('force');

        $changes = [];
        $skipped = 0;
        $alreadyCorrect = 0;

        foreach ($persons as $person) {
            $chain = $lineage->getAncestorChain($person);
            $expected = $lineage->formatChain($chain);

            $current = trim((string) $person->name_ar);

            // إذا الاسم الحالي مطابق للمتوقع → لا حاجة للتعديل
            if ($current === $expected) {
                $alreadyCorrect++;
                continue;
            }

            // الكشف عن "الاسم الناقص": مساوٍ تماماً للاسم المختصر
            $isIncomplete = $current === trim((string) $person->short_name_ar);

            if (! $force && ! $isIncomplete) {
                // اسم مختلف لكنه ليس "ناقص" — احترم تعديل المستخدم اليدوي
                $skipped++;
                continue;
            }

            $changes[] = [
                'id'      => $person->id,
                'tribe'   => $person->tribe_id,
                'before'  => $current,
                'after'   => $expected,
            ];
        }

        if (empty($changes)) {
            $this->info('');
            $this->info("✓ لا توجد تغييرات. مطابق سابقاً: {$alreadyCorrect} | متروك: {$skipped}");
            return self::SUCCESS;
        }

        // عرض الجدول
        $this->info('');
        $this->info('التغييرات المتوقعة:');
        $this->table(
            ['ID', 'قبيلة', 'قبل', 'بعد'],
            collect($changes)->map(fn ($c) => [
                $c['id'],
                $c['tribe'],
                $c['before'],
                $c['after'],
            ])->all(),
        );

        $this->info('───');
        $this->info("سيُحدَّث: " . count($changes) . " | مطابق سابقاً: {$alreadyCorrect} | متروك: {$skipped}");

        if ($dryRun) {
            $this->warn('(dry-run) لم يُكتب أي شيء. أعد التشغيل بدون --dry-run للتطبيق.');
            return self::SUCCESS;
        }

        if (! $this->confirm('هل تريد تطبيق التغييرات الآن؟', true)) {
            $this->warn('أُلغيت العملية.');
            return self::SUCCESS;
        }

        // تطبيق ضمن transaction
        DB::transaction(function () use ($changes) {
            foreach ($changes as $c) {
                Person::where('id', $c['id'])->update(['name_ar' => $c['after']]);
            }
        });

        // إبطال كاش الشجرة لكل القبائل المتأثرة
        $tribeIds = array_unique(array_column($changes, 'tribe'));
        foreach ($tribeIds as $tid) {
            TreeBuilder::invalidate((int) $tid);
        }

        $this->info('');
        $this->info('✓ تم تطبيق التغييرات بنجاح.');
        $this->info('✓ تم إبطال كاش الشجرة للقبائل: ' . implode(', ', $tribeIds));

        return self::SUCCESS;
    }
}
