<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePendingEditRequest;
use App\Models\PendingEdit;
use App\Models\Person;
use App\Models\Tribe;
use App\Services\EditApplier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PendingEditController extends Controller
{
    public function __construct(protected EditApplier $applier) {}

    /**
     * قائمة الطلبات (للمشرفين).
     */
    public function index(Tribe $tribe, Request $request): Response
    {
        $this->authorize('viewAny', PendingEdit::class);

        $status = $request->query('status', 'pending');

        $edits = PendingEdit::where('tribe_id', $tribe->id)
            ->when($status !== 'all', fn ($q) => $q->where('status', $status))
            ->with(['requester:id,name,email,role', 'reviewer:id,name'])
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn ($e) => [
                'id'            => $e->id,
                'edit_type'     => $e->edit_type,
                'target_id'     => $e->target_id,
                'proposed_data' => $e->proposed_data,
                'status'        => $e->status,
                'requester'     => $e->requester ? [
                    'id'    => $e->requester->id,
                    'name'  => $e->requester->name,
                    'email' => $e->requester->email,
                    'role'  => $e->requester->role,
                ] : null,
                'reviewer'      => $e->reviewer ? [
                    'id'   => $e->reviewer->id,
                    'name' => $e->reviewer->name,
                ] : null,
                'reviewer_note' => $e->reviewer_note,
                'reviewed_at'   => $e->reviewed_at,
                'created_at'    => $e->created_at?->toIso8601String(),
            ]);

        return Inertia::render('Admin/PendingEdits/Index', [
            'edits'    => $edits,
            'status'   => $status,
            'counts'   => $this->counts($tribe),
        ]);
    }

    /**
     * عرض طلب واحد للمراجعة.
     */
    public function show(Tribe $tribe, PendingEdit $edit): Response
    {
        $this->authorize('review', $edit);
        abort_unless($edit->tribe_id === $tribe->id, 404);

        $edit->load(['requester:id,name,email,role', 'reviewer:id,name']);

        $target = null;
        if ($edit->target_id) {
            $target = Person::where('tribe_id', $tribe->id)->find($edit->target_id);
        }

        // الأب/الأم المقترحون (لاستعراضهم بالاسم)
        $proposedFather = null;
        $proposedMother = null;
        $data = $edit->proposed_data ?? [];
        if (! empty($data['father_id'])) {
            $proposedFather = Person::where('tribe_id', $tribe->id)->find($data['father_id']);
        }
        if (! empty($data['mother_id'])) {
            $proposedMother = Person::where('tribe_id', $tribe->id)->find($data['mother_id']);
        }

        return Inertia::render('Admin/PendingEdits/Show', [
            'edit' => [
                'id'            => $edit->id,
                'edit_type'     => $edit->edit_type,
                'target_id'     => $edit->target_id,
                'proposed_data' => $edit->proposed_data,
                'status'        => $edit->status,
                'requester'     => $edit->requester ? [
                    'id'    => $edit->requester->id,
                    'name'  => $edit->requester->name,
                    'email' => $edit->requester->email,
                    'role'  => $edit->requester->role,
                ] : null,
                'reviewer'      => $edit->reviewer ? [
                    'id'   => $edit->reviewer->id,
                    'name' => $edit->reviewer->name,
                ] : null,
                'reviewer_note' => $edit->reviewer_note,
                'reviewed_at'   => $edit->reviewed_at,
                'created_at'    => $edit->created_at?->toIso8601String(),
            ],
            'target' => $target ? $this->briefPerson($target) : null,
            'proposedFather' => $proposedFather ? $this->briefPerson($proposedFather) : null,
            'proposedMother' => $proposedMother ? $this->briefPerson($proposedMother) : null,
        ]);
    }

    /**
     * تقديم طلب إضافة/تعديل.
     *   - العضو العادي (member) → ينشئ طلب pending
     *   - المشرف (tribe_admin / super_admin / moderator لنفس القبيلة) → يُطبَّق مباشرة
     */
    public function store(Tribe $tribe, StorePendingEditRequest $request): RedirectResponse
    {
        $user = $request->user();

        // تحقق إن كان المستخدم مشرفاً على هذه القبيلة (يُطبّق مباشرةً)
        $canAutoApply = $user->isSuperAdmin()
            || ($user->canModerate() && $user->tribe_id === $tribe->id);

        // لو رُفعت صورة، نحفظها في التخزين ونضع المسار في proposed_data
        $proposedData = $request->input('proposed_data', []) ?: [];
        if ($request->hasFile('photo')) {
            $proposedData['photo'] = $request->file('photo')
                ->store('persons', 'public');
        }

        $edit = PendingEdit::create([
            'tribe_id'      => $tribe->id,
            'edit_type'     => $request->input('edit_type'),
            'target_id'     => $request->input('target_id'),
            'proposed_data' => $proposedData,
            'requested_by'  => $user->id,
            'status'        => 'pending',
        ]);

        if ($canAutoApply) {
            try {
                $edit->update(['reviewer_id' => $user->id]);
                $this->applier->apply($edit->fresh());
                $edit->update([
                    'status'      => 'approved',
                    'reviewed_at' => now(),
                    'reviewer_note' => 'تطبيق تلقائي (مشرف)',
                ]);

                // ⚠️ في حالة الحذف: لا نرجع back() لأن الصفحة الحالية كانت
                // صفحة الشخص الذي حُذف للتو (ستعطي 404). نرجّه للشجرة.
                if ($edit->edit_type === 'delete') {
                    return redirect()
                        ->route('tree.index', ['tribe' => $tribe->slug])
                        ->with('success', 'تم حذف الشخص بنجاح.');
                }

                return redirect()
                    ->back()
                    ->with('success', 'تمت العملية بنجاح.');
            } catch (\Throwable $e) {
                // لو فشل التطبيق: نُرجع الطلب لحالة pending ونُخبر المستخدم
                $edit->update([
                    'status'      => 'pending',
                    'reviewer_id' => null,
                    'reviewed_at' => null,
                    'reviewer_note' => null,
                ]);
                return redirect()
                    ->back()
                    ->with('error', 'فشل التطبيق المباشر: ' . $e->getMessage());
            }
        }

        return redirect()
            ->back()
            ->with('success', 'تم تقديم طلبك بنجاح. سيراجعه المشرفون قريباً.');
    }

    /**
     * اعتماد طلب — يطبّقه على البيانات.
     *
     * الترتيب: نُسجّل بيانات المراجع مؤقتاً على الطلب (دون تغيير الحالة)،
     * ثم نطبّقه. إذا نجح → نحدّث الحالة لـ approved. لو فشل → نلغي الحقول.
     */
    public function approve(Tribe $tribe, PendingEdit $edit, Request $request): RedirectResponse
    {
        $this->authorize('approve', $edit);
        abort_unless($edit->tribe_id === $tribe->id, 404);

        $request->validate([
            'note' => 'nullable|string|max:1000',
        ]);

        $reviewerId = $request->user()->id;
        $note = $request->input('note');

        $edit->update([
            'reviewer_id'   => $reviewerId,
            'reviewer_note' => $note,
        ]);

        try {
            $this->applier->apply($edit->fresh());

            $edit->update([
                'reviewed_at' => now(),
                'status'      => 'approved',
            ]);
        } catch (\Throwable $e) {
            $edit->update([
                'reviewer_id'   => null,
                'reviewer_note' => null,
            ]);
            return redirect()
                ->back()
                ->with('error', 'فشل تطبيق التعديل: ' . $e->getMessage());
        }

        return redirect()
            ->route('admin.pending-edits.index', ['tribe' => $tribe->slug])
            ->with('success', 'تم اعتماد الطلب وتطبيق التعديل بنجاح.');
    }

    /**
     * اعتماد كل الطلبات المعلقة لقبيلة دفعة واحدة.
     */
    public function approveAll(Tribe $tribe, Request $request): RedirectResponse
    {
        $this->authorize('viewAny', PendingEdit::class);

        $user = $request->user();
        abort_unless(
            $user->isSuperAdmin() || ($user->canModerate() && $user->tribe_id === $tribe->id),
            403
        );

        $pending = PendingEdit::where('tribe_id', $tribe->id)
            ->where('status', 'pending')
            ->get();

        $applied = 0;
        $failed = 0;

        foreach ($pending as $edit) {
            try {
                $edit->update(['reviewer_id' => $user->id]);
                $this->applier->apply($edit->fresh());
                $edit->update([
                    'status'        => 'approved',
                    'reviewed_at'   => now(),
                    'reviewer_note' => 'اعتماد جماعي',
                ]);
                $applied++;
            } catch (\Throwable $e) {
                $edit->update([
                    'status'        => 'pending',
                    'reviewer_id'   => null,
                    'reviewed_at'   => null,
                    'reviewer_note' => null,
                ]);
                $failed++;
            }
        }

        $message = "تم اعتماد {$applied} طلب";
        if ($failed > 0) {
            $message .= " (فشل {$failed})";
        }

        return redirect()
            ->route('admin.pending-edits.index', ['tribe' => $tribe->slug])
            ->with($failed > 0 ? 'info' : 'success', $message);
    }

    /**
     * رفض طلب.
     */
    public function reject(Tribe $tribe, PendingEdit $edit, Request $request): RedirectResponse
    {
        $this->authorize('reject', $edit);
        abort_unless($edit->tribe_id === $tribe->id, 404);

        $request->validate([
            'note' => 'required|string|max:1000',
        ]);

        $edit->update([
            'reviewer_id'   => $request->user()->id,
            'reviewer_note' => $request->input('note'),
            'reviewed_at'   => now(),
            'status'        => 'rejected',
        ]);

        return redirect()
            ->route('admin.pending-edits.index', ['tribe' => $tribe->slug])
            ->with('info', 'تم رفض الطلب.');
    }

    /**
     * عدد الطلبات حسب الحالة.
     */
    protected function counts(Tribe $tribe): array
    {
        $rows = PendingEdit::where('tribe_id', $tribe->id)
            ->selectRaw('status, COUNT(*) as c')
            ->groupBy('status')
            ->pluck('c', 'status');

        return [
            'pending'  => (int) ($rows['pending']  ?? 0),
            'approved' => (int) ($rows['approved'] ?? 0),
            'rejected' => (int) ($rows['rejected'] ?? 0),
        ];
    }

    protected function briefPerson(Person $p): array
    {
        return [
            'id'            => $p->id,
            'name_ar'       => $p->name_ar,
            'short_name_ar' => $p->short_name_ar,
            'gender'        => $p->gender,
            'title'         => $p->title,
            'birth_year'    => $p->birth_year,
            'death_year'    => $p->death_year,
            'birth_place'   => $p->birth_place,
            'death_place'   => $p->death_place,
            'bio_ar'        => $p->bio_ar,
            'photo'         => $p->photo,
        ];
    }
}
