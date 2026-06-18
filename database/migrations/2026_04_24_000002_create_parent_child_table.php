<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('parent_child', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tribe_id')->constrained('tribes')->cascadeOnDelete();

            $table->foreignId('father_id')->nullable()->constrained('persons')->nullOnDelete();
            $table->foreignId('mother_id')->nullable()->constrained('persons')->nullOnDelete();
            $table->foreignId('child_id')->constrained('persons')->cascadeOnDelete();

            $table->enum('status', ['approved', 'pending'])->default('pending');

            $table->timestamps();

            // لكل شخص أب واحد وأم واحدة (علاقة واحدة)
            $table->unique('child_id');

            $table->index(['tribe_id', 'father_id']);
            $table->index(['tribe_id', 'mother_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('parent_child');
    }
};
