<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('feedback', function (Blueprint $table) {
            $table->id();

            // القبيلة التي كان المستخدم فيها عند الإرسال (للسياق فقط — قد تكون null)
            $table->foreignId('tribe_id')->nullable()->constrained('tribes')->nullOnDelete();

            // المُرسِل
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

            $table->enum('type', ['idea', 'bug']);            // اقتراح تطويري | بلاغ خلل
            $table->text('message');                          // نص الاقتراح/الخلل
            $table->string('screenshot')->nullable();         // مسار الصورة المرفقة (public disk)
            $table->string('page_url', 1000)->nullable();     // الصفحة التي أُرسل منها البلاغ

            $table->enum('status', ['new', 'in_review', 'resolved'])->default('new');
            $table->text('admin_note')->nullable();           // ملاحظة المدير العام
            $table->timestamp('resolved_at')->nullable();

            $table->timestamps();

            $table->index(['status', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feedback');
    }
};
