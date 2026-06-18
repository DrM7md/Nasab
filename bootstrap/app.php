<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\ResolveTenant::class,
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'tenant' => \App\Http\Middleware\ResolveTenant::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // عرض صفحة Inertia مخصصة لأخطاء 404/403/500/503
        $exceptions->respond(function ($response, $exception, $request) {
            $status = $response->getStatusCode();

            if (! app()->environment('local') && in_array($status, [404, 403, 500, 503], true)) {
                return \Inertia\Inertia::render('Errors/Error', ['status' => $status])
                    ->toResponse($request)
                    ->setStatusCode($status);
            }

            if ($status === 419) {
                return back()->with('error', 'انتهت جلسة الصفحة، يرجى المحاولة مجدداً.');
            }

            return $response;
        });
    })->create();
