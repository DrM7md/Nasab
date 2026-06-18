<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('marriages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tribe_id')->constrained('tribes')->cascadeOnDelete();

            $table->foreignId('husband_id')->constrained('persons')->cascadeOnDelete();
            $table->foreignId('wife_id')->constrained('persons')->cascadeOnDelete();

            $table->unsignedTinyInteger('marriage_order')->default(1); // الأولى/الثانية/الثالثة/الرابعة
            $table->unsignedSmallInteger('marriage_year')->nullable();
            $table->unsignedSmallInteger('divorce_year')->nullable();

            $table->boolean('is_current')->default(true);

            $table->enum('status', ['approved', 'pending'])->default('pending');

            $table->timestamps();

            $table->unique(['husband_id', 'wife_id']);
            $table->index(['tribe_id', 'husband_id']);
            $table->index(['tribe_id', 'wife_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('marriages');
    }
};
