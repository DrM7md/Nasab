<?php

use App\Models\Tribe;
use App\Support\TenantManager;

if (! function_exists('currentTribe')) {
    /**
     * يُرجع القبيلة الحالية (من ResolveTenant middleware) أو null.
     */
    function currentTribe(): ?Tribe
    {
        return app(TenantManager::class)->get();
    }
}

if (! function_exists('currentTribeId')) {
    function currentTribeId(): ?int
    {
        return app(TenantManager::class)->id();
    }
}
