<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('landing_sections', function (Blueprint $table) {
            $table->id();

            $table->enum('type', [
                'hero',
                'about',
                'quote',
                'features',
                'text',
                'cta',
            ]);

            $table->string('title')->nullable();
            $table->string('subtitle')->nullable();
            $table->text('body')->nullable();
            $table->string('icon', 16)->nullable();

            $table->json('extra')->nullable();

            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_visible')->default(true);

            $table->timestamps();

            $table->index(['is_visible', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('landing_sections');
    }
};
