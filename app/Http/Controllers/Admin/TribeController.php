<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\Tribe;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TribeController extends Controller
{
    /**
     * قائمة القبائل (super_admin فقط).
     */
    public function index(Request $request): Response
    {
        $this->authorizeSuper($request);

        $tribes = Tribe::withCount(['persons', 'users'])
            ->with('package:id,name_ar')
            ->orderByDesc('is_active')
            ->orderBy('name_ar')
            ->get()
            ->map(fn ($t) => [
                'id'             => $t->id,
                'name_ar'        => $t->name_ar,
                'slug'           => $t->slug,
                'description_ar' => $t->description_ar,
                'is_active'      => (bool) $t->is_active,
                'package_id'     => $t->package_id,
                'package'        => $t->package ? ['id' => $t->package->id, 'name_ar' => $t->package->name_ar] : null,
                'persons_count'  => $t->persons_count,
                'users_count'    => $t->users_count,
            ]);

        $packages = Package::ordered()->get(['id', 'name_ar'])
            ->map(fn ($p) => ['id' => $p->id, 'name_ar' => $p->name_ar]);

        return Inertia::render('Admin/Tribes/Index', [
            'tribes'   => $tribes,
            'packages' => $packages,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorizeSuper($request);

        $validated = $request->validate([
            'name_ar'        => 'required|string|max:255',
            'slug'           => 'nullable|string|max:100|alpha_dash|unique:tribes,slug',
            'description_ar' => 'nullable|string|max:2000',
            'package_id'     => 'nullable|integer|exists:packages,id',
        ]);

        $validated['slug'] = $this->uniqueSlug($validated['slug'] ?? null, $validated['name_ar']);
        $validated['is_active'] = true;

        Tribe::create($validated);

        return back()->with('success', 'تم إنشاء القبيلة بنجاح.');
    }

    public function update(Request $request, Tribe $tribe): RedirectResponse
    {
        $this->authorizeSuper($request);

        $validated = $request->validate([
            'name_ar'        => 'sometimes|string|max:255',
            'slug'           => ['sometimes', 'string', 'max:100', 'alpha_dash',
                                 Rule::unique('tribes', 'slug')->ignore($tribe->id)],
            'description_ar' => 'sometimes|nullable|string|max:2000',
            'is_active'      => 'sometimes|boolean',
            'package_id'     => 'sometimes|nullable|integer|exists:packages,id',
        ]);

        $tribe->fill($validated);
        $tribe->save();

        return back()->with('success', 'تم تحديث القبيلة.');
    }

    /**
     * يولّد slug فريدًا: من القيمة المُدخلة، أو من الاسم، أو رمز احتياطي للأسماء العربية.
     */
    protected function uniqueSlug(?string $slug, string $name): string
    {
        $base = $slug ?: Str::slug($name);
        if ($base === '') {
            $base = 'tribe-' . Str::lower(Str::random(5));
        }

        $candidate = $base;
        $i = 1;
        while (Tribe::where('slug', $candidate)->exists()) {
            $candidate = $base . '-' . (++$i);
        }

        return $candidate;
    }

    /**
     * حذف قبيلة بكامل بياناتها (الأشخاص، الزيجات، علاقات الأبوة، طلبات الموافقة).
     * المستخدمون المنتمون للقبيلة → tribe_id = NULL (لا يُحذفون).
     */
    public function destroy(Request $request, Tribe $tribe): RedirectResponse
    {
        $this->authorizeSuper($request);

        $name = $tribe->name_ar;

        DB::transaction(function () use ($tribe) {
            // إفراغ root_person_id قبل الحذف لتجنب مشاكل الـ cascade الدائرية
            // (tribes.root_person_id → persons.id ON DELETE SET NULL،
            //  persons.tribe_id → tribes.id ON DELETE CASCADE)
            $tribe->update(['root_person_id' => null]);

            // الحذف يُسبّب cascade تلقائياً عبر FK constraints على:
            // persons, marriages, parent_child, pending_edits
            // والـ users.tribe_id يصير NULL تلقائياً (nullOnDelete)
            $tribe->delete();
        });

        return redirect()
            ->route('admin.tribes.index')
            ->with('success', "تم حذف قبيلة \"{$name}\" وجميع بياناتها.");
    }

    protected function authorizeSuper(Request $request): void
    {
        abort_unless($request->user()?->isSuperAdmin(), 403, 'الوصول مقتصر على المدير العام.');
    }
}
