<?php

namespace Database\Seeders;

use App\Models\Package;
use App\Models\Tribe;
use Illuminate\Database\Seeder;

class PackageSeeder extends Seeder
{
    public function run(): void
    {
        $packages = [
            [
                'name_ar'       => 'مجاني',
                'slug'          => 'free',
                'description_ar' => 'للبدء وتوثيق نواة العائلة — مجانًا للأبد.',
                'price_monthly' => 0,
                'price_yearly'  => 0,
                'currency'      => 'SAR',
                'features'      => ['شجرة تفاعلية', 'حتى 100 شخص', 'بحث وصلة قرابة', 'وثيقة نسب أساسية'],
                'max_persons'   => 100,
                'max_members'   => 5,
                'color'         => '#A08070',
                'is_featured'   => false,
                'is_active'     => true,
                'sort_order'    => 10,
            ],
            [
                'name_ar'       => 'احترافي',
                'slug'          => 'pro',
                'description_ar' => 'للقبائل النشطة التي تنمو شجرتها باستمرار.',
                'price_monthly' => 49,
                'price_yearly'  => 490,
                'currency'      => 'SAR',
                'features'      => ['كل مزايا المجاني', 'حتى 5000 شخص', 'أعضاء غير محدودين', 'نظام موافقات', 'وثائق نسب مخصّصة', 'دعم ذو أولوية'],
                'max_persons'   => 5000,
                'max_members'   => null,
                'color'         => '#8B6914',
                'is_featured'   => true,
                'is_active'     => true,
                'sort_order'    => 20,
            ],
            [
                'name_ar'       => 'مؤسسي',
                'slug'          => 'enterprise',
                'description_ar' => 'للاتحادات والمجالس القبلية الكبرى بلا حدود.',
                'price_monthly' => 199,
                'price_yearly'  => 1990,
                'currency'      => 'SAR',
                'features'      => ['كل مزايا الاحترافي', 'أشخاص غير محدودين', 'نطاق فرعي مخصّص', 'تصدير البيانات', 'مدير حساب مخصّص'],
                'max_persons'   => null,
                'max_members'   => null,
                'color'         => '#3D2B1F',
                'is_featured'   => false,
                'is_active'     => true,
                'sort_order'    => 30,
            ],
        ];

        foreach ($packages as $data) {
            Package::updateOrCreate(['slug' => $data['slug']], $data);
        }

        // ربط القبائل الحالية بالباقة المطابقة لخطتها القديمة
        $map = [
            'free'       => Package::where('slug', 'free')->value('id'),
            'pro'        => Package::where('slug', 'pro')->value('id'),
            'enterprise' => Package::where('slug', 'enterprise')->value('id'),
        ];

        Tribe::query()->whereNull('package_id')->get()->each(function (Tribe $tribe) use ($map) {
            $tribe->update(['package_id' => $map[$tribe->subscription_plan] ?? $map['free']]);
        });
    }
}
