<?php

namespace App\Http\Controllers;

use App\Models\Person;
use App\Models\Tribe;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportController extends Controller
{
    /**
     * تصدير أشخاص القبيلة كملف Excel (.xlsx) منسّق RTL.
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
            ->with(['father', 'mother'])
            ->orderBy('id')
            ->get();

        $lifeLabels = ['living' => 'حيّ', 'deceased' => 'متوفى', 'unknown' => 'غير معروف'];

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('الأشخاص');
        $sheet->setRightToLeft(true);

        $headers = ['#', 'الاسم الكامل', 'الاسم المختصر', 'الجنس', 'اللقب', 'الميلاد', 'الوفاة', 'الحالة', 'الأب', 'الأم'];
        $sheet->fromArray($headers, null, 'A1');

        $row = 2;
        foreach ($persons as $p) {
            $sheet->fromArray([
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
            ], null, "A{$row}");
            $row++;
        }

        $lastCol = 'J';
        $lastRow = max(1, $row - 1);

        // تنسيق صفّ الترويسة
        $headerStyle = $sheet->getStyle("A1:{$lastCol}1");
        $headerStyle->getFont()->setBold(true)->getColor()->setRGB('FFFFFF');
        $headerStyle->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('8B6914');
        $headerStyle->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER);
        $sheet->getRowDimension(1)->setRowHeight(24);

        // حدود + محاذاة للجدول كله
        $sheet->getStyle("A1:{$lastCol}{$lastRow}")
            ->getBorders()->getAllBorders()
            ->setBorderStyle(Border::BORDER_THIN)->getColor()->setRGB('E0D2AE');

        foreach (range('A', $lastCol) as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }
        $sheet->freezePane('A2');

        $writer = new Xlsx($spreadsheet);
        $filename = "nasab-{$tribe->slug}-persons.xlsx";

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Cache-Control' => 'no-store, no-cache',
        ]);
    }
}
