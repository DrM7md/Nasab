<?php

namespace App\Http\Controllers;

use App\Models\Person;
use App\Models\Tribe;
use App\Services\LineageChain;
use App\Services\PdfCertificate;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class CertificateController extends Controller
{
    public function __construct(
        protected PdfCertificate $pdf,
        protected LineageChain $lineage,
    ) {}

    /**
     * صفحة معاينة الوثيقة (React/Inertia).
     */
    public function show(Tribe $tribe, Person $person): Response
    {
        abort_unless($person->tribe_id === $tribe->id, 404);

        $chain = $this->lineage->getAncestorChain($person);

        return Inertia::render('Certificate/Show', [
            'person' => [
                'id'            => $person->id,
                'short_name_ar' => $person->short_name_ar,
                'name_ar'       => $person->name_ar,
                'gender'        => $person->gender,
                'title'         => $person->title,
                'birth_year'    => $person->birth_year,
                'death_year'    => $person->death_year,
                'birth_place'   => $person->birth_place,
                'death_place'   => $person->death_place,
                'photo'         => $person->photo,
            ],
            'chain' => $chain->map(fn ($p) => [
                'id'            => $p->id,
                'short_name_ar' => $p->short_name_ar,
                'gender'        => $p->gender,
                'title'         => $p->title,
            ])->values(),
            'formattedLineage' => $this->lineage->formatChain($chain),
            'issueDate'        => now()->format('Y-m-d'),
        ]);
    }

    /**
     * تحميل الوثيقة كـ PDF.
     */
    public function download(Tribe $tribe, Person $person): HttpResponse
    {
        abort_unless($person->tribe_id === $tribe->id, 404);

        $binary = $this->pdf->generate($person);
        $filename = $this->pdf->filename($person);

        return response($binary, 200, [
            'Content-Type'        => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    /**
     * عرض الـ PDF inline في المتصفح (للمعاينة).
     */
    public function inline(Tribe $tribe, Person $person): HttpResponse
    {
        abort_unless($person->tribe_id === $tribe->id, 404);

        $binary = $this->pdf->generate($person);
        $filename = $this->pdf->filename($person);

        return response($binary, 200, [
            'Content-Type'        => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . $filename . '"',
        ]);
    }
}
