<?php

namespace Database\Factories;

use App\Models\Person;
use App\Models\Tribe;
use Illuminate\Database\Eloquent\Factories\Factory;

class PersonFactory extends Factory
{
    protected $model = Person::class;

    protected static array $maleNames = [
        'محمد', 'أحمد', 'علي', 'حسن', 'عمر', 'يوسف', 'إبراهيم', 'إسماعيل',
        'سلطان', 'صقر', 'راشد', 'مطر', 'كايد', 'فهد', 'خالد', 'سعيد',
        'عبدالله', 'عبدالرحمن', 'ناصر', 'طلال', 'بدر', 'فيصل', 'ماجد',
    ];

    protected static array $femaleNames = [
        'فاطمة', 'عائشة', 'مريم', 'زينب', 'خديجة', 'آمنة',
        'هيا', 'لطيفة', 'شيخة', 'موزة', 'سارة', 'نورة', 'ريم', 'مها',
    ];

    public function definition(): array
    {
        $gender = $this->faker->randomElement(['male', 'female']);
        $name = $this->faker->randomElement(
            $gender === 'male' ? self::$maleNames : self::$femaleNames
        );

        return [
            'tribe_id'       => Tribe::factory(),
            'name_ar'        => $name,
            'short_name_ar'  => $name,
            'gender'         => $gender,
            'birth_year'     => $this->faker->numberBetween(1900, 2010),
            'status'         => 'approved',
        ];
    }

    public function male(): self
    {
        return $this->state(fn () => [
            'gender'        => 'male',
            'name_ar'       => $this->faker->randomElement(self::$maleNames),
            'short_name_ar' => $this->faker->randomElement(self::$maleNames),
        ]);
    }

    public function female(): self
    {
        return $this->state(fn () => [
            'gender'        => 'female',
            'name_ar'       => $this->faker->randomElement(self::$femaleNames),
            'short_name_ar' => $this->faker->randomElement(self::$femaleNames),
        ]);
    }
}
