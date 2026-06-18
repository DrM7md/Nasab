<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('persons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tribe_id')->constrained('tribes')->cascadeOnDelete();

            $table->string('name_ar');
            $table->string('name_en')->nullable();
            $table->string('short_name_ar');

            $table->enum('gender', ['male', 'female']);
            $table->string('title', 50)->nullable();

            $table->unsignedSmallInteger('birth_year')->nullable();
            $table->unsignedSmallInteger('death_year')->nullable();

            $table->string('birth_place')->nullable();
            $table->string('death_place')->nullable();

            $table->string('photo')->nullable();
            $table->text('bio_ar')->nullable();
            $table->text('bio_en')->nullable();

            $table->enum('status', ['approved', 'pending', 'rejected'])->default('pending');

            $table->foreignId('added_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();

            $table->index(['tribe_id', 'status']);
            $table->index(['tribe_id', 'gender']);
            $table->fullText(['name_ar', 'short_name_ar']);
        });

        // إضافة FK constraint لـ root_person_id الآن بعد إنشاء persons
        Schema::table('tribes', function (Blueprint $table) {
            $table->foreign('root_person_id')->references('id')->on('persons')->nullOnDelete();
        });

        // إضافة FK constraint لـ linked_person_id الآن بعد إنشاء persons
        Schema::table('users', function (Blueprint $table) {
            $table->foreign('linked_person_id')->references('id')->on('persons')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['linked_person_id']);
        });
        Schema::table('tribes', function (Blueprint $table) {
            $table->dropForeign(['root_person_id']);
        });
        Schema::dropIfExists('persons');
    }
};
