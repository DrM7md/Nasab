<?php

namespace App\Policies;

use App\Models\PendingEdit;
use App\Models\User;

class PendingEditPolicy
{
    /**
     * يحق للمشرفين (super/tribe/moderator) مراجعة الطلبات.
     */
    public function review(User $user, PendingEdit $edit): bool
    {
        if (! $user->canModerate()) {
            return false;
        }

        // super_admin يراجع أي قبيلة
        if ($user->isSuperAdmin()) {
            return true;
        }

        // tribe_admin و moderator مقيّدون بقبيلتهم
        return $user->tribe_id === $edit->tribe_id;
    }

    public function approve(User $user, PendingEdit $edit): bool
    {
        return $edit->status === 'pending' && $this->review($user, $edit);
    }

    public function reject(User $user, PendingEdit $edit): bool
    {
        return $edit->status === 'pending' && $this->review($user, $edit);
    }

    public function viewAny(User $user): bool
    {
        return $user->canModerate();
    }
}
