<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pending_edits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tribe_id')->constrained('tribes')->cascadeOnDelete();

            $table->enum('edit_type', [
                'add_person',
                'edit_person',
                'add_relationship',
                'edit_relationship',
                'add_marriage',
                'edit_marriage',
                'delete',
            ]);

            // target_id قد يكون person_id، parent_child_id، أو marriage_id
            // يُحدد عبر edit_type
            $table->unsignedBigInteger('target_id')->nullable();

            $table->json('proposed_data');

            $table->foreignId('requested_by')->constrained('users')->cascadeOnDelete();

            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');

            $table->foreignId('reviewer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('reviewer_note')->nullable();
            $table->timestamp('reviewed_at')->nullable();

            $table->timestamps();

            $table->index(['tribe_id', 'status']);
            $table->index(['tribe_id', 'edit_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pending_edits');
    }
};
