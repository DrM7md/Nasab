<?php

namespace Database\Seeders;

use App\Models\Tribe;
use Illuminate\Database\Seeder;

class TribeSeeder extends Seeder
{
    public function run(): void
    {
        Tribe::create([
            'name_ar'          => 'آل قاسم',
            'name_en'          => 'Al-Qasim',
            'slug'             => 'qasimi',
            'theme_color'      => '#8B6914',
            'description_ar'   => 'قبيلة آل قاسم العربية — شجرة نسب عريقة تمتد لقرون.',
            'is_active'        => true,
            'subscription_plan' => 'pro',
        ]);

        Tribe::create([
            'name_ar'          => 'آل بدر',
            'name_en'          => 'Al-Badr',
            'slug'             => 'badr',
            'theme_color'      => '#6B4E3D',
            'description_ar'   => 'قبيلة آل بدر — نسب متجذر في الجزيرة العربية.',
            'is_active'        => true,
            'subscription_plan' => 'free',
        ]);
    }
}
