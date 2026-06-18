<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tribe;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', User::class);

        $currentUser = $request->user();
        $search = trim((string) $request->query('q', ''));
        $tab = $request->query('tab', 'all'); // all | joins

        // عدد الصفوف لكل صفحة — قيود محدّدة للأداء
        $perPage = (int) $request->query('per_page', 10);
        if (! in_array($perPage, [10, 20, 50, 100, 500], true)) {
            $perPage = 10;
        }

        $query = User::query()
            ->when(! $currentUser->isSuperAdmin(), function ($q) use ($currentUser) {
                // tribe_admin يرى أعضاء قبيلته + طلبات الانضمام لقبيلته
                $q->where(function ($q2) use ($currentUser) {
                    $q2->where('tribe_id', $currentUser->tribe_id)
                       ->orWhere('requested_tribe_id', $currentUser->tribe_id);
                });
            })
            ->when($tab === 'joins', fn ($q) =>
                $q->whereNull('tribe_id')->whereNotNull('requested_tribe_id')
            )
            ->when($search !== '', fn ($q) =>
                $q->where(function ($q2) use ($search) {
                    $q2->where('name', 'like', "%{$search}%")
                       ->orWhere('email', 'like', "%{$search}%")
                       ->orWhere('national_id', 'like', "%{$search}%");
                })
            )
            ->with(['tribe:id,name_ar,slug', 'requestedTribe:id,name_ar,slug'])
            ->orderBy('name');

        $users = $query->paginate($perPage)->withQueryString()->through(fn ($u) => [
            'id'                 => $u->id,
            'name'               => $u->name,
            'email'              => $u->email,
            'phone'              => $u->phone,
            'national_id'        => $u->national_id,
            'nationality'        => $u->nationality,
            'id_card_photo'      => $u->id_card_photo ? asset('storage/' . $u->id_card_photo) : null,
            'role'               => $u->role,
            'tribe_id'           => $u->tribe_id,
            'requested_tribe_id' => $u->requested_tribe_id,
            'tribe'              => $u->tribe ? [
                'id' => $u->tribe->id,
                'name_ar' => $u->tribe->name_ar,
                'slug' => $u->tribe->slug,
            ] : null,
            'requested_tribe'    => $u->requestedTribe ? [
                'id' => $u->requestedTribe->id,
                'name_ar' => $u->requestedTribe->name_ar,
                'slug' => $u->requestedTribe->slug,
            ] : null,
            'is_active'          => (bool) $u->is_active,
            'is_pending_join'    => $u->tribe_id === null && $u->requested_tribe_id !== null,
            'email_verified_at'  => $u->email_verified_at?->toIso8601String(),
            'is_self'            => $u->id === $currentUser->id,
        ]);

        $tribes = Tribe::orderBy('name_ar')
            ->get(['id', 'name_ar', 'slug'])
            ->map(fn ($t) => ['id' => $t->id, 'name_ar' => $t->name_ar, 'slug' => $t->slug]);

        // عدّاد طلبات الانضمام (ضمن نطاق المستخدم الحالي)
        $joinCount = User::query()
            ->whereNull('tribe_id')
            ->whereNotNull('requested_tribe_id')
            ->when(! $currentUser->isSuperAdmin(), fn ($q) =>
                $q->where('requested_tribe_id', $currentUser->tribe_id)
            )
            ->count();

        return Inertia::render('Admin/Users/Index', [
            'users'   => $users,
            'tribes'  => $tribes,
            'search'  => $search,
            'tab'     => $tab,
            'perPage' => $perPage,
            'joinCount' => $joinCount,
            'canAssignSuperAdmin' => $currentUser->isSuperAdmin(),
        ]);
    }

    /**
     * اعتماد طلب انضمام — يربط المستخدم بالقبيلة المطلوبة كعضو.
     */
    public function approveJoin(Request $request, User $user): RedirectResponse
    {
        $this->authorize('update', $user);

        abort_unless(
            $user->tribe_id === null && $user->requested_tribe_id !== null,
            422,
            'لا يوجد طلب انضمام معلّق لهذا المستخدم.'
        );

        // tribe_admin يعتمد فقط طلبات قبيلته
        $currentUser = $request->user();
        if (! $currentUser->isSuperAdmin() && $user->requested_tribe_id !== $currentUser->tribe_id) {
            abort(403, 'يمكنك اعتماد الطلبات المتعلقة بقبيلتك فقط.');
        }

        $user->update([
            'tribe_id'           => $user->requested_tribe_id,
            'requested_tribe_id' => null,
            'role'               => User::ROLE_MEMBER,
        ]);

        return back()->with('success', "تم اعتماد انضمام {$user->name} للقبيلة.");
    }

    /**
     * رفض طلب انضمام — يبقى المستخدم بدون قبيلة.
     */
    public function rejectJoin(Request $request, User $user): RedirectResponse
    {
        $this->authorize('update', $user);

        abort_unless(
            $user->tribe_id === null && $user->requested_tribe_id !== null,
            422
        );

        $currentUser = $request->user();
        if (! $currentUser->isSuperAdmin() && $user->requested_tribe_id !== $currentUser->tribe_id) {
            abort(403);
        }

        $user->update([
            'requested_tribe_id' => null,
            'is_active'          => false,
        ]);

        return back()->with('info', "تم رفض طلب انضمام {$user->name}.");
    }

    /**
     * إنشاء مستخدم جديد يدوياً (بواسطة admin).
     */
    public function store(Request $request): RedirectResponse
    {
        $this->authorize('viewAny', User::class);

        $currentUser = $request->user();
        $allowedRoles = $this->allowedRoles($currentUser);

        $validated = $request->validate([
            'name'         => 'required|string|max:255',
            'email'        => ['required', 'email', 'max:255', 'unique:users,email'],
            'password'     => ['required', 'confirmed', 'string', 'min:4'],
            'phone'        => 'nullable|string|max:30',
            'national_id'  => ['nullable', 'string', 'max:50', 'unique:users,national_id'],
            'nationality'  => 'nullable|string|max:60',
            'role'         => ['required', Rule::in($allowedRoles)],
            'tribe_id'     => ['nullable', 'integer', 'exists:tribes,id'],
            'is_active'    => 'boolean',
            'id_card_photo' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:5120',
        ]);

        // tribe_admin يُنشئ فقط لقبيلته
        if (! $currentUser->isSuperAdmin()) {
            if (! empty($validated['tribe_id']) && $validated['tribe_id'] !== $currentUser->tribe_id) {
                return back()->with('error', 'لا يمكنك إنشاء مستخدم في قبيلة أخرى.');
            }
            $validated['tribe_id'] = $currentUser->tribe_id;
        }

        if ($request->hasFile('id_card_photo')) {
            $validated['id_card_photo'] = $request->file('id_card_photo')->store('id-cards', 'public');
        }

        $validated['password'] = Hash::make($validated['password']);
        $validated['email_verified_at'] = now();

        User::create($validated);

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'تم إنشاء المستخدم بنجاح.');
    }

    /**
     * تحديث بيانات مستخدم — كل الحقول.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $this->authorize('update', $user);

        $currentUser = $request->user();
        $isSelf = $user->id === $currentUser->id;
        $allowedRoles = $this->allowedRoles($currentUser);

        $validated = $request->validate([
            'name'         => 'sometimes|required|string|max:255',
            'email'        => ['sometimes', 'required', 'email', 'max:255',
                               Rule::unique('users', 'email')->ignore($user->id)],
            'phone'        => 'sometimes|nullable|string|max:30',
            'national_id'  => ['sometimes', 'nullable', 'string', 'max:50',
                               Rule::unique('users', 'national_id')->ignore($user->id)],
            'nationality'  => 'sometimes|nullable|string|max:60',
            'role'         => ['sometimes', Rule::in($allowedRoles)],
            'tribe_id'     => ['sometimes', 'nullable', 'integer', 'exists:tribes,id'],
            'is_active'    => 'sometimes|boolean',
            'password'     => ['sometimes', 'nullable', 'confirmed', 'string', 'min:4'],
            'id_card_photo' => 'sometimes|nullable|image|mimes:jpeg,jpg,png,webp|max:5120',
        ]);

        // tribe_admin لا يستطيع نقل مستخدم خارج قبيلته
        if (
            ! $currentUser->isSuperAdmin()
            && array_key_exists('tribe_id', $validated)
            && $validated['tribe_id'] !== null
            && $validated['tribe_id'] !== $currentUser->tribe_id
        ) {
            return back()->with('error', 'لا يمكنك نقل مستخدم لقبيلة أخرى.');
        }

        // منع المستخدم من تغيير دور نفسه
        if ($isSelf && isset($validated['role']) && $validated['role'] !== $user->role) {
            return back()->with('error', 'لا يمكنك تغيير دورك بنفسك.');
        }

        // رفع صورة بطاقة جديدة — احذف القديمة لو وُجدت
        if ($request->hasFile('id_card_photo')) {
            if ($user->id_card_photo) {
                Storage::disk('public')->delete($user->id_card_photo);
            }
            $validated['id_card_photo'] = $request->file('id_card_photo')->store('id-cards', 'public');
        }

        // كلمة المرور — اختيارية، تُحدّث فقط لو فارغة ليست
        if (! empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->fill($validated);
        $user->save();

        return back()->with('success', 'تم تحديث بيانات المستخدم.');
    }

    /**
     * حذف مستخدم — مع حماية:
     *  - لا تحذف نفسك
     *  - tribe_admin لا يحذف super_admin
     *  - تُحذف صورة البطاقة من التخزين
     */
    public function destroy(Request $request, User $user): RedirectResponse
    {
        $this->authorize('update', $user);

        $currentUser = $request->user();

        if ($user->id === $currentUser->id) {
            return back()->with('error', 'لا يمكنك حذف حسابك من هنا.');
        }

        if ($user->isSuperAdmin() && ! $currentUser->isSuperAdmin()) {
            return back()->with('error', 'لا يمكنك حذف مدير عام.');
        }

        // حذف صورة البطاقة من التخزين
        if ($user->id_card_photo) {
            Storage::disk('public')->delete($user->id_card_photo);
        }

        $name = $user->name;
        $user->delete();

        return back()->with('success', "تم حذف المستخدم \"{$name}\".");
    }

    /**
     * الأدوار المسموح إسنادها حسب المستخدم الحالي.
     */
    protected function allowedRoles(User $currentUser): array
    {
        return $currentUser->isSuperAdmin()
            ? ['super_admin', 'tribe_admin', 'moderator', 'member', 'viewer']
            : ['tribe_admin', 'moderator', 'member', 'viewer'];
    }
}
