<?php

namespace App\Services;

use App\Models\Person;
use Illuminate\Support\Facades\View;
use Mpdf\Mpdf;

/**
 * PdfCertificate
 *
 * يولّد وثيقة نسب PDF لشخص معين باستخدام mPDF
 * (دعم كامل للعربية وتشكيل الحروف + RTL).
 */
class PdfCertificate
{
    public function __construct(protected LineageChain $lineage) {}

    /**
     * يولّد PDF كسلسلة binary ويُعيدها.
     */
    public function generate(Person $person): string
    {
        $tribe = $person->tribe;
        $chain = $this->lineage->getAncestorChain($person);

        $html = View::make('pdf.certificate', [
            'person'            => $person,
            'tribe'             => $tribe,
            'chain'             => $chain,
            'formattedLineage'  => $this->lineage->formatChain($chain),
            'issueDate'         => now()->format('Y-m-d'),
        ])->render();

        $mpdf = new Mpdf([
            'mode'          => 'utf-8',
            'format'        => 'A4',
            'orientation'   => 'P',
            'default_font'  => 'dejavusans',
            'tempDir'       => storage_path('app/mpdf-temp'),
            'margin_top'    => 15,
            'margin_bottom' => 15,
            'margin_left'   => 15,
            'margin_right'  => 15,
        ]);

        $mpdf->SetDirectionality('rtl');
        $mpdf->autoScriptToLang = true;
        $mpdf->autoLangToFont = true;
        $mpdf->SetTitle('وثيقة نسب ' . $person->short_name_ar);
        $mpdf->SetAuthor($tribe->name_ar);

        $mpdf->WriteHTML($html);

        return $mpdf->Output('', \Mpdf\Output\Destination::STRING_RETURN);
    }

    /**
     * اسم الملف المقترح.
     */
    public function filename(Person $person): string
    {
        return 'nasab-' . $person->id . '-' . preg_replace('/\s+/', '-', $person->short_name_ar) . '.pdf';
    }
}
