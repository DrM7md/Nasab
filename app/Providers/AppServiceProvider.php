<?php

namespace App\Providers;

use App\Support\TenantManager;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // حاسم: TenantManager يجب أن يكون singleton خلال الطلب الواحد
        // حتى يحتفظ بالقبيلة التي ضبطها ResolveTenant لبقية الـ middlewares.
        $this->app->singleton(TenantManager::class);
    }

    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
    }
}
