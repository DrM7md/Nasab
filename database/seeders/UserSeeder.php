<?php

namespace Database\Seeders;

use App\Models\Tribe;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $qasimi = Tribe::where('slug', 'qasimi')->first();

        // Super Admin — لا ينتمي لقبيلة
        User::create([
            'name'     => 'مدير عام',
            'email'    => 'super@nasab.test',
            'password' => Hash::make('password'),
            'role'     => User::ROLE_SUPER_ADMIN,
            'email_verified_at' => now(),
        ]);

        // Tribe Admin لقبيلة القاسمي
        User::create([
            'name'     => 'مدير قبيلة القاسمي',
            'email'    => 'admin@qasimi.test',
            'password' => Hash::make('password'),
            'tribe_id' => $qasimi->id,
            'role'     => User::ROLE_TRIBE_ADMIN,
            'email_verified_at' => now(),
        ]);

        // Moderator
        User::create([
            'name'     => 'مراجع',
            'email'    => 'mod@qasimi.test',
            'password' => Hash::make('password'),
            'tribe_id' => $qasimi->id,
            'role'     => User::ROLE_MODERATOR,
            'email_verified_at' => now(),
        ]);

        // Member
        User::create([
            'name'     => 'عضو القبيلة',
            'email'    => 'member@qasimi.test',
            'password' => Hash::make('password'),
            'tribe_id' => $qasimi->id,
            'role'     => User::ROLE_MEMBER,
            'email_verified_at' => now(),
        ]);
    }
}
