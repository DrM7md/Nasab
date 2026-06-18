<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LandingSection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class LandingController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeSuper($request);

        $sections = LandingSection::ordered()
            ->get()
            ->map(fn (LandingSection $s) => [
                'id'         => $s->id,
                'type'       => $s->type,
                'title'      => $s->title,
                'subtitle'   => $s->subtitle,
                'body'       => $s->body,
                'icon'       => $s->icon,
                'extra'      => $s->extra,
                'sort_order' => $s->sort_order,
                'is_visible' => $s->is_visible,
            ]);

        return Inertia::render('Admin/Landing/Index', [
            'sections' => $sections,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorizeSuper($request);

        $data = $this->validated($request);
        $data['sort_order'] ??= (LandingSection::max('sort_order') ?? 0) + 10;
        $data['is_visible'] ??= true;

        LandingSection::create($data);

        return back()->with('success', 'تم إضافة القسم.');
    }

    public function update(Request $request, LandingSection $section): RedirectResponse
    {
        $this->authorizeSuper($request);

        $section->fill($this->validated($request, partial: true));
        $section->save();

        return back()->with('success', 'تم حفظ التغييرات.');
    }

    public function destroy(Request $request, LandingSection $section): RedirectResponse
    {
        $this->authorizeSuper($request);

        $section->delete();

        return back()->with('success', 'تم حذف القسم.');
    }

    public function reorder(Request $request): RedirectResponse
    {
        $this->authorizeSuper($request);

        $validated = $request->validate([
            'order'   => 'required|array',
            'order.*' => 'integer|exists:landing_sections,id',
        ]);

        foreach ($validated['order'] as $index => $id) {
            LandingSection::whereKey($id)->update(['sort_order' => ($index + 1) * 10]);
        }

        return back();
    }

    protected function validated(Request $request, bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';

        return $request->validate([
            'type'       => [$required, Rule::in(LandingSection::TYPES)],
            'title'      => 'sometimes|nullable|string|max:255',
            'subtitle'   => 'sometimes|nullable|string|max:255',
            'body'       => 'sometimes|nullable|string|max:5000',
            'icon'       => 'sometimes|nullable|string|max:16',
            'extra'      => 'sometimes|nullable|array',
            'sort_order' => 'sometimes|integer|min:0',
            'is_visible' => 'sometimes|boolean',
        ]);
    }

    protected function authorizeSuper(Request $request): void
    {
        abort_unless(
            $request->user()?->isSuperAdmin(),
            403,
            'الوصول مقتصر على المدير العام.',
        );
    }
}
