import { BugIcon, ClockIcon, LightbulbIcon, LinkIcon, TribeIcon, TrashIcon, UserIcon } from '@/Components/UI/Icons';
import PageHeader from '@/Components/UI/PageHeader';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import type {
    Feedback,
    FeedbackStatus,
    FeedbackType,
    PageProps,
    Paginated,
} from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

type Tab = 'all' | FeedbackType;
type StatusFilter = 'all' | FeedbackStatus;

type FeedbackIndexProps = PageProps<{
    items: Paginated<Feedback>;
    tab: Tab;
    status: StatusFilter;
    perPage: number;
    counts: { new: number; idea: number; bug: number; total: number };
}>;

const TYPE_META: Record<FeedbackType, { label: string; icon: typeof LightbulbIcon; cls: string }> = {
    idea: { label: 'اقتراح', icon: LightbulbIcon, cls: 'bg-gold-soft text-brown-dark border-gold/40' },
    bug: { label: 'خلل', icon: BugIcon, cls: 'bg-rose-100 text-rose-800 border-rose-300' },
};

const STATUS_META: Record<FeedbackStatus, { label: string; cls: string }> = {
    new: { label: 'جديد', cls: 'bg-blue-100 text-blue-800 border-blue-300' },
    in_review: { label: 'قيد المراجعة', cls: 'bg-amber-100 text-amber-800 border-amber-300' },
    resolved: { label: 'تم الحل', cls: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
};

const STATUS_FLOW: FeedbackStatus[] = ['new', 'in_review', 'resolved'];

export default function FeedbackIndex({
    items,
    tab,
    status,
    perPage,
    counts,
}: FeedbackIndexProps) {
    const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);

    const filter = (overrides: Record<string, unknown> = {}) => {
        router.get(
            route('admin.feedback.index'),
            { tab, status, per_page: perPage, ...overrides },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    icon={<LightbulbIcon />}
                    title="الاقتراحات والبلاغات"
                    subtitle="رسائل المستخدمين — أفكار التطوير وبلاغات الأخطاء"
                />
            }
        >
            <Head title="الاقتراحات والبلاغات" />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-5">
                {/* تبويبات النوع */}
                <div className="flex flex-wrap gap-2">
                    <Pill active={tab === 'all'} onClick={() => filter({ tab: 'all' })}>
                        الكل <Count n={counts.total} />
                    </Pill>
                    <Pill active={tab === 'idea'} onClick={() => filter({ tab: 'idea' })}>
                        <LightbulbIcon className="w-4 h-4" /> اقتراحات <Count n={counts.idea} />
                    </Pill>
                    <Pill active={tab === 'bug'} onClick={() => filter({ tab: 'bug' })}>
                        <BugIcon className="w-4 h-4" /> أخطاء <Count n={counts.bug} />
                    </Pill>
                </div>

                {/* فلتر الحالة */}
                <div className="flex flex-wrap gap-2 text-sm">
                    {(['all', 'new', 'in_review', 'resolved'] as StatusFilter[]).map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => filter({ status: s })}
                            className={`px-3 py-1.5 rounded-lg border transition-colors ${
                                status === s
                                    ? 'bg-brown-dark text-white border-brown-dark'
                                    : 'bg-white dark:bg-night-card text-brown-mid border-gold/20 hover:bg-beige'
                            }`}
                        >
                            {s === 'all' ? 'كل الحالات' : STATUS_META[s].label}
                            {s === 'new' && counts.new > 0 && (
                                <span className="mr-1.5 text-rose-500 font-bold">({counts.new})</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* القائمة */}
                {items.data.length === 0 ? (
                    <div className="bg-white dark:bg-night-card rounded-2xl border border-gold/15 p-12 text-center text-brown-mid">
                        لا توجد رسائل في هذا التصنيف
                    </div>
                ) : (
                    <div className="space-y-4">
                        {items.data.map((f) => (
                            <FeedbackCard
                                key={f.id}
                                item={f}
                                onViewPhoto={() => f.screenshot && setViewingPhoto(f.screenshot)}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {items.last_page > 1 && (
                    <div className="flex justify-center flex-wrap gap-2">
                        {items.links.map((link) => (
                            <Link
                                key={link.label + (link.url ?? '')}
                                href={link.url ?? '#'}
                                preserveState
                                preserveScroll
                                className={`px-3 py-1.5 rounded-lg text-sm ${
                                    link.active
                                        ? 'bg-gold text-white'
                                        : 'bg-white text-brown-mid border border-gold/20 hover:bg-beige'
                                } ${link.url ? '' : 'opacity-40 pointer-events-none'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* معاينة الصورة بملء الشاشة */}
            {viewingPhoto && (
                <button
                    type="button"
                    onClick={() => setViewingPhoto(null)}
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
                    aria-label="إغلاق"
                >
                    <img
                        src={viewingPhoto}
                        alt="صورة البلاغ"
                        className="max-w-4xl w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
                    />
                </button>
            )}
        </AuthenticatedLayout>
    );
}

function FeedbackCard({
    item,
    onViewPhoto,
}: {
    readonly item: Feedback;
    readonly onViewPhoto: () => void;
}) {
    const [note, setNote] = useState(item.admin_note ?? '');
    const [savingNote, setSavingNote] = useState(false);
    const type = TYPE_META[item.type];
    const st = STATUS_META[item.status];

    const setStatus = (status: FeedbackStatus) => {
        router.patch(route('admin.feedback.update', item.id), { status }, { preserveScroll: true });
    };

    const saveNote = () => {
        setSavingNote(true);
        router.patch(
            route('admin.feedback.update', item.id),
            { admin_note: note },
            { preserveScroll: true, onFinish: () => setSavingNote(false) },
        );
    };

    const remove = () => {
        if (confirm('حذف هذا البلاغ نهائياً؟')) {
            router.delete(route('admin.feedback.destroy', item.id), { preserveScroll: true });
        }
    };

    const date = item.created_at
        ? new Date(item.created_at).toLocaleString('ar', {
              dateStyle: 'medium',
              timeStyle: 'short',
          })
        : '';

    return (
        <div className="bg-white dark:bg-night-card rounded-2xl border border-gold/15 shadow-sm overflow-hidden">
            <div className="p-5 space-y-4">
                {/* رأس البطاقة */}
                <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold ${type.cls}`}>
                            <type.icon className="w-3.5 h-3.5" /> {type.label}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full border text-xs font-bold ${st.cls}`}>
                            {st.label}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={remove}
                        className="inline-flex items-center gap-1 text-rose-500 hover:text-rose-700 text-xs font-medium"
                    >
                        <TrashIcon className="w-4 h-4" /> حذف
                    </button>
                </div>

                {/* الرسالة */}
                <p className="text-brown-dark whitespace-pre-wrap leading-relaxed">{item.message}</p>

                {/* الصورة المرفقة */}
                {item.screenshot && (
                    <button
                        type="button"
                        onClick={onViewPhoto}
                        className="block group"
                        aria-label="تكبير الصورة"
                    >
                        <img
                            src={item.screenshot}
                            alt="مرفق البلاغ"
                            className="max-h-44 rounded-xl border border-gold/20 group-hover:opacity-90 transition-opacity cursor-zoom-in"
                        />
                    </button>
                )}

                {/* بيانات المُرسِل */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brown-light border-t border-gold/10 pt-3">
                    <span className="inline-flex items-center gap-1"><UserIcon className="w-3.5 h-3.5" /> {item.user?.name ?? 'مستخدم محذوف'}</span>
                    {item.user?.email && <span dir="ltr" className="font-mono">{item.user.email}</span>}
                    {item.tribe && <span className="inline-flex items-center gap-1"><TribeIcon className="w-3.5 h-3.5" /> {item.tribe.name_ar}</span>}
                    {item.page_url && (
                        <span dir="ltr" className="inline-flex items-center gap-1 font-mono truncate max-w-[260px]" title={item.page_url}>
                            <LinkIcon className="w-3.5 h-3.5 shrink-0" /> {item.page_url}
                        </span>
                    )}
                    {date && <span className="inline-flex items-center gap-1"><ClockIcon className="w-3.5 h-3.5" /> {date}</span>}
                </div>

                {/* تغيير الحالة */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-brown-mid font-medium">الحالة:</span>
                    {STATUS_FLOW.map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => setStatus(s)}
                            disabled={item.status === s}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                                item.status === s
                                    ? `${STATUS_META[s].cls} cursor-default`
                                    : 'bg-white dark:bg-night-bg text-brown-mid border-gold/20 hover:bg-beige'
                            }`}
                        >
                            {STATUS_META[s].label}
                        </button>
                    ))}
                </div>

                {/* ملاحظة المدير */}
                <div className="flex items-start gap-2">
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={1}
                        placeholder="ملاحظة داخلية للمدير (اختياري)..."
                        className="flex-1 px-3 py-2 rounded-lg bg-beige/40 dark:bg-night-bg border border-gold/20 focus:border-gold focus:outline-none text-sm text-brown-dark resize-y"
                    />
                    {note !== (item.admin_note ?? '') && (
                        <button
                            type="button"
                            onClick={saveNote}
                            disabled={savingNote}
                            className="px-3 py-2 bg-gold text-white rounded-lg text-sm font-medium hover:bg-gold-light disabled:opacity-50 whitespace-nowrap"
                        >
                            {savingNote ? '...' : 'حفظ'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function Pill({
    active,
    onClick,
    children,
}: {
    readonly active: boolean;
    readonly onClick: () => void;
    readonly children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                active
                    ? 'bg-gold text-white shadow-md'
                    : 'bg-white dark:bg-night-card text-brown-mid border border-gold/20 hover:bg-beige'
            }`}
        >
            {children}
        </button>
    );
}

function Count({ n }: { readonly n: number }) {
    return (
        <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-black/10 text-xs font-bold flex items-center justify-center">
            {n}
        </span>
    );
}
