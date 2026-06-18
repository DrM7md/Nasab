<?php

namespace App\Http\Controllers;

use App\Models\Person;
use App\Models\Tribe;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportController extends Controller
{
    /**
     * تصدير أشخاص القبيلة كملف CSV (UTF-8 BOM ليُفتح عربيًا في Excel).
     * مُقيَّد بقدرة الباقة data_export + مشرفي القبيلة.
     */
    public function persons(Tribe $tribe, Request $request): StreamedResponse
    {
        $user = $request->user();

        abort_unless(
            $user && ($user->isSuperAdmin() || ($user->canModerate() && $user->tribe_id === $tribe->id)),
            403,
        );
        abort_unless(
            $user->isSuperAdmin() || $tribe->hasCapability('data_export'),
            403,
            'تصدير البيانات غير متاح في باقة قبيلتك — رقّ الباقة لتفعيله.',
        );

        $persons = Person::where('tribe_id', $tribe->id)
            ->where('status', 'approved')
            ->with(['father:id,short_name_ar', 'mother:id,short_name_ar'])
            ->orderBy('id')
            ->get();

        $lifeLabels = ['living' => 'حيّ', 'deceased' => 'متوفى', 'unknown' => 'غير معروف'];

        $callback = function () use ($persons, $lifeLabels) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF"); // BOM
            fputcsv($out, ['#', 'الاسم الكامل', 'الاسم المختصر', 'الجنس', 'اللقب', 'الميلاد', 'الوفاة', 'الحالة', 'الأب', 'الأم']);

            foreach ($persons as $p) {
                fputcsv($out, [
                    $p->id,
                    $p->name_ar,
                    $p->short_name_ar,
                    $p->gender === 'female' ? 'أنثى' : 'ذكر',
                    $p->title,
                    $p->birth_year,
                    $p->death_year,
                    $lifeLabels[$p->life_status] ?? '',
                    $p->father?->short_name_ar,
                    $p->mother?->short_name_ar,
                ]);
            }
            fclose($out);
        };

        return response()->streamDownload(
            $callback,
            "nasab-{$tribe->slug}-persons.csv",
            ['Content-Type' => 'text/csv; charset=UTF-8'],
        );
    }
}
