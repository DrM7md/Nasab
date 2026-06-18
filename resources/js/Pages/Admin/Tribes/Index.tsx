import { Button } from '@/Components/UI/Button';
import EmptyState from '@/Components/UI/EmptyState';
import { EditIcon, PlusIcon, TrashIcon, TreeNodesIcon, TribeIcon } from '@/Components/UI/Icons';
import Modal from '@/Components/UI/Modal';
import PageHeader from '@/Components/UI/PageHeader';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import type { PageProps } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

interface PackageOption {
    id: number;
    name_ar: string;
}

interface TribeRow {
    id: number;
    name_ar: string;
    slug: string;
    description_ar: string | null;
    is_active: boolean;
    package_id: number | null;
    package: PackageOption | null;
    persons_count: number;
    users_count: number;
}

type TribesIndexProps = PageProps<{
    tribes: TribeRow[];
    packages: PackageOption[];
}>;

export default function TribesIndex({ tribes, packages }: TribesIndexProps) {
    const [showCreate, setShowCreate] = useState(false);
    const [editing, setEditing] = useState<TribeRow | null>(null);
    const [deleting, setDeleting] = useState<TribeRow | null>(null);

    const toggleActive = (tribe: TribeRow) => {
        router.patch(
            route('admin.tribes.update', tribe.slug),
            { is_active: !tribe.is_active },
            { preserveScroll: true },
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    icon={<TribeIcon />}
                    title="إدارة القبائل"
                    subtitle="أنشئ قبائل جديدة وعدّل بياناتها"
                    actions={
                        <Button onClick={() => setShowCreate(true)} icon={<PlusIcon className="w-4 h-4" />}>
                            قبيلة جديدة
                        </Button>
                    }
                />
            }
        >
            <Head title="إدارة القبائل" />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                {tribes.length === 0 ? (
                    <EmptyState
                        icon={<TribeIcon />}
                        title="لا توجد قبائل بعد"
                        description="ابدأ بإنشاء أول قبيلة في النظام."
                        action={
                            <Button onClick={() => setShowCreate(true)} icon={<PlusIcon className="w-4 h-4" />}>
                                قبيلة جديدة
                            </Button>
                        }
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tribes.map((t) => (
                            <TribeCard
                                key={t.id}
                                tribe={t}
                                onEdit={() => setEditing(t)}
                                onDelete={() => setDeleting(t)}
                                onToggleActive={() => toggleActive(t)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modal إنشاء */}
            <CreateTribeModal
                isOpen={showCreate}
                onClose={() => setShowCreate(false)}
                packages={packages}
            />

            {/* Modal تعديل */}
            {editing && (
                <EditTribeModal
                    tribe={editing}
                    onClose={() => setEditing(null)}
                    packages={packages}
                />
            )}

            {/* Modal حذف */}
            {deleting && (
                <DeleteTribeModal
                    tribe={deleting}
                    onClose={() => setDeleting(null)}
                />
            )}
        </AuthenticatedLayout>
    );
}

function TribeCard({
    tribe,
    onEdit,
    onDelete,
    onToggleActive,
}: {
    readonly tribe: TribeRow;
    readonly onEdit: () => void;
    readonly onDelete: () => void;
    readonly onToggleActive: () => void;
}) {
    return (
        <div
            className={`ns-card bg-white dark:bg-night-card rounded-2xl border border-gold/15 shadow-sm p-5 ${!tribe.is_active ? 'opacity-70' : ''}`}
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-gold-light to-gold">
                        <TribeIcon className="w-5 h-5" />
                    </span>
                    <div>
                        <h3 className="text-brown-dark font-bold">{tribe.name_ar}</h3>
                        <div className="text-brown-light text-[11px] font-mono" dir="ltr">
                            /{tribe.slug}
                        </div>
                    </div>
                </div>

                {/* مفتاح التفعيل */}
                <button
                    type="button"
                    onClick={onToggleActive}
                    title={tribe.is_active ? 'إيقاف القبيلة' : 'تفعيل القبيلة'}
                    className={`
                        relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors
                        ${tribe.is_active ? 'bg-emerald-500' : 'bg-rose-400'}
                    `}
                >
                    <span
                        className={`
                            inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform
                            ${tribe.is_active ? 'translate-x-1' : 'translate-x-6'}
                        `}
                    />
                </button>
            </div>

            {!tribe.is_active && (
                <div className="mb-3 inline-flex items-center gap-1.5 px-2 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-bold">
                    القبيلة معطّلة (لا تظهر للزوّار)
                </div>
            )}

            {tribe.description_ar && (
                <p className="text-brown-mid text-xs mb-3 line-clamp-2">
                    {tribe.description_ar}
                </p>
            )}

            <div className="grid grid-cols-3 gap-2 text-center mb-3">
                <div className="bg-beige/50 dark:bg-night-bg rounded-lg py-2">
                    <div className="text-brown-dark font-bold">{tribe.persons_count}</div>
                    <div className="text-brown-light text-[10px]">أشخاص</div>
                </div>
                <div className="bg-beige/50 dark:bg-night-bg rounded-lg py-2">
                    <div className="text-brown-dark font-bold">{tribe.users_count}</div>
                    <div className="text-brown-light text-[10px]">أعضاء</div>
                </div>
                <div className="bg-beige/50 dark:bg-night-bg rounded-lg py-2">
                    <div className="text-brown-dark font-bold text-xs truncate px-1">
                        {tribe.package?.name_ar ?? '—'}
                    </div>
                    <div className="text-brown-light text-[10px]">الباقة</div>
                </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-gold/10">
                <Link
                    href={`/tribes/${tribe.slug}/tree`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-gold-soft text-brown-dark rounded-lg text-xs font-medium hover:bg-gold hover:text-white transition-colors"
                >
                    <TreeNodesIcon className="w-4 h-4" /> الشجرة
                </Link>
                <button
                    type="button"
                    onClick={onEdit}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white dark:bg-night-bg border border-gold/30 text-brown-dark rounded-lg text-xs font-medium hover:bg-beige transition-colors"
                >
                    <EditIcon className="w-4 h-4" /> تعديل
                </button>
                <button
                    type="button"
                    onClick={onDelete}
                    title="حذف القبيلة"
                    className="px-3 py-2 bg-white border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                >
                    <TrashIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════
   Delete Modal
   ═══════════════════════════════════════════════ */
function DeleteTribeModal({ tribe, onClose }: { readonly tribe: TribeRow; readonly onClose: () => void }) {
    const [confirmText, setConfirmText] = useState('');
    const [processing, setProcessing] = useState(false);

    const canDelete = confirmText.trim() === tribe.name_ar.trim();

    const handleDelete = () => {
        if (!canDelete) return;
        setProcessing(true);
        router.delete(route('admin.tribes.destroy', tribe.slug), {
            preserveScroll: false,
            onSuccess: () => onClose(),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title="حذف قبيلة"
            size="md"
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>إلغاء</Button>
                    <Button variant="danger" onClick={handleDelete} disabled={!canDelete || processing} icon={<TrashIcon className="w-4 h-4" />}>
                        {processing ? 'جاري الحذف...' : 'احذف نهائياً'}
                    </Button>
                </>
            }
        >
            <div className="space-y-4">
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
                    <div className="flex items-start gap-3">
                        <span className="text-rose-500 shrink-0"><TrashIcon className="w-7 h-7" /></span>
                        <div className="text-rose-800 dark:text-rose-300 text-sm leading-relaxed">
                            <p className="font-bold mb-2">
                                ستُحذف قبيلة <strong>"{tribe.name_ar}"</strong> وكل بياناتها نهائياً:
                            </p>
                            <ul className="list-disc pr-5 space-y-0.5 text-xs">
                                <li>
                                    <strong>{tribe.persons_count}</strong> شخص في الشجرة
                                </li>
                                <li>كل سجلات الزواج والقرابة</li>
                                <li>كل طلبات الموافقة</li>
                                <li>
                                    سيُفصل <strong>{tribe.users_count}</strong> مستخدم عن القبيلة
                                    (لا يُحذفون)
                                </li>
                            </ul>
                            <p className="mt-2 font-bold">هذه العملية لا يمكن التراجع عنها.</p>
                        </div>
                    </div>
                </div>

                <label className="block">
                    <span className="block text-brown-dark text-sm font-medium mb-1.5">
                        للتأكيد، اكتب اسم القبيلة:{' '}
                        <code className="px-1.5 py-0.5 bg-beige-dark rounded font-mono text-brown-dark">
                            {tribe.name_ar}
                        </code>
                    </span>
                    <input
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        autoFocus
                        placeholder="اكتب اسم القبيلة هنا..."
                        className="w-full px-4 py-2.5 border-2 border-rose-200 dark:border-rose-900/40 rounded-xl focus:border-rose-500 focus:outline-none"
                    />
                </label>
            </div>
        </Modal>
    );
}

/* ═══════════════════════════════════════════════
   Create Modal
   ═══════════════════════════════════════════════ */
function CreateTribeModal({ isOpen, onClose, packages }: { isOpen: boolean; onClose: () => void; packages: PackageOption[] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name_ar: '',
        slug: '',
        description_ar: '',
        package_id: null as number | null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.tribes.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="إنشاء قبيلة جديدة"
            size="lg"
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>إلغاء</Button>
                    <Button onClick={submit} disabled={processing}>
                        {processing ? 'جاري الإنشاء...' : 'إنشاء'}
                    </Button>
                </>
            }
        >
            <TribeFormFields data={data} setData={setData} errors={errors} packages={packages} isNew />
        </Modal>
    );
}

/* ═══════════════════════════════════════════════
   Edit Modal
   ═══════════════════════════════════════════════ */
function EditTribeModal({ tribe, onClose, packages }: { tribe: TribeRow; onClose: () => void; packages: PackageOption[] }) {
    const { data, setData, patch, processing, errors } = useForm({
        name_ar: tribe.name_ar,
        slug: tribe.slug,
        description_ar: tribe.description_ar ?? '',
        package_id: tribe.package_id as number | null,
        is_active: tribe.is_active,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('admin.tribes.update', tribe.slug), {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={`تعديل — ${tribe.name_ar}`}
            size="lg"
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>إلغاء</Button>
                    <Button onClick={submit} disabled={processing}>
                        {processing ? 'جاري الحفظ...' : 'حفظ'}
                    </Button>
                </>
            }
        >
            <TribeFormFields data={data} setData={setData} errors={errors} packages={packages} />
        </Modal>
    );
}

/* ═══════════════════════════════════════════════
   Shared Form Fields
   ═══════════════════════════════════════════════ */
function TribeFormFields({
    data,
    setData,
    errors,
    packages,
    isNew,
}: {
    data: Record<string, unknown>;
    setData: (key: string, val: unknown) => void;
    errors: Record<string, string>;
    packages: PackageOption[];
    isNew?: boolean;
}) {
    return (
        <div className="space-y-4">
            <Field label="الاسم بالعربية" error={errors.name_ar} required>
                <input
                    type="text"
                    value={data.name_ar as string}
                    onChange={(e) => setData('name_ar', e.target.value)}
                    className="form-input"
                />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="معرّف الرابط" error={errors.slug}>
                    <input
                        type="text"
                        value={data.slug as string}
                        onChange={(e) => setData('slug', e.target.value)}
                        dir="ltr"
                        placeholder="qasimi"
                        className="form-input text-right font-mono"
                    />
                    <p className="text-brown-light text-[11px] mt-1" dir="ltr">
                        /tribes/<span className="font-bold">{(data.slug as string) || 'slug'}</span>/tree
                    </p>
                </Field>

                <Field label="الباقة" error={errors.package_id}>
                    <select
                        value={(data.package_id as number | string) ?? ''}
                        onChange={(e) => setData('package_id', e.target.value ? Number(e.target.value) : null)}
                        className="form-input"
                    >
                        <option value="">— بدون باقة —</option>
                        {packages.map((p) => (
                            <option key={p.id} value={p.id}>{p.name_ar}</option>
                        ))}
                    </select>
                </Field>
            </div>

            <Field label="وصف القبيلة (اختياري)" error={errors.description_ar}>
                <textarea
                    value={data.description_ar as string}
                    onChange={(e) => setData('description_ar', e.target.value)}
                    rows={3}
                    className="form-input resize-none"
                />
            </Field>

            {!isNew && (
                <label className="inline-flex items-center gap-2 cursor-pointer text-brown-dark text-sm">
                    <input
                        type="checkbox"
                        checked={data.is_active as boolean}
                        onChange={(e) => setData('is_active', e.target.checked)}
                        className="accent-gold-light w-4 h-4"
                    />
                    <span>القبيلة مفعّلة</span>
                </label>
            )}

            <style>{`
                .form-input {
                    width: 100%;
                    padding: 0.625rem 1rem;
                    background: white;
                    color: #3D2B1F;
                    border: 2px solid rgba(139, 105, 20, 0.2);
                    border-radius: 0.75rem;
                    transition: all 150ms;
                }
                .form-input:focus {
                    outline: none;
                    border-color: #8B6914;
                    box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.15);
                }
            `}</style>
        </div>
    );
}

function Field({
    label,
    error,
    required,
    children,
}: {
    label: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <label className="block">
            <span className="block text-brown-dark text-sm font-medium mb-1.5">
                {label}
                {required && <span className="text-rose-500 mr-1">*</span>}
            </span>
            {children}
            {error && <span className="block text-rose-500 text-xs mt-1">{error}</span>}
        </label>
    );
}
