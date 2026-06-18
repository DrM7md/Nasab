import { Button } from '@/Components/UI/Button';
import EmptyState from '@/Components/UI/EmptyState';
import {
    CheckIcon,
    EditIcon,
    PackageIcon,
    PlusIcon,
    StarIcon,
    TrashIcon,
    TribeIcon,
    XIcon,
} from '@/Components/UI/Icons';
import Modal from '@/Components/UI/Modal';
import PageHeader from '@/Components/UI/PageHeader';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import type { PageProps, Package } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

type Cycle = 'monthly' | 'yearly';

const CURRENCIES = ['SAR', 'QAR', 'AED', 'KWD', 'BHD', 'OMR', 'USD'] as const;

type PackagesIndexProps = PageProps<{
    packages: Package[];
    capabilityCatalog: Record<string, string>;
}>;

export default function PackagesIndex({ packages, capabilityCatalog }: PackagesIndexProps) {
    const [cycle, setCycle] = useState<Cycle>('monthly');
    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState<Package | null>(null);
    const [deleting, setDeleting] = useState<Package | null>(null);

    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    icon={<PackageIcon />}
                    title="الباقات والتسعير"
                    subtitle="عرّف باقات الاشتراك ومزاياها وأسعارها"
                    actions={
                        <Button onClick={() => setCreating(true)} icon={<PlusIcon className="w-4 h-4" />}>
                            باقة جديدة
                        </Button>
                    }
                />
            }
        >
            <Head title="الباقات والتسعير" />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
                {packages.length === 0 ? (
                    <div className="bg-white dark:bg-night-card rounded-2xl border border-gold/15">
                        <EmptyState
                            icon={<PackageIcon />}
                            title="لا توجد باقات بعد"
                            description="أنشئ أول باقة اشتراك لتظهر للقبائل."
                            action={
                                <Button onClick={() => setCreating(true)} icon={<PlusIcon className="w-4 h-4" />}>
                                    باقة جديدة
                                </Button>
                            }
                        />
                    </div>
                ) : (
                    <>
                        {/* مبدّل دورة الفوترة */}
                        <div className="flex justify-center">
                            <div className="inline-flex p-1 bg-white dark:bg-night-card rounded-2xl border border-gold/20 shadow-sm">
                                <CycleTab active={cycle === 'monthly'} onClick={() => setCycle('monthly')}>
                                    شهري
                                </CycleTab>
                                <CycleTab active={cycle === 'yearly'} onClick={() => setCycle('yearly')}>
                                    سنوي <span className="text-[10px] font-bold text-emerald-600">(وفّر أكثر)</span>
                                </CycleTab>
                            </div>
                        </div>

                        {/* بطاقات الأسعار */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                            {packages.map((pkg) => (
                                <PricingCard
                                    key={pkg.id}
                                    pkg={pkg}
                                    cycle={cycle}
                                    onEdit={() => setEditing(pkg)}
                                    onDelete={() => setDeleting(pkg)}
                                    onToggleActive={() =>
                                        router.patch(route('admin.packages.update', pkg.id), { is_active: !pkg.is_active }, { preserveScroll: true })
                                    }
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {creating && <PackageFormModal catalog={capabilityCatalog} onClose={() => setCreating(false)} />}
            {editing && <PackageFormModal pkg={editing} catalog={capabilityCatalog} onClose={() => setEditing(null)} />}
            {deleting && <DeletePackageModal pkg={deleting} onClose={() => setDeleting(null)} />}
        </AuthenticatedLayout>
    );
}

/* ═══════════════════════════════════════════════ */
function PricingCard({
    pkg,
    cycle,
    onEdit,
    onDelete,
    onToggleActive,
}: {
    readonly pkg: Package;
    readonly cycle: Cycle;
    readonly onEdit: () => void;
    readonly onDelete: () => void;
    readonly onToggleActive: () => void;
}) {
    const price = cycle === 'monthly' ? pkg.price_monthly : pkg.price_yearly;
    const isFree = price === 0;
    const cycleLabel = cycle === 'monthly' ? '/ شهريًا' : '/ سنويًا';
    const monthlyEquiv = cycle === 'yearly' && pkg.price_yearly > 0 ? pkg.price_yearly / 12 : null;

    return (
        <div
            className={`ns-card relative flex flex-col bg-white dark:bg-night-card rounded-3xl border shadow-sm overflow-hidden ${
                pkg.is_featured ? 'border-gold ring-2 ring-gold/30' : 'border-gold/15'
            } ${pkg.is_active ? '' : 'opacity-60'}`}
        >
            {pkg.is_featured && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-l from-gold to-gold-light text-white text-xs font-bold py-1.5 text-center flex items-center justify-center gap-1.5">
                    <StarIcon className="w-3.5 h-3.5" /> الأكثر شيوعًا
                </div>
            )}

            <div className={`p-6 ${pkg.is_featured ? 'pt-10' : ''} flex flex-col h-full`}>
                {/* رأس */}
                <div className="flex items-center gap-2.5 mb-1">
                    <span className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: pkg.color }}>
                        <PackageIcon className="w-5 h-5" />
                    </span>
                    <h3 className="font-amiri text-xl font-bold text-brown-dark">{pkg.name_ar}</h3>
                    {!pkg.is_active && (
                        <span className="text-[10px] px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full font-bold">معطّلة</span>
                    )}
                </div>

                {pkg.description_ar && (
                    <p className="text-brown-light text-xs leading-relaxed mb-4 min-h-[32px]">{pkg.description_ar}</p>
                )}

                {/* السعر */}
                <div className="mb-5">
                    {isFree ? (
                        <div className="font-amiri text-3xl font-bold text-gold">مجانًا</div>
                    ) : (
                        <div className="flex items-end gap-1.5">
                            <span className="text-3xl font-bold text-brown-dark">{price.toLocaleString('en-US')}</span>
                            <span className="text-brown-mid text-sm font-medium mb-1">{pkg.currency}</span>
                            <span className="text-brown-light text-xs mb-1.5">{cycleLabel}</span>
                        </div>
                    )}
                    {monthlyEquiv !== null && !isFree && (
                        <div className="text-brown-light text-[11px] mt-0.5">
                            ≈ {Math.round(monthlyEquiv).toLocaleString('en-US')} {pkg.currency} شهريًا
                        </div>
                    )}
                </div>

                {/* الحدود */}
                <div className="grid grid-cols-2 gap-2 mb-4 text-center">
                    <LimitBox label="الأشخاص" value={pkg.max_persons} />
                    <LimitBox label="الأعضاء" value={pkg.max_members} />
                </div>

                {/* المزايا */}
                <ul className="space-y-2 mb-6 flex-1">
                    {pkg.features.map((f, i) => (
                        <li key={`${f}-${i}`} className="flex items-start gap-2 text-sm text-brown-mid">
                            <span className="text-emerald-500 mt-0.5 shrink-0"><CheckIcon className="w-4 h-4" /></span>
                            <span>{f}</span>
                        </li>
                    ))}
                </ul>

                {/* تذييل: القبائل + إجراءات */}
                <div className="mt-auto pt-4 border-t border-gold/10 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-brown-light text-xs">
                        <TribeIcon className="w-4 h-4" /> {pkg.tribes_count ?? 0} قبيلة
                    </span>
                    <div className="flex items-center gap-1">
                        <button type="button" onClick={onToggleActive} title={pkg.is_active ? 'تعطيل' : 'تفعيل'} className="p-2 rounded-lg text-brown-mid hover:bg-beige transition-colors">
                            {pkg.is_active ? <CheckIcon className="w-4 h-4 text-emerald-600" /> : <XIcon className="w-4 h-4 text-rose-500" />}
                        </button>
                        <button type="button" onClick={onEdit} title="تعديل" className="p-2 rounded-lg text-brown-mid hover:bg-beige transition-colors">
                            <EditIcon className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={onDelete} title="حذف" className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors">
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function LimitBox({ label, value }: { readonly label: string; readonly value: number | null }) {
    return (
        <div className="bg-beige/50 dark:bg-night-bg rounded-xl py-2">
            <div className="text-brown-dark font-bold text-sm">
                {value === null ? 'غير محدود' : value.toLocaleString('en-US')}
            </div>
            <div className="text-brown-light text-[10px]">{label}</div>
        </div>
    );
}

function CycleTab({ active, onClick, children }: { readonly active: boolean; readonly onClick: () => void; readonly children: React.ReactNode }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-xl font-medium text-sm transition-all ${
                active ? 'bg-gold text-white shadow-md' : 'text-brown-mid hover:bg-beige'
            }`}
        >
            {children}
        </button>
    );
}

/* ═══════════════════════════════════════════════
   نموذج إنشاء/تعديل الباقة
   ═══════════════════════════════════════════════ */
function PackageFormModal({ pkg, catalog, onClose }: { readonly pkg?: Package; readonly catalog: Record<string, string>; readonly onClose: () => void }) {
    const isEdit = !!pkg;

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        name_ar: pkg?.name_ar ?? '',
        description_ar: pkg?.description_ar ?? '',
        price_monthly: pkg?.price_monthly ?? 0,
        price_yearly: pkg?.price_yearly ?? 0,
        currency: pkg?.currency ?? 'SAR',
        features: pkg?.features ?? [],
        capabilities: pkg?.capabilities ?? [],
        max_persons: pkg?.max_persons ?? (null as number | null),
        max_members: pkg?.max_members ?? (null as number | null),
        color: pkg?.color ?? '#8B6914',
        is_featured: pkg?.is_featured ?? false,
        is_active: pkg?.is_active ?? true,
    });

    const toggleCap = (key: string) => {
        setData('capabilities', data.capabilities.includes(key)
            ? data.capabilities.filter((c) => c !== key)
            : [...data.capabilities, key]);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const opts = { preserveScroll: true, onSuccess: () => { reset(); onClose(); } };
        if (isEdit && pkg) patch(route('admin.packages.update', pkg.id), opts);
        else post(route('admin.packages.store'), opts);
    };

    const setFeature = (i: number, val: string) => {
        const next = [...data.features];
        next[i] = val;
        setData('features', next);
    };
    const addFeature = () => setData('features', [...data.features, '']);
    const removeFeature = (i: number) => setData('features', data.features.filter((_, idx) => idx !== i));

    return (
        <Modal
            isOpen
            onClose={onClose}
            title={isEdit ? `تعديل — ${pkg!.name_ar}` : 'باقة جديدة'}
            size="lg"
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>إلغاء</Button>
                    <Button onClick={submit} disabled={processing}>
                        {processing ? 'جارٍ الحفظ...' : isEdit ? 'حفظ' : 'إنشاء'}
                    </Button>
                </>
            }
        >
            <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <PField label="اسم الباقة" error={errors.name_ar} className="sm:col-span-2">
                        <input type="text" value={data.name_ar} onChange={(e) => setData('name_ar', e.target.value)} className="pkg-input" placeholder="احترافي" />
                    </PField>
                    <PField label="اللون">
                        <div className="flex items-center gap-2">
                            <input type="color" value={data.color} onChange={(e) => setData('color', e.target.value)} className="w-11 h-11 rounded-lg border border-gold/20 cursor-pointer shrink-0" />
                            <input type="text" value={data.color} onChange={(e) => setData('color', e.target.value)} dir="ltr" className="pkg-input text-right font-mono text-xs" />
                        </div>
                    </PField>
                </div>

                <PField label="وصف مختصر" error={errors.description_ar}>
                    <input type="text" value={data.description_ar} onChange={(e) => setData('description_ar', e.target.value)} className="pkg-input" placeholder="لمن هذه الباقة؟" />
                </PField>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <PField label="السعر الشهري" error={errors.price_monthly}>
                        <input type="number" min={0} step="0.01" value={data.price_monthly} onChange={(e) => setData('price_monthly', Number(e.target.value))} dir="ltr" className="pkg-input text-right" />
                    </PField>
                    <PField label="السعر السنوي" error={errors.price_yearly}>
                        <input type="number" min={0} step="0.01" value={data.price_yearly} onChange={(e) => setData('price_yearly', Number(e.target.value))} dir="ltr" className="pkg-input text-right" />
                    </PField>
                    <PField label="العملة">
                        <select value={data.currency} onChange={(e) => setData('currency', e.target.value)} className="pkg-input">
                            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </PField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <PField label="حدّ الأشخاص (فارغ = غير محدود)" error={errors.max_persons}>
                        <input type="number" min={0} value={data.max_persons ?? ''} onChange={(e) => setData('max_persons', e.target.value ? Number(e.target.value) : null)} dir="ltr" className="pkg-input text-right" placeholder="غير محدود" />
                    </PField>
                    <PField label="حدّ الأعضاء (فارغ = غير محدود)" error={errors.max_members}>
                        <input type="number" min={0} value={data.max_members ?? ''} onChange={(e) => setData('max_members', e.target.value ? Number(e.target.value) : null)} dir="ltr" className="pkg-input text-right" placeholder="غير محدود" />
                    </PField>
                </div>

                {/* المزايا */}
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-brown-dark text-xs font-bold">المزايا</span>
                        <button type="button" onClick={addFeature} className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold-soft text-brown-dark rounded-lg text-xs font-bold hover:bg-gold hover:text-white transition-colors">
                            <PlusIcon className="w-3.5 h-3.5" /> ميزة
                        </button>
                    </div>
                    {data.features.length === 0 && (
                        <p className="text-brown-light text-xs text-center py-3 border border-dashed border-gold/30 rounded-lg">لا مزايا — اضغط "ميزة"</p>
                    )}
                    <div className="space-y-2">
                        {data.features.map((f, i) => (
                            <div key={`feat-${i}`} className="flex items-center gap-2">
                                <CheckIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                                <input type="text" value={f} onChange={(e) => setFeature(i, e.target.value)} className="pkg-input" placeholder="مثال: حتى 5000 شخص" />
                                <button type="button" onClick={() => removeFeature(i)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg shrink-0" title="حذف">
                                    <XIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* القدرات المُفعّلة فعليًا */}
                <div>
                    <div className="text-brown-dark text-xs font-bold mb-2">القدرات المُفعّلة (تتحكّم بما يُتاح فعليًا)</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {Object.entries(catalog).map(([key, label]) => (
                            <label key={key} className="inline-flex items-center gap-2 cursor-pointer text-sm p-2 rounded-lg border border-gold/15 hover:bg-beige/50 transition-colors">
                                <input type="checkbox" checked={data.capabilities.includes(key)} onChange={() => toggleCap(key)} className="w-4 h-4 accent-gold" />
                                <span className="text-brown-dark">{label}</span>
                            </label>
                        ))}
                    </div>
                    <p className="text-brown-light text-[11px] mt-1.5">«تصدير البيانات» مفروضة برمجيًا. البقية إعلامية/تشغيلية حتى تُبنى.</p>
                </div>

                {/* مفاتيح */}
                <div className="flex flex-wrap gap-5 pt-2 border-t border-gold/10">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-brown-dark text-sm">
                        <input type="checkbox" checked={data.is_featured} onChange={(e) => setData('is_featured', e.target.checked)} className="w-4 h-4 accent-gold" />
                        <span>باقة مميّزة (الأكثر شيوعًا)</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer text-brown-dark text-sm">
                        <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} className="w-4 h-4 accent-gold" />
                        <span>الباقة مفعّلة</span>
                    </label>
                </div>
            </form>

            <style>{`
                .pkg-input {
                    width: 100%;
                    padding: 0.55rem 0.85rem;
                    background: #fff;
                    border: 1px solid rgba(139, 105, 20, 0.2);
                    border-radius: 0.75rem;
                    color: #3D2B1F;
                    font-size: 0.875rem;
                    transition: border-color 0.2s;
                }
                .pkg-input:focus { outline: none; border-color: #8B6914; box-shadow: 0 0 0 3px rgba(139,105,20,0.1); }
                .dark .pkg-input { background: #2C1F10; color: #F5EFE6; border-color: rgba(201,168,76,0.25); }
            `}</style>
        </Modal>
    );
}

function PField({ label, error, className, children }: { readonly label: string; readonly error?: string; readonly className?: string; readonly children: React.ReactNode }) {
    return (
        <div className={className}>
            <label className="block text-brown-dark text-xs font-bold mb-1.5">{label}</label>
            {children}
            {error && <p className="text-rose-600 text-xs mt-1">{error}</p>}
        </div>
    );
}

function DeletePackageModal({ pkg, onClose }: { readonly pkg: Package; readonly onClose: () => void }) {
    const [processing, setProcessing] = useState(false);
    const handleDelete = () => {
        setProcessing(true);
        router.delete(route('admin.packages.destroy', pkg.id), {
            preserveScroll: true,
            onSuccess: () => onClose(),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <Modal
            isOpen
            onClose={onClose}
            title="حذف باقة"
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
                ستُحذف باقة <strong>"{pkg.name_ar}"</strong> نهائيًا.
                {(pkg.tribes_count ?? 0) > 0 && (
                    <> القبائل المرتبطة بها ({pkg.tribes_count}) ستبقى بلا باقة.</>
                )}
            </p>
        </Modal>
    );
}
