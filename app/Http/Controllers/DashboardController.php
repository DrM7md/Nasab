<?php

namespace App\Http\Controllers;

use App\Models\PendingEdit;
use App\Models\Person;
use App\Models\Tribe;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Dashboard', [
            'stats'        => $this->statsFor($user),
            'tribes'       => $this->tribesFor($user),
            'myTribe'      => $user->tribe_id ? $this->briefTribe($user->tribe) : null,
            'myTribeMeta'  => ($user->tribe_id && $user->canModerate()) ? $this->tribeMeta($user->tribe) : null,
        ]);
    }

    /**
     * بيانات باقة قبيلة المستخدم: الاستهلاك مقابل الحدود + القدرات المتاحة.
     */
    protected function tribeMeta(?Tribe $tribe): ?array
    {
        if (! $tribe) {
            return null;
        }

        return [
            'package_name' => $tribe->package?->name_ar,
            'person_count' => $tribe->personCount(),
            'person_limit' => $tribe->personLimit(),
            'member_count' => $tribe->memberCount(),
            'member_limit' => $tribe->memberLimit(),
            'can_export'   => $tribe->hasCapability('data_export'),
        ];
    }

    /**
     * إحصائيات حسب الدور.
     */
    protected function statsFor(User $user): array
    {
        if ($user->isSuperAdmin()) {
            return [
                'total_tribes'    => Tribe::count(),
                'active_tribes'   => Tribe::where('is_active', true)->count(),
                'total_users'     => User::count(),
                'total_persons'   => Person::count(),
                'pending_system'  => PendingEdit::where('status', 'pending')->count(),
            ];
        }

        if ($user->tribe_id) {
            return [
                'tribe_persons'   => Person::where('tribe_id', $user->tribe_id)->count(),
                'tribe_members'   => User::where('tribe_id', $user->tribe_id)->count(),
                'tribe_pending'   => PendingEdit::where('tribe_id', $user->tribe_id)
                    ->where('status', 'pending')
                    ->count(),
            ];
        }

        return [];
    }

    /**
     * القبائل التي يمكن للمستخدم تصفّحها.
     *   - super_admin: كل القبائل
     *   - others: القبائل النشطة (ليصفّحوا)
     */
    protected function tribesFor(User $user)
    {
        $query = Tribe::query();

        if (! $user->isSuperAdmin()) {
            $query->where('is_active', true);
        }

        return $query
            ->withCount('persons')
            ->orderByDesc('is_active')
            ->orderBy('name_ar')
            ->get()
            ->map(fn ($t) => [
                'id'              => $t->id,
                'name_ar'         => $t->name_ar,
                'name_en'         => $t->name_en,
                'slug'            => $t->slug,
                'logo'            => $t->logo,
                'theme_color'     => $t->theme_color,
                'description_ar'  => $t->description_ar,
                'is_active'       => $t->is_active,
                'subscription_plan' => $t->subscription_plan,
                'persons_count'   => $t->persons_count,
                'is_mine'         => $user->tribe_id === $t->id,
            ]);
    }

    protected function briefTribe(?Tribe $tribe): ?array
    {
        if (! $tribe) return null;
        return [
            'id'      => $tribe->id,
            'name_ar' => $tribe->name_ar,
            'slug'    => $tribe->slug,
        ];
    }
}
