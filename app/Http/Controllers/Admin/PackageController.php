<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Package;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PackageController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeSuper($request);

        $packages = Package::ordered()
            ->withCount('tribes')
            ->get()
            ->map(fn (Package $p) => [
                'id'            => $p->id,
                'name_ar'       => $p->name_ar,
                'slug'          => $p->slug,
                'description_ar' => $p->description_ar,
                'price_monthly' => (float) $p->price_monthly,
                'price_yearly'  => (float) $p->price_yearly,
                'currency'      => $p->currency,
                'features'      => $p->features ?? [],
                'max_persons'   => $p->max_persons,
                'max_members'   => $p->max_members,
                'color'         => $p->color,
                'is_featured'   => $p->is_featured,
                'is_active'     => $p->is_active,
                'sort_order'    => $p->sort_order,
                'tribes_count'  => $p->tribes_count,
            ]);

        return Inertia::render('Admin/Packages/Index', [
            'packages' => $packages,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorizeSuper($request);

        $data = $this->validateData($request);
        $data['slug'] = $this->uniqueSlug($data['name_ar']);
        $data['sort_order'] ??= (Package::max('sort_order') ?? 0) + 10;

        Package::create($data);

        return back()->with('success', 'تم إنشاء الباقة.');
    }

    public function update(Request $request, Package $package): RedirectResponse
    {
        $this->authorizeSuper($request);

        $package->fill($this->validateData($request, $package));
        $package->save();

        return back()->with('success', 'تم حفظ الباقة.');
    }

    public function destroy(Request $request, Package $package): RedirectResponse
    {
        $this->authorizeSuper($request);

        // القبائل المرتبطة → package_id = null تلقائيًا (nullOnDelete)
        $package->delete();

        return back()->with('success', 'تم حذف الباقة.');
    }

    public function reorder(Request $request): RedirectResponse
    {
        $this->authorizeSuper($request);

        $validated = $request->validate([
            'order'   => 'required|array',
            'order.*' => 'integer|exists:packages,id',
        ]);

        foreach ($validated['order'] as $index => $id) {
            Package::whereKey($id)->update(['sort_order' => ($index + 1) * 10]);
        }

        return back();
    }

    protected function validateData(Request $request, ?Package $package = null): array
    {
        $partial = $package !== null;
        $req = $partial ? 'sometimes' : 'required';

        return $request->validate([
            'name_ar'        => [$req, 'string', 'max:255'],
            'description_ar' => ['sometimes', 'nullable', 'string', 'max:500'],
            'price_monthly'  => ['sometimes', 'numeric', 'min:0', 'max:9999999'],
            'price_yearly'   => ['sometimes', 'numeric', 'min:0', 'max:9999999'],
            'currency'       => ['sometimes', Rule::in(['SAR', 'QAR', 'AED', 'KWD', 'BHD', 'OMR', 'USD'])],
            'features'       => ['sometimes', 'array'],
            'features.*'     => ['string', 'max:255'],
            'max_persons'    => ['sometimes', 'nullable', 'integer', 'min:0'],
            'max_members'    => ['sometimes', 'nullable', 'integer', 'min:0'],
            'color'          => ['sometimes', 'string', 'max:16'],
            'is_featured'    => ['sometimes', 'boolean'],
            'is_active'      => ['sometimes', 'boolean'],
            'sort_order'     => ['sometimes', 'integer', 'min:0'],
        ]);
    }

    protected function uniqueSlug(string $name): string
    {
        $base = Str::slug($name);
        if ($base === '') {
            $base = 'package-' . Str::lower(Str::random(5));
        }
        $candidate = $base;
        $i = 1;
        while (Package::where('slug', $candidate)->exists()) {
            $candidate = $base . '-' . (++$i);
        }

        return $candidate;
    }

    protected function authorizeSuper(Request $request): void
    {
        abort_unless($request->user()?->isSuperAdmin(), 403, 'الوصول مقتصر على المدير العام.');
    }
}
