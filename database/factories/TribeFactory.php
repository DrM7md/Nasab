<?php

namespace Database\Factories;

use App\Models\Tribe;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class TribeFactory extends Factory
{
    protected $model = Tribe::class;

    public function definition(): array
    {
        $nameAr = $this->faker->randomElement([
            'القاسمي', 'البدري', 'المطيري', 'العنزي', 'الشمري',
        ]);

        return [
            'name_ar'            => $nameAr,
            'name_en'            => ucfirst($this->faker->slug(1)),
            'slug'               => Str::slug($this->faker->unique()->word()),
            'theme_color'        => '#8B6914',
            'description_ar'     => $this->faker->sentence(8),
            'is_active'          => true,
            'subscription_plan'  => 'free',
        ];
    }
}
