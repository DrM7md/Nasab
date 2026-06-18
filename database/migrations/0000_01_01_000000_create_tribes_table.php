<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tribes', function (Blueprint $table) {
            $table->id();

            $table->string('name_ar');
            $table->string('name_en')->nullable();
            $table->string('slug')->unique();

            $table->string('logo')->nullable();
            $table->string('cover_image')->nullable();
            $table->string('theme_color', 20)->default('#8B6914');

            $table->unsignedBigInteger('root_person_id')->nullable();

            $table->text('description_ar')->nullable();
            $table->text('description_en')->nullable();

            $table->boolean('is_active')->default(true);
            $table->enum('subscription_plan', ['free', 'pro', 'enterprise'])->default('free');

            $table->timestamps();

            $table->index('is_active');
            $table->index('slug');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tribes');
    }
};
