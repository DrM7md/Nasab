<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * يستطيع رؤية قائمة المستخدمين: super_admin (كل المستخدمين) أو tribe_admin (قبيلته).
     */
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin() || $user->isTribeAdmin();
    }

    /**
     * يستطيع تعديل مستخدم: super_admin (أي مستخدم)،
     * tribe_admin (مستخدمي قبيلته — لكن ليس super_admin ولا تغيير خارج قبيلته).
     */
    public function update(User $user, User $target): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if (! $user->isTribeAdmin()) {
            return false;
        }

        // لا يمكن تعديل super_admin
        if ($target->isSuperAdmin()) {
            return false;
        }

        // tribe_admin يعدّل:
        //   - أعضاء قبيلته (انضموا فعلاً)
        //   - أو مستخدمين قدّموا طلب انضمام لقبيلته (لاعتماد/رفض الطلب)
        return $target->tribe_id === $user->tribe_id
            || $target->requested_tribe_id === $user->tribe_id;
    }

    /**
     * لا يستطيع أحد تغيير دوره الشخصي لتجنّب حلقات.
     */
    public function changeRole(User $user, User $target): bool
    {
        if ($user->id === $target->id) {
            return false;
        }
        return $this->update($user, $target);
    }
}
