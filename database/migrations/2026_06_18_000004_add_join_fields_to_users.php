<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // نيّة التسجيل: عضو عادي | تأسيس قبيلة | المطالبة بإدارة قبيلة
            $table->enum('join_intent', ['member', 'found_tribe', 'claim_admin'])
                ->nullable()->after('requested_tribe_id');

            // الباقة المختارة (فقط لمن يريد أن يكون مدير قبيلة)
            $table->foreignId('requested_package_id')->nullable()->after('join_intent')
                ->constrained('packages')->nullOnDelete();

            // سبب المطالبة بإدارة قبيلة موجودة (مديرها غير فعّال)
            $table->text('claim_reason')->nullable()->after('requested_package_id');

            // آخر نشاط للمستخدم — لكشف خمول المدير
            $table->timestamp('last_active_at')->nullable()->after('claim_reason');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('requested_package_id');
            $table->dropColumn(['join_intent', 'claim_reason', 'last_active_at']);
        });
    }
};
