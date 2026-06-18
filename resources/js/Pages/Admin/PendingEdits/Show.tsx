import BackButton from '@/Components/UI/BackButton';
import { ArrowLeftIcon, CheckIcon, XIcon } from '@/Components/UI/Icons';
import ThemeToggle from '@/Components/UI/ThemeToggle';
import type { Gender, PageProps, PendingEditStatus, PendingEditType } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

interface BriefPerson {
    id: number;
    name_ar: string;
    short_name_ar: string;
    gender: Gender;
    title: string | null;
    birth_year: number | null;
    death_year: number | null;
    birth_place: string | null;
    death_place: string | null;
    bio_ar: string | null;
}

interface EditDetail {
    id: number;
    edit_type: PendingEditType;
    target_id: number | null;
    proposed_data: Record<string, unknown>;
    status: PendingEditStatus;
    requester: { id: number; name: string; email: string; role: string } | null;
    reviewer: { id: number; name: string } | null;
    reviewer_note: string | null;
    reviewed_at: string | null;
    created_at: string;
}

type ShowProps = PageProps<{
    edit: EditDetail;
    target: BriefPerson | null;
    proposedFather: BriefPerson | null;
    proposedMother: BriefPerson | null;
}>;

const FIELD_LABELS: Record<string, string> = {
    name_ar: 'الاسم الكامل',
    short_name_ar: 'الاسم المختصر',
    gender: 'الجنس',
    title: 'اللقب',
    birth_year: 'سنة الميلاد',
    death_year: 'سنة الوفاة',
    birth_place: 'مكان الميلاد',
    death_place: 'مكان الوفاة',
    bio_ar: 'السيرة',
};

