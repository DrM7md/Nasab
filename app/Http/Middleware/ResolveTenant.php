<?php

namespace App\Http\Middleware;

use App\Models\Tribe;
use App\Support\TenantManager;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * ResolveTenant
 *
 * يحدد القبيلة الحالية بإحدى طريقتين:
 *   1) من الـ subdomain:  qasimi.nasab.test  →  slug = qasimi
 *   2) من الـ URL segment: /tribes/qasimi/... →  slug = qasimi
 *
 * إذا وُجدت قبيلة نشطة: تُسجَّل في TenantManager وتُشارك مع Inertia.
 * إذا لم توجد: middleware لا يمنع الطلب — الـ routes التي تتطلب tenant
 * تتحقق بنفسها.
 */
class ResolveTenant
{
    public function handle(Request $request, Closure $next): Response
    {
        $slug = $this->resolveSlug($request);

        if ($slug) {
            $tribe = Tribe::where('slug', $slug)
                ->where('is_active', true)
                ->first();

            if ($tribe) {
                app(TenantManager::class)->set($tribe);

                // نربط الـ route parameter بـ model instance لتفادي استعلام ثانٍ
                if ($request->route('tribe') === $slug) {
                    $request->route()->setParameter('tribe', $tribe);
                }
            }
        }

        return $next($request);
    }

    protected function resolveSlug(Request $request): ?string
    {
        // ١) من route parameter (اسمه "tribe")
        $paramTribe = $request->route('tribe');
        if (is_string($paramTribe) && $paramTribe !== '') {
            return $paramTribe;
        }
        if ($paramTribe instanceof Tribe) {
            return $paramTribe->slug;
        }

        // ٢) من subdomain
        $host = $request->getHost();
        $parts = explode('.', $host);

        // host مثل: qasimi.nasab.test (3 أجزاء) أو nasab.test (جزآن)
        if (count($parts) >= 3 && $parts[0] !== 'www') {
            return $parts[0];
        }

        return null;
    }
}
