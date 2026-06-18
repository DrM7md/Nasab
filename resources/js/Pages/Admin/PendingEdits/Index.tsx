import BackButton from '@/Components/UI/BackButton';
import EmptyState from '@/Components/UI/EmptyState';
import {
    CheckIcon,
    EditIcon,
    KinshipIcon,
    PlusIcon,
    ShieldCheckIcon,
    TrashIcon,
} from '@/Components/UI/Icons';
import ThemeToggle from '@/Components/UI/ThemeToggle';
import type { PageProps, Paginated, PendingEdit, PendingEditStatus } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import type { ReactNode } from 'react';

const TYPE_LABELS: Record<string, string> = {
    add_person: 'إضافة شخص',
    edit_person: 'تعديل شخص',
    add_relationship: 'إضافة علاقة',
    edit_relationship: 'تعديل علاقة',
    add_marriage: 'إضافة زواج',
    edit_marriage: 'تعديل زواج',
    delete: 'حذف',
};

function typeIcon(type: string): ReactNode {
    const cls = 'w-5 h-5';
    switch (type) {
        case 'add_person': return <PlusIcon className={cls} />;
        case 'edit_person': return <EditIcon className={cls} />;
        case 'add_relationship':
        case 'edit_relationship':
        case 'add_marriage':
        case 'edit_marriage': return <KinshipIcon className={cls} />;
        case 'delete': return <TrashIcon className={cls} />;
        default: return <EditIcon className={cls} />;
    }
}

interface EditRow extends Omit<PendingEdit, 'reviewer' | 'requester'> {
    requester: { id: number; name: string; email: string; role: string } | null;
    reviewer: { id: number; name: string } | null;
}

type IndexProps = PageProps<{
    edits: Paginated<EditRow>;
    status: PendingEditStatus | 'all';
    counts: { pending: number; approved: number; rejected: number };
}>;