export default function PendingEditShow({ edit, target, proposedFather, proposedMother, tribe }: ShowProps) {
    const tribeSlug = tribe?.slug ?? '';
    const [action, setAction] = useState<'approve' | 'reject' | null>(null);

    const approveForm = useForm({ note: '' });
    const rejectForm = useForm({ note: '' });

    const handleApprove = (e: React.FormEvent) => {
        e.preventDefault();
        approveForm.post(`/tribes/${tribeSlug}/admin/pending-edits/${edit.id}/approve`, {
            preserveScroll: true,
        });
    };

    const handleReject = (e: React.FormEvent) => {
        e.preventDefault();
        if (!rejectForm.data.note.trim()) {
            return;
        }
        rejectForm.post(`/tribes/${tribeSlug}/admin/pending-edits/${edit.id}/reject`, {
            preserveScroll: true,
        });
    };

    const data = edit.proposed_data;
    const canAct = edit.status === 'pending';

    return (
        <>
            <Head title={`مراجعة طلب #${edit.id}`} />

            <div className="landing-bg page-enter min-h-screen">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                    <div className="flex items-center justify-between mb-0">
                        <BackButton
                            href={`/tribes/${tribeSlug}/admin/pending-edits`}
                            label="العودة للقائمة"
                        />
                        <ThemeToggle />
                    </div>

                    <div className="bg-white dark:bg-night-card rounded-3xl shadow-lg border border-gold/15 overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-l from-gold-soft/50 to-transparent p-6 border-b border-gold/15">
                            <div className="flex items-start justify-between gap-4 flex-wrap">
                                <div>
                                    <h1 className="font-amiri text-[26px] font-bold text-brown-dark mb-1">
                                        {edit.edit_type === 'add_person' ? 'طلب إضافة شخص' : 'طلب تعديل شخص'}
                                    </h1>
                                    <div className="text-brown-mid text-sm flex flex-wrap gap-x-4 gap-y-1">
                                        {edit.requester && (
                                            <span>من: <strong>{edit.requester.name}</strong></span>
                                        )}
                                        {edit.created_at && (
                                            <span className="font-mono">
                                                {new Date(edit.created_at).toLocaleString('en-GB')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <StatusBadge status={edit.status} />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {edit.edit_type === 'edit_person' && target ? (
                                <DiffTable current={target} proposed={data} />
                            ) : (
                                <ProposedTable data={data} />
                            )}

                            {(proposedFather || proposedMother) && (
                                <div className="bg-beige/50 rounded-2xl p-4 border border-gold/10">
                                    <div className="text-brown-mid text-sm font-medium mb-2">الوالدان المقترحان:</div>
                                    <div className="flex flex-wrap gap-3">
                                        {proposedFather && (
                                            <ParentBadge person={proposedFather} role="الأب" tribeSlug={tribeSlug} />
                                        )}
                                        {proposedMother && (
                                            <ParentBadge person={proposedMother} role="الأم" tribeSlug={tribeSlug} />
                                        )}
                                    </div>
                                </div>
                            )}

                            {edit.reviewer && (
                                <div className="bg-beige-dark/30 rounded-2xl p-4 border border-gold/10">
                                    <div className="text-brown-mid text-sm font-medium mb-1">
                                        ملاحظة المراجع ({edit.reviewer.name}):
                                    </div>
                                    <p className="text-brown-dark text-sm">
                                        {edit.reviewer_note || '— لا توجد ملاحظة —'}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        {canAct && (
                            <div className="p-6 bg-beige/30 border-t border-gold/20">
                                {action === null && (
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setAction('approve')}
                                            className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-md hover:bg-emerald-700 transition-all"
                                        >
                                            <CheckIcon className="w-5 h-5" /> اعتماد
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setAction('reject')}
                                            className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-rose-600 text-white rounded-xl font-bold shadow-md hover:bg-rose-700 transition-all"
                                        >
                                            <XIcon className="w-5 h-5" /> رفض
                                        </button>
                                    </div>
                                )}

                                {action === 'approve' && (
                                    <form onSubmit={handleApprove} className="space-y-3">
                                        <label className="block">
                                            <span className="block text-brown-dark text-sm font-medium mb-1.5">
                                                ملاحظة الاعتماد (اختياري)
                                            </span>
                                            <textarea
                                                value={approveForm.data.note}
                                                onChange={(e) => approveForm.setData('note', e.target.value)}
                                                rows={3}
                                                className="w-full p-3 border-2 border-gold/20 rounded-xl focus:border-gold focus:outline-none bg-white"
                                                placeholder="اكتب ملاحظة للتوثيق..."
                                            />
                                        </label>
                                        <div className="flex gap-3">
                                            <button
                                                type="submit"
                                                disabled={approveForm.processing}
                                                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md disabled:opacity-50"
                                            >
                                                {approveForm.processing ? 'جاري الاعتماد...' : 'تأكيد الاعتماد'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setAction(null)}
                                                className="px-5 py-2.5 bg-white text-brown-mid border border-gold/20 rounded-xl font-medium"
                                            >
                                                إلغاء
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {action === 'reject' && (
                                    <form onSubmit={handleReject} className="space-y-3">
                                        <label className="block">
                                            <span className="block text-brown-dark text-sm font-medium mb-1.5">
                                                سبب الرفض <span className="text-rose-500">*</span>
                                            </span>
                                            <textarea
                                                value={rejectForm.data.note}
                                                onChange={(e) => rejectForm.setData('note', e.target.value)}
                                                rows={3}
                                                required
                                                className="w-full p-3 border-2 border-rose-200 rounded-xl focus:border-rose-500 focus:outline-none bg-white"
                                                placeholder="اشرح سبب الرفض ليعرف مقدم الطلب..."
                                            />
                                            {rejectForm.errors.note && (
                                                <span className="text-rose-500 text-xs">
                                                    {rejectForm.errors.note}
                                                </span>
                                            )}
                                        </label>
                                        <div className="flex gap-3">
                                            <button
                                                type="submit"
                                                disabled={rejectForm.processing || !rejectForm.data.note.trim()}
                                                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md disabled:opacity-50"
                                            >
                                                {rejectForm.processing ? 'جاري الرفض...' : 'تأكيد الرفض'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setAction(null)}
                                                className="px-5 py-2.5 bg-white text-brown-mid border border-gold/20 rounded-xl font-medium"
                                            >
                                                إلغاء
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

function StatusBadge({ status }: { status: PendingEditStatus }) {
    const config = {
        pending: { label: 'معلّق', class: 'bg-gold-soft text-brown-dark border-gold' },
        approved: { label: 'معتمد', class: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
        rejected: { label: 'مرفوض', class: 'bg-rose-50 text-rose-700 border-rose-300' },
    }[status];
    return (
        <span className={`px-3 py-1 rounded-full border font-bold text-sm ${config.class}`}>
            {config.label}
        </span>
    );
}

function ProposedTable({ data }: { data: Record<string, unknown> }) {
    const entries = Object.entries(FIELD_LABELS)
        .filter(([key]) => data[key] !== undefined && data[key] !== null && data[key] !== '');

    return (
        <div>
            <div className="text-brown-mid text-sm font-medium mb-3">البيانات المقترحة:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {entries.map(([key, label]) => (
                    <div key={key} className="flex gap-2 p-3 bg-beige/50 rounded-xl border border-gold/10">
                        <span className="text-brown-light text-sm shrink-0 font-medium min-w-[120px]">
                            {label}:
                        </span>
                        <span className="text-brown-dark text-sm">
                            {renderValue(key, data[key])}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function DiffTable({ current, proposed }: { current: BriefPerson; proposed: Record<string, unknown> }) {
    const fieldsWithChanges = Object.keys(FIELD_LABELS).filter((key) => {
        const currentVal = (current as unknown as Record<string, unknown>)[key];
        const proposedVal = proposed[key];
        return proposedVal !== undefined
            && proposedVal !== null
            && proposedVal !== ''
            && String(currentVal ?? '') !== String(proposedVal);
    });

    if (fieldsWithChanges.length === 0) {
        return (
            <div className="text-brown-mid italic text-sm text-center p-4">
                لا توجد تغييرات في هذا الطلب
            </div>
        );
    }

    return (
        <div>
            <div className="text-brown-mid text-sm font-medium mb-3">التغييرات المقترحة:</div>
            <div className="space-y-2">
                {fieldsWithChanges.map((key) => {
                    const currentVal = (current as unknown as Record<string, unknown>)[key];
                    return (
                        <div key={key} className="p-3 bg-beige/50 rounded-xl border border-gold/10">
                            <div className="text-brown-mid text-xs font-medium mb-2">
                                {FIELD_LABELS[key]}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-2 items-center">
                                <div className="text-brown-dark text-sm bg-white dark:bg-night-bg rounded-lg p-2 line-through opacity-60">
                                    {renderValue(key, currentVal) || '(فارغ)'}
                                </div>
                                <span className="text-gold justify-self-center"><ArrowLeftIcon className="w-5 h-5" /></span>
                                <div className="text-emerald-700 text-sm bg-emerald-50 rounded-lg p-2 font-medium">
                                    {renderValue(key, proposed[key])}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function ParentBadge({
    person,
    role,
    tribeSlug,
}: {
    person: BriefPerson;
    role: string;
    tribeSlug: string;
}) {
    return (
        <Link
            href={`/tribes/${tribeSlug}/persons/${person.id}`}
            className={`
                inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm transition-colors
                ${person.gender === 'female'
                    ? 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100'
                    : 'bg-white border-gold/20 text-brown-dark hover:bg-gold-soft'
                }
            `}
        >
            <span className="font-medium">{role}:</span>
            <span className="font-bold">{person.short_name_ar}</span>
        </Link>
    );
}

function renderValue(key: string, value: unknown): string {
    if (value === null || value === undefined || value === '') return '—';
    if (key === 'gender') return value === 'female' ? 'أنثى' : 'ذكر';
    return String(value);
}
