<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

/**
 * يحدّث last_active_at للمستخدم المسجّل — مرة كل 5 دقائق على الأكثر
 * (تحديث مباشر بلا أحداث Eloquent لتفادي أي كلفة).
 */
class TrackLastActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && (
            $user->last_active_at === null
            || $user->last_active_at->lt(now()->subMinutes(5))
        )) {
            DB::table('users')->where('id', $user->id)->update(['last_active_at' => now()]);
        }

        return $next($request);
    }
}
