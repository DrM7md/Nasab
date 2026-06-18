import { Button } from '@/Components/UI/Button';
import EmptyState from '@/Components/UI/EmptyState';
import { ChevronIcon, EditIcon, LayoutIcon, PlusIcon, TrashIcon } from '@/Components/UI/Icons';
import Modal from '@/Components/UI/Modal';
import PageHeader from '@/Components/UI/PageHeader';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import type {
    LandingFeatureItem,
    LandingSection,
    LandingSectionType,
    PageProps,
} from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';

type LandingIndexProps = PageProps<{
    sections: LandingSection[];
}>;

const TYPE_LABELS: Record<LandingSectionType, string> = {
    hero: 'بانر رئيسي',
    about: 'تعريف',
    quote: 'اقتباس / حديث',
    features: 'مميزات',
    text: 'نص حر',
    cta: 'دعوة للتسجيل',
};

const TYPE_ICONS: Record<LandingSectionType, string> = {
    hero: '🎯',
    about: '📜',
    quote: '🕌',
    features: '✨',
    text: '📝',
    cta: '🚀',
};

export default function LandingIndex({ sections }: LandingIndexProps) {
    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState<LandingSection | null>(null);
    const [deleting, setDeleting] = useState<LandingSection | null>(null);

    const orderedIds = useMemo(() => sections.map((s) => s.id), [sections]);

    const move = (index: number, dir: -1 | 1) => {
        const target = index + dir;
        if (target < 0 || target >= orderedIds.length) return;
        const next = [...orderedIds];
        [next[index], next[target]] = [next[target], next[index]];
        router.post(
            route('admin.landing.reorder'),
            { order: next },
            { preserveScroll: true },
        );
    };

    const toggleVisible = (s: LandingSection) => {
        router.patch(
            route('admin.landing.update', s.id),
            { is_visible: !s.is_visible },
            { preserveScroll: true },
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    icon={<LayoutIcon />}
                    title="تحرير الواجهة الرئيسية"
                    subtitle="أضف أقسامًا، عدّل النصوص، أعد الترتيب أو أخفِ ما لا تريد عرضه"
                    actions={
                        <Button onClick={() => setCreating(true)} icon={<PlusIcon className="w-4 h-4" />}>
                            قسم جديد
                        </Button>
                    }
                />
            }
        >
            <Head title="تحرير الواجهة" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-3">
                {sections.length === 0 ? (
                    <div className="bg-white dark:bg-night-card rounded-2xl border border-gold/15">
                        <EmptyState
                            icon={<LayoutIcon />}
                            title="لا توجد أقسام بعد"
                            description="ابدأ بإضافة قسم لواجهة المنصّة."
                            action={
                                <Button onClick={() => setCreating(true)} icon={<PlusIcon className="w-4 h-4" />}>
                                    قسم جديد
                                </Button>
                            }
                        />
                    </div>
                ) : (
                    sections.map((section, i) => (
                        <SectionRow
                            key={section.id}
                            section={section}
                            isFirst={i === 0}
                            isLast={i === sections.length - 1}
                            onUp={() => move(i, -1)}
                            onDown={() => move(i, 1)}
                            onEdit={() => setEditing(section)}
                            onToggle={() => toggleVisible(section)}
                            onDelete={() => setDeleting(section)}
                        />
                    ))
                )}
            </div>

            {creating && (
                <SectionFormModal
                    onClose={() => setCreating(false)}
                />
            )}

            {editing && (
                <SectionFormModal
                    section={editing}
                    onClose={() => setEditing(null)}
                />
            )}

            {deleting && (
                <DeleteSectionModal
                    section={deleting}
                    onClose={() => setDeleting(null)}
                />
            )}
        </AuthenticatedLayout>
    );
}

/* ═══════════════════════════════════════════════════════════════
   Section Row
   ═══════════════════════════════════════════════════════════════ */

