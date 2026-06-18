<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class FeedbackController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeSuper($request);

        $tab    = $request->query('tab', 'all');           // all | idea | bug
        $status = $request->query('status', 'all');        // all | new | in_review | resolved
        $perPage = (int) $request->query('per_page', 20);

        $items = Feedback::query()
            ->with(['user:id,name,email', 'tribe:id,name_ar,slug'])
            ->when(in_array($tab, ['idea', 'bug'], true), fn ($q) => $q->where('type', $tab))
            ->when(in_array($status, ['new', 'in_review', 'resolved'], true), fn ($q) => $q->where('status', $status))
            ->latest()
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (Feedback $f) => [
                'id'         => $f->id,
                'type'       => $f->type,
                'message'    => $f->message,
                'screenshot' => $f->screenshot ? Storage::disk('public')->url($f->screenshot) : null,
                'page_url'   => $f->page_url,
                'status'     => $f->status,
                'admin_note' => $f->admin_note,
                'created_at' => $f->created_at?->toIso8601String(),
                'user'       => $f->user ? ['id' => $f->user->id, 'name' => $f->user->name, 'email' => $f->user->email] : null,
                'tribe'      => $f->tribe ? ['id' => $f->tribe->id, 'name_ar' => $f->tribe->name_ar, 'slug' => $f->tribe->slug] : null,
            ]);

        return Inertia::render('Admin/Feedback/Index', [
            'items'    => $items,
            'tab'      => $tab,
            'status'   => $status,
            'perPage'  => $perPage,
            'counts'   => [
                'new'   => Feedback::where('status', 'new')->count(),
                'idea'  => Feedback::where('type', 'idea')->count(),
                'bug'   => Feedback::where('type', 'bug')->count(),
                'total' => Feedback::count(),
            ],
        ]);
    }

    public function update(Request $request, Feedback $feedback): RedirectResponse
    {
        $this->authorizeSuper($request);

        $validated = $request->validate([
            'status'     => ['sometimes', Rule::in(['new', 'in_review', 'resolved'])],
            'admin_note' => ['sometimes', 'nullable', 'string', 'max:5000'],
        ]);

        if (array_key_exists('status', $validated)) {
            $feedback->status = $validated['status'];
            $feedback->resolved_at = $validated['status'] === 'resolved' ? now() : null;
        }

        if (array_key_exists('admin_note', $validated)) {
            $feedback->admin_note = $validated['admin_note'];
        }

        $feedback->save();

        return back()->with('success', 'تم تحديث البلاغ.');
    }

    public function destroy(Request $request, Feedback $feedback): RedirectResponse
    {
        $this->authorizeSuper($request);

        if ($feedback->screenshot) {
            Storage::disk('public')->delete($feedback->screenshot);
        }

        $feedback->delete();

        return back()->with('success', 'تم حذف البلاغ.');
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
