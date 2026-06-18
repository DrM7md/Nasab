<?php

namespace App\Support;

use App\Models\Tribe;

/**
 * TenantManager — يحتفظ بالقبيلة الحالية خلال الطلب.
 * يُستخدم عبر singleton من الـ Container + helper currentTribe().
 */
class TenantManager
{
    protected ?Tribe $tribe = null;

    public function set(?Tribe $tribe): void
    {
        $this->tribe = $tribe;
    }

    public function get(): ?Tribe
    {
        return $this->tribe;
    }

    public function id(): ?int
    {
        return $this->tribe?->id;
    }

    public function has(): bool
    {
        return $this->tribe !== null;
    }
}