function SectionRow({
    section,
    isFirst,
    isLast,
    onUp,
    onDown,
    onEdit,
    onToggle,
    onDelete,
}: {
    readonly section: LandingSection;
    readonly isFirst: boolean;
    readonly isLast: boolean;
    readonly onUp: () => void;
    readonly onDown: () => void;
    readonly onEdit: () => void;
    readonly onToggle: () => void;
    readonly onDelete: () => void;
}) {
    return (
        <div
            className={`ns-card bg-white dark:bg-night-card rounded-2xl border border-gold/15 shadow-sm p-4 ${!section.is_visible ? 'opacity-60' : ''}`}
        >
            <div className="flex items-start gap-3">
                {/* Order controls */}
                <div className="flex flex-col gap-1 shrink-0">
                    <button
                        type="button"
                        onClick={onUp}
                        disabled={isFirst}
                        className="w-7 h-7 rounded-md bg-beige dark:bg-night-bg text-brown-dark hover:bg-gold hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                        title="نقل للأعلى"
                    >
                        <ChevronIcon className="w-4 h-4 rotate-90" />
                    </button>
                    <button
                        type="button"
                        onClick={onDown}
                        disabled={isLast}
                        className="w-7 h-7 rounded-md bg-beige dark:bg-night-bg text-brown-dark hover:bg-gold hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                        title="نقل للأسفل"
                    >
                        <ChevronIcon className="w-4 h-4 -rotate-90" />
                    </button>
                </div>

                {/* Type badge */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-light to-gold flex items-center justify-center text-xl shadow-md shrink-0">
                    {section.icon || TYPE_ICONS[section.type]}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-gold-soft/40 text-brown-dark rounded-md text-[10px] font-bold">
                            {TYPE_LABELS[section.type]}
                        </span>
                        {!section.is_visible && (
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-md text-[10px] font-bold">
                                مخفي
                            </span>
                        )}
                    </div>
                    {section.title && (
                        <h3 className="text-brown-dark font-bold truncate">
                            {section.title}
                        </h3>
                    )}
                    {section.subtitle && (
                        <p className="text-brown-light text-xs truncate">
                            {section.subtitle}
                        </p>
                    )}
                    {section.body && (
                        <p className="text-brown-mid text-xs mt-1 line-clamp-2">
                            {section.body}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                    <button
                        type="button"
                        onClick={onToggle}
                        title={section.is_visible ? 'إخفاء' : 'إظهار'}
                        className={`
                            relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors
                            ${section.is_visible ? 'bg-emerald-500' : 'bg-rose-400'}
                        `}
                    >
                        <span
                            className={`
                                inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform
                                ${section.is_visible ? 'translate-x-1' : 'translate-x-6'}
                            `}
                        />
                    </button>
                    <button
                        type="button"
                        onClick={onEdit}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-night-bg border border-gold/30 text-brown-dark rounded-lg text-xs font-medium hover:bg-beige transition-colors"
                    >
                        <EditIcon className="w-4 h-4" /> تعديل
                    </button>
                    <button
                        type="button"
                        onClick={onDelete}
                        title="حذف"
                        className="px-3 py-2 bg-white border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   Section Form Modal (create + edit)
   ═══════════════════════════════════════════════════════════════ */

interface FormShape {
    type: LandingSectionType;
    title: string;
    subtitle: string;
    body: string;
    icon: string;
    extra: {
        primary_label?: string;
        primary_action?: string;
        secondary_label?: string;
        secondary_action?: string;
        source?: string;
        items?: LandingFeatureItem[];
    };
    is_visible: boolean;
}

const ACTION_OPTIONS = [
    { value: '', label: '— لا شيء —' },
    { value: 'tree', label: 'الذهاب للشجرة' },
    { value: 'login', label: 'تسجيل الدخول' },
    { value: 'register', label: 'إنشاء حساب' },
    { value: 'dashboard', label: 'لوحة التحكم' },
];

function SectionFormModal({
    section,
    onClose,
}: {
    readonly section?: LandingSection;
    readonly onClose: () => void;
}) {
    const isEdit = !!section;

    const { data, setData, processing, errors, post, patch, reset } = useForm<FormShape>({
        type: section?.type ?? 'text',
        title: section?.title ?? '',
        subtitle: section?.subtitle ?? '',
        body: section?.body ?? '',
        icon: section?.icon ?? '',
        extra: section?.extra ?? {},
        is_visible: section?.is_visible ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const opts = {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        };
        if (isEdit && section) {
            patch(route('admin.landing.update', section.id), opts);
        } else {
            post(route('admin.landing.store'), opts);
        }
    };

    const updateExtra = (key: string, value: unknown) => {
        setData('extra', { ...data.extra, [key]: value });
    };

    const updateItem = (i: number, key: keyof LandingFeatureItem, value: string) => {
        const items = [...(data.extra.items ?? [])];
        items[i] = { ...items[i], [key]: value };
        updateExtra('items', items);
    };

    const addItem = () => {
        updateExtra('items', [...(data.extra.items ?? []), { icon: '', title: '', body: '' }]);
    };

    const removeItem = (i: number) => {
        const items = (data.extra.items ?? []).filter((_, idx) => idx !== i);
        updateExtra('items', items);
    };

    return (
        <Modal
            isOpen
            onClose={onClose}
            title={isEdit ? 'تعديل القسم' : 'قسم جديد'}
            size="lg"
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>إلغاء</Button>
                    <Button type="submit" form="section-form" disabled={processing}>
                        {processing ? 'جارٍ الحفظ...' : isEdit ? 'حفظ' : 'إضافة'}
                    </Button>
                </>
            }
        >
            <form id="section-form" onSubmit={handleSubmit} className="space-y-4">
                {/* Type */}
                <Field label="نوع القسم" error={errors.type}>
                    <select
                        value={data.type}
                        onChange={(e) => setData('type', e.target.value as LandingSectionType)}
                        disabled={isEdit}
                        className="input"
                    >
                        {(Object.keys(TYPE_LABELS) as LandingSectionType[]).map((t) => (
                            <option key={t} value={t}>
                                {TYPE_ICONS[t]} {TYPE_LABELS[t]}
                            </option>
                        ))}
                    </select>
                    {isEdit && (
                        <p className="text-brown-light text-[11px] mt-1">
                            لا يمكن تغيير النوع بعد الإنشاء — احذف وأنشئ قسماً جديداً
                        </p>
                    )}
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Field label="العنوان" error={errors.title} className="sm:col-span-2">
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className="input"
                            placeholder="عنوان القسم"
                        />
                    </Field>
                    <Field label="أيقونة (إيموجي)" error={errors.icon}>
                        <input
                            type="text"
                            value={data.icon}
                            onChange={(e) => setData('icon', e.target.value)}
                            className="input text-center text-xl"
                            placeholder="🌳"
                            maxLength={4}
                        />
                    </Field>
                </div>

                {data.type !== 'quote' && (
                    <Field label="عنوان فرعي" error={errors.subtitle}>
                        <input
                            type="text"
                            value={data.subtitle}
                            onChange={(e) => setData('subtitle', e.target.value)}
                            className="input"
                            placeholder="نص قصير فوق العنوان"
                        />
                    </Field>
                )}

                {data.type !== 'features' && (
                    <Field
                        label={data.type === 'quote' ? 'نص الاقتباس / الحديث' : 'النص'}
                        error={errors.body}
                    >
                        <textarea
                            value={data.body}
                            onChange={(e) => setData('body', e.target.value)}
                            className="input min-h-[120px]"
                            placeholder={
                                data.type === 'quote'
                                    ? 'اكتب الحديث أو الاقتباس هنا...'
                                    : 'محتوى القسم'
                            }
                        />
                    </Field>
                )}

                {/* Quote source */}
                {data.type === 'quote' && (
                    <Field label="المصدر" error={null}>
                        <input
                            type="text"
                            value={data.extra.source ?? ''}
                            onChange={(e) => updateExtra('source', e.target.value)}
                            className="input"
                            placeholder="رواه البخاري — صحيح مسلم — …"
                        />
                    </Field>
                )}

                {/* Hero / CTA buttons */}
                {(data.type === 'hero' || data.type === 'cta') && (
                    <div className="bg-beige/40 dark:bg-night-bg/40 rounded-xl p-4 space-y-3 border border-gold/10">
                        <p className="text-brown-dark font-bold text-sm">أزرار الإجراءات</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Field label="زر رئيسي — النص">
                                <input
                                    type="text"
                                    value={data.extra.primary_label ?? ''}
                                    onChange={(e) => updateExtra('primary_label', e.target.value)}
                                    className="input"
                                    placeholder="مثال: تصفّح الشجرة"
                                />
                            </Field>
                            <Field label="زر رئيسي — الإجراء">
                                <select
                                    value={data.extra.primary_action ?? ''}
                                    onChange={(e) => updateExtra('primary_action', e.target.value)}
                                    className="input"
                                >
                                    {ACTION_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>
                                            {o.label}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="زر ثانوي — النص">
                                <input
                                    type="text"
                                    value={data.extra.secondary_label ?? ''}
                                    onChange={(e) => updateExtra('secondary_label', e.target.value)}
                                    className="input"
                                    placeholder="مثال: إنشاء حساب"
                                />
                            </Field>
                            <Field label="زر ثانوي — الإجراء">
                                <select
                                    value={data.extra.secondary_action ?? ''}
                                    onChange={(e) => updateExtra('secondary_action', e.target.value)}
                                    className="input"
                                >
                                    {ACTION_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>
                                            {o.label}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        </div>
                    </div>
                )}

                {/* Features items */}
                {data.type === 'features' && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-brown-dark font-bold text-sm">بطاقات المميزات</p>
                            <button
                                type="button"
                                onClick={addItem}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold-soft text-brown-dark rounded-lg text-xs font-bold hover:bg-gold hover:text-white transition-colors"
                            >
                                <PlusIcon className="w-3.5 h-3.5" /> إضافة بطاقة
                            </button>
                        </div>
                        {(data.extra.items ?? []).length === 0 && (
                            <p className="text-brown-light text-xs text-center py-4 border border-dashed border-gold/30 rounded-lg">
                                لا توجد بطاقات — اضغط "إضافة بطاقة"
                            </p>
                        )}
                        {(data.extra.items ?? []).map((item, i) => (
                            <div
                                key={`item-${i}`}
                                className="border border-gold/15 rounded-xl p-3 bg-beige/30 dark:bg-night-bg/30"
                            >
                                <div className="flex items-start gap-2">
                                    <input
                                        type="text"
                                        value={item.icon ?? ''}
                                        onChange={(e) => updateItem(i, 'icon', e.target.value)}
                                        className="input w-14 text-center text-xl"
                                        placeholder="✨"
                                        maxLength={4}
                                    />
                                    <div className="flex-1 space-y-2">
                                        <input
                                            type="text"
                                            value={item.title ?? ''}
                                            onChange={(e) => updateItem(i, 'title', e.target.value)}
                                            className="input"
                                            placeholder="عنوان البطاقة"
                                        />
                                        <textarea
                                            value={item.body ?? ''}
                                            onChange={(e) => updateItem(i, 'body', e.target.value)}
                                            className="input min-h-[60px]"
                                            placeholder="وصف البطاقة"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeItem(i)}
                                        className="px-2 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                                        title="حذف"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Visibility */}
                <label className="flex items-center gap-3 cursor-pointer pt-2 border-t border-gold/10">
                    <input
                        type="checkbox"
                        checked={data.is_visible}
                        onChange={(e) => setData('is_visible', e.target.checked)}
                        className="w-4 h-4 accent-gold"
                    />
                    <span className="text-brown-dark text-sm">القسم مرئي على الواجهة</span>
                </label>
            </form>

            <style>{`
                .input {
                    width: 100%;
                    padding: 0.55rem 0.85rem;
                    background: white;
                    border: 1px solid rgba(139, 105, 20, 0.2);
                    border-radius: 0.75rem;
                    color: #3D2B1F;
                    font-size: 0.875rem;
                    transition: border-color 0.2s;
                }
                .input:focus {
                    outline: none;
                    border-color: #8B6914;
                    box-shadow: 0 0 0 3px rgba(139, 105, 20, 0.1);
                }
                .dark .input {
                    background: #2C1F10;
                    color: #F5EFE6;
                    border-color: rgba(201, 168, 76, 0.25);
                }
            `}</style>
        </Modal>
    );
}

/* ═══════════════════════════════════════════════════════════════
   Field wrapper
   ═══════════════════════════════════════════════════════════════ */
function Field({
    label,
    error,
    className,
    children,
}: {
    readonly label: string;
    readonly error?: string | null;
    readonly className?: string;
    readonly children: React.ReactNode;
}) {
    return (
        <div className={className}>
            <label className="block text-brown-dark text-xs font-bold mb-1.5">
                {label}
            </label>
            {children}
            {error && (
                <p className="text-rose-600 text-xs mt-1">{error}</p>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   Delete Modal
   ═══════════════════════════════════════════════════════════════ */
function DeleteSectionModal({
    section,
    onClose,
}: {
    readonly section: LandingSection;
    readonly onClose: () => void;
}) {
    const [processing, setProcessing] = useState(false);

    const handleDelete = () => {
        setProcessing(true);
        router.delete(route('admin.landing.destroy', section.id), {
            preserveScroll: true,
            onSuccess: () => onClose(),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <Modal
            isOpen
            onClose={onClose}
            title="حذف قسم"
            size="sm"
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>إلغاء</Button>
                    <Button variant="danger" onClick={handleDelete} disabled={processing} icon={<TrashIcon className="w-4 h-4" />}>
                        {processing ? 'جارٍ الحذف...' : 'احذف'}
                    </Button>
                </>
            }
        >
            <p className="text-brown-dark text-sm leading-relaxed">
                سيُحذف القسم <strong>"{section.title || TYPE_LABELS[section.type]}"</strong> نهائياً.
                إن كنت تريد إخفاءه فقط، استخدم زر الإخفاء بدلاً من الحذف.
            </p>
        </Modal>
    );
}