export default function PendingEditsIndex({ edits, status, counts, tribe }: IndexProps) {
    const tribeSlug = tribe?.slug ?? '';

    const filter = (newStatus: string) => {
        router.get(
            `/tribes/${tribeSlug}/admin/pending-edits`,
            { status: newStatus },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <>
            <Head title="طلبات الموافقة" />

            <div className="landing-bg page-enter min-h-screen">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                    <div className="flex items-center justify-between mb-0">
                        <BackButton href={`/tribes/${tribeSlug}/tree`} label="العودة للشجرة" />
                        <ThemeToggle />
                    </div>

                    <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
                        <div className="flex items-center gap-3">
                            <span className="w-11 h-11 rounded-2xl bg-gold-soft/50 border border-gold/20 text-gold flex items-center justify-center shrink-0">
                                <ShieldCheckIcon />
                            </span>
                            <div>
                                <h1 className="font-amiri text-2xl sm:text-[30px] font-bold text-brown-dark">
                                    طلبات الموافقة
                                </h1>
                                <p className="text-brown-light text-sm">
                                    مراجعة واعتماد طلبات إضافة وتعديل البيانات
                                </p>
                            </div>
                        </div>

                        {counts.pending > 0 && status === 'pending' && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (confirm(`هل أنت متأكد من اعتماد جميع الطلبات (${counts.pending})؟`)) {
                                        router.post(
                                            `/tribes/${tribeSlug}/admin/pending-edits/approve-all`,
                                            {},
                                            { preserveScroll: true },
                                        );
                                    }
                                }}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold shadow-md hover:bg-emerald-700 transition-all"
                            >
                                <CheckIcon className="w-4 h-4" /> اعتماد الكل ({counts.pending})
                            </button>
                        )}
                    </div>

                    {/* فلاتر الحالة */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        <FilterTab
                            active={status === 'pending'}
                            onClick={() => filter('pending')}
                            label="المعلّقة"
                            count={counts.pending}
                            color="gold"
                        />
                        <FilterTab
                            active={status === 'approved'}
                            onClick={() => filter('approved')}
                            label="المعتمدة"
                            count={counts.approved}
                            color="emerald"
                        />
                        <FilterTab
                            active={status === 'rejected'}
                            onClick={() => filter('rejected')}
                            label="المرفوضة"
                            count={counts.rejected}
                            color="rose"
                        />
                        <FilterTab
                            active={status === 'all'}
                            onClick={() => filter('all')}
                            label="الكل"
                            count={counts.pending + counts.approved + counts.rejected}
                            color="brown"
                        />
                    </div>

                    {/* القائمة */}
                    {edits.data.length === 0 ? (
                        <div className="bg-white dark:bg-night-card rounded-2xl border border-gold/15 shadow-sm">
                            <EmptyState icon={<ShieldCheckIcon />} title="لا توجد طلبات" description="لا توجد طلبات في هذا التصنيف حالياً." />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {edits.data.map((edit) => (
                                <EditRowCard
                                    key={edit.id}
                                    edit={edit}
                                    tribeSlug={tribeSlug}
                                />
                            ))}
                        </div>
                    )}

                    {/* Pagination (بسيط) */}
                    {edits.last_page > 1 && (
                        <div className="flex justify-center gap-2 mt-6">
                            {edits.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url ?? '#'}
                                    preserveState
                                    preserveScroll
                                    className={`
                                        px-3 py-1.5 rounded-lg text-sm
                                        ${link.active
                                            ? 'bg-gold text-white'
                                            : 'bg-white text-brown-mid border border-gold/20 hover:bg-beige'
                                        }
                                        ${!link.url ? 'opacity-40 pointer-events-none' : ''}
                                    `}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

function FilterTab({
    active,
    onClick,
    label,
    count,
    color,
}: {
    active: boolean;
    onClick: () => void;
    label: string;
    count: number;
    color: 'gold' | 'emerald' | 'rose' | 'brown';
}) {
    const colorClasses = {
        gold: active ? 'bg-gold text-white' : 'bg-white text-brown-mid border border-gold/20',
        emerald: active ? 'bg-emerald-600 text-white' : 'bg-white text-brown-mid border border-emerald-200',
        rose: active ? 'bg-rose-500 text-white' : 'bg-white text-brown-mid border border-rose-200',
        brown: active ? 'bg-brown-dark text-white' : 'bg-white text-brown-mid border border-brown-light/20',
    };

    return (
        <button
            type="button"
            onClick={onClick}
            className={`
                px-4 py-2 rounded-xl font-medium text-sm transition-all
                ${colorClasses[color]}
                ${!active && 'hover:bg-beige'}
            `}
        >
            {label}
            <span className={`mr-2 px-1.5 py-0.5 rounded-md text-xs ${
                active ? 'bg-white/20' : 'bg-brown-dark/5'
            }`}>
                {count}
            </span>
        </button>
    );
}

function EditRowCard({ edit, tribeSlug }: { edit: EditRow; tribeSlug: string }) {
    const data = edit.proposed_data as Record<string, unknown>;
    const displayName = (data.short_name_ar ?? data.name_ar ?? '—') as string;

    const statusColor = {
        pending: 'bg-gold-soft text-brown-dark border-gold',
        approved: 'bg-emerald-50 text-emerald-700 border-emerald-300',
        rejected: 'bg-rose-50 text-rose-700 border-rose-300',
    }[edit.status];

    const statusLabel = {
        pending: 'معلّق',
        approved: 'معتمد',
        rejected: 'مرفوض',
    }[edit.status];

    return (
        <Link
            href={`/tribes/${tribeSlug}/admin/pending-edits/${edit.id}`}
            className="ns-card block bg-white dark:bg-night-card rounded-2xl border border-gold/15 p-4 shadow-sm"
            dir="rtl"
        >
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gold-soft/50 border border-gold/20 text-gold flex items-center justify-center shrink-0">
                    {typeIcon(edit.edit_type)}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-brown-dark font-bold">
                            {TYPE_LABELS[edit.edit_type] ?? edit.edit_type}
                        </span>
                        <span className="text-brown-mid">—</span>
                        <span className="text-brown-dark font-medium">{displayName}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor}`}>
                            {statusLabel}
                        </span>
                    </div>

                    <div className="text-brown-light text-xs flex flex-wrap gap-x-3 gap-y-1">
                        {edit.requester && (
                            <span>
                                من: <strong className="text-brown-mid">{edit.requester.name}</strong>
                            </span>
                        )}
                        {edit.created_at && (
                            <span className="font-mono">
                                {new Date(edit.created_at).toLocaleDateString('en-GB')}
                            </span>
                        )}
                        {edit.reviewer && (
                            <span>
                                راجعه: <strong className="text-brown-mid">{edit.reviewer.name}</strong>
                            </span>
                        )}
                    </div>
                </div>

                <svg
                    className="w-5 h-5 text-brown-light shrink-0 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M15 19l-7-7 7-7" />
                </svg>
            </div>
        </Link>
    );
}
