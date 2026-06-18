<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('persons', function (Blueprint $table) {
            $table->enum('life_status', ['living', 'deceased', 'unknown'])
                ->default('unknown')
                ->after('death_year');
        });

        // backfill: any row with a death_year is clearly deceased
        DB::table('persons')
            ->whereNotNull('death_year')
            ->update(['life_status' => 'deceased']);
    }

    public function down(): void
    {
        Schema::table('persons', function (Blueprint $table) {
            $table->dropColumn('life_status');
        });
    }
};
