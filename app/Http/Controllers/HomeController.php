<?php

namespace App\Http\Controllers;

use App\Models\LandingSection;
use App\Models\Tribe;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        $sections = LandingSection::query()
            ->visible()
            ->ordered()
            ->get()
            ->map(fn (LandingSection $s) => [
                'id'       => $s->id,
                'type'     => $s->type,
                'title'    => $s->title,
                'subtitle' => $s->subtitle,
                'body'     => $s->body,
                'icon'     => $s->icon,
                'extra'    => $s->extra,
            ])
            ->values();

        return Inertia::render('Welcome', [
            'sections' => $sections,
            'tribe'    => Tribe::where('is_active', true)->first(),
        ]);
    }
}
