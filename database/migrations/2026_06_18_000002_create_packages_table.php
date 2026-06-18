<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('packages', function (Blueprint $table) {
            $table->id();
            $table->string('name_ar');
            $table->string('slug')->unique();
            $table->string('description_ar', 500)->nullable();

            $table->decimal('price_monthly', 10, 2)->default(0);
            $table->decimal('price_yearly', 10, 2)->default(0);
            $table->string('currency', 8)->default('SAR');

            $table->json('features')->nullable();          // قائمة مزايا نصية
            $table->unsignedInteger('max_persons')->nullable();  // null = غير محدود
            $table->unsignedInteger('max_members')->nullable();

            $table->string('color', 16)->default('#8B6914');
            $table->boolean('is_featured')->default(false); // الباقة المميّزة (الأكثر شعبية)
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('packages');
    }
};
