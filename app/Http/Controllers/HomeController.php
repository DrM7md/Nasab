<?php

namespace App\Http\Controllers;

use App\Models\LandingSection;
use App\Models\Package;
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

        $packages = Package::where('is_active', true)
            ->ordered()
            ->get()
            ->map(fn (Package $p) => [
                'id'            => $p->id,
                'name_ar'       => $p->name_ar,
                'description_ar' => $p->description_ar,
                'price_monthly' => (float) $p->price_monthly,
                'price_yearly'  => (float) $p->price_yearly,
                'currency'      => $p->currency,
                'features'      => $p->features ?? [],
                'max_persons'   => $p->max_persons,
                'max_members'   => $p->max_members,
                'color'         => $p->color,
                'is_featured'   => $p->is_featured,
            ])
            ->values();

        return Inertia::render('Welcome', [
            'sections' => $sections,
            'packages' => $packages,
            'tribe'    => Tribe::where('is_active', true)->first(),
        ]);
    }
}
