<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone', 30)->nullable()->after('email');
            $table->string('national_id', 50)->nullable()->unique()->after('phone');
            $table->string('nationality', 60)->nullable()->after('national_id');
            $table->string('id_card_photo')->nullable()->after('nationality');

            // القبيلة المطلوبة عند التسجيل (قبل الاعتماد)
            $table->foreignId('requested_tribe_id')
                ->nullable()
                ->after('tribe_id')
                ->constrained('tribes')
                ->nullOnDelete();

            $table->index('requested_tribe_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['requested_tribe_id']);
            $table->dropColumn([
                'phone', 'national_id', 'nationality',
                'id_card_photo', 'requested_tribe_id',
            ]);
        });
    }
};
