<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    /**
     * الـ props المشتركة في كل صفحة Inertia.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $tribe = currentTribe();

        return [
            ...parent::share($request),

            'auth' => [
                'user' => $user ? [
                    'id'               => $user->id,
                    'name'             => $user->name,
                    'email'            => $user->email,
                    'role'             => $user->role,
                    'tribe_id'         => $user->tribe_id,
                    'linked_person_id' => $user->linked_person_id,
                    'can_moderate'     => $user->canModerate(),
                    'can_edit'         => $user->canEdit(),
                ] : null,
            ],

            'tribe' => $tribe ? [
                'id'           => $tribe->id,
                'name_ar'      => $tribe->name_ar,
                'name_en'      => $tribe->name_en,
                'slug'         => $tribe->slug,
                'logo'         => $tribe->logo,
                'theme_color'  => $tribe->theme_color,
                'root_person_id' => $tribe->root_person_id,
            ] : null,

            // عدّاد الطلبات المعلّقة — lazy (يُحسب فقط عند الحاجة)
            'pending_count' => fn () =>
                ($user && $user->canModerate() && $tribe)
                    ? \App\Models\PendingEdit::where('tribe_id', $tribe->id)
                        ->where('status', 'pending')
                        ->count()
                    : 0,

            // عدّاد البلاغات الجديدة — للمدير العام فقط
            'feedback_new_count' => fn () =>
                ($user && $user->isSuperAdmin())
                    ? \App\Models\Feedback::where('status', 'new')->count()
                    : 0,

            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
                'info'    => fn () => $request->session()->get('info'),
            ],
        ];
    }
}
