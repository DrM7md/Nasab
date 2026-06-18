import { Button } from '@/Components/UI/Button';
import { AlertTriangleIcon, CheckIcon, PackageIcon, PhotoIcon, TribeIcon, UsersIcon, XIcon } from '@/Components/UI/Icons';
import SearchableSelect from '@/Components/UI/SearchableSelect';
import { CURRENCY_LABEL } from '@/lib/currency';
import GuestLayout from '@/Layouts/GuestLayout';
import type { Package } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';
import { AuthField, authStyles } from './Login';

interface TribeOption {
    id: number;
    name_ar: string;
    slug: string;
}

type Intent = 'member' | 'found_tribe' | 'claim_admin';

export default function Register({ tribes, packages }: { readonly tribes: TribeOption[]; readonly packages: Package[] }) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm<{
        name: string;
        email: string;
        phone: string;
        national_id: string;
        nationality: string;
        join_intent: Intent;
        requested_tribe_id: string;
        new_tribe_name_ar: string;
        new_tribe_description: string;
        requested_package_id: number | null;
        claim_reason: string;
        password: string;
        password_confirmation: string;
        id_card_photo: File | null;
    }>({
        name: '', email: '', phone: '', national_id: '', nationality: '',
        join_intent: 'member',
        requested_tribe_id: '', new_tribe_name_ar: '', new_tribe_description: '',
        requested_package_id: null, claim_reason: '',
        password: '', password_confirmation: '', id_card_photo: null,
    });

    const isMember = data.join_intent === 'member';
    const isFound = data.join_intent === 'found_tribe';
    const isClaim = data.join_intent === 'claim_admin';
    const isAdmin = isFound || isClaim;

    const handleFile = (file: File | null) => {
        setData('id_card_photo', file);
        setPreview(file ? URL.createObjectURL(file) : null);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), { forceFormData: true, onFinish: () => reset('password', 'password_confirmation') });
    };

    return (
        <GuestLayout>
            <Head title="إنشاء حساب" />

            <h1 className="font-amiri text-[26px] font-bold text-brown-dark mb-1 text-center">انضمّ إلى الشجرة</h1>
            <p className="text-brown-light text-sm text-center mb-6 leading-relaxed">
                سجّل بياناتك واختر مسارك، وسيراجع المشرفون طلبك
            </p>

            <form onSubmit={submit} className="space-y-4" encType="multipart/form-data">
                {/* المعلومات الأساسية */}
                <SectionLabel>المعلومات الأساسية</SectionLabel>
                <AuthField label="الاسم الكامل" error={errors.name}>
                    <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} autoComplete="name" autoFocus required className="auth-input" />
                </AuthField>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <AuthField label="البريد الإلكتروني" error={errors.email}>
                        <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} autoComplete="username" required dir="ltr" className="auth-input text-right" />
                    </AuthField>
                    <AuthField label="رقم الهاتف" error={errors.phone}>
                        <input type="tel" value={data.phone} onChange={(e) => setData('phone', e.target.value)} autoComplete="tel" required dir="ltr" className="auth-input text-right" />
                    </AuthField>
                </div>

                {/* بيانات الهوية */}
                <SectionLabel>بيانات الهوية</SectionLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <AuthField label="الرقم الشخصي" error={errors.national_id}>
                        <input type="text" value={data.national_id} onChange={(e) => setData('national_id', e.target.value)} required dir="ltr" className="auth-input text-right font-mono" />
                    </AuthField>
                    <AuthField label="الجنسية" error={errors.nationality}>
                        <input type="text" value={data.nationality} onChange={(e) => setData('nationality', e.target.value)} required className="auth-input" />
                    </AuthField>
                </div>
                <AuthField label="صورة البطاقة الشخصية" error={errors.id_card_photo}>
                    <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} className="hidden" />
                    {preview ? (
                        <div className="relative rounded-xl overflow-hidden border border-gold/25">
                            <img src={preview} alt="البطاقة" className="w-full h-40 object-cover" />
                            <button type="button" onClick={() => handleFile(null)} className="absolute top-2 left-2 w-8 h-8 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg" aria-label="إزالة">
                                <XIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <button type="button" onClick={() => fileRef.current?.click()} className="w-full flex flex-col items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed border-gold/30 text-brown-mid hover:border-gold hover:bg-beige/60 transition-colors">
                            <PhotoIcon className="w-7 h-7 text-gold" />
                            <span className="text-sm">اضغط لرفع صورة البطاقة</span>
                        </button>
                    )}
                </AuthField>

                {/* المسار */}
                <SectionLabel>نوع الحساب</SectionLabel>
                <div className="grid grid-cols-2 gap-3">
                    <IntentCard
                        active={isMember}
                        onClick={() => setData('join_intent', 'member')}
                        icon={<UsersIcon className="w-6 h-6" />}
                        title="عضو في قبيلة"
                        desc="تصفّح وتساهم — مجانًا"
                    />
                    <IntentCard
                        active={isAdmin}
                        onClick={() => setData('join_intent', 'found_tribe')}
                        icon={<TribeIcon className="w-6 h-6" />}
                        title="مدير قبيلة"
                        desc="تبني وتدير الشجرة"
                    />
                </div>

                {/* مسار العضو */}
                {isMember && (
                    <AuthField label="اختر قبيلتك" error={errors.requested_tribe_id}>
                        <SearchableSelect
                            options={tribes.map((t) => ({ value: t.id, label: t.name_ar }))}
                            value={data.requested_tribe_id ? Number(data.requested_tribe_id) : null}
                            onChange={(v) => setData('requested_tribe_id', v ? String(v) : '')}
                            placeholder="— اختر من القائمة —"
                            searchPlaceholder="ابحث عن قبيلة..."
                            emptyMessage="لا توجد قبيلة مطابقة"
                        />
                    </AuthField>
                )}

                {/* مسار المدير */}
                {isAdmin && (
                    <>
                        <div className="grid grid-cols-2 gap-2">
                            <ModeTab active={isFound} onClick={() => setData('join_intent', 'found_tribe')}>قبيلة جديدة</ModeTab>
                            <ModeTab active={isClaim} onClick={() => setData('join_intent', 'claim_admin')}>قبيلتي موجودة</ModeTab>
                        </div>

                        {isFound ? (
                            <>
                                <AuthField label="اسم القبيلة الجديدة" error={errors.new_tribe_name_ar}>
                                    <input type="text" value={data.new_tribe_name_ar} onChange={(e) => setData('new_tribe_name_ar', e.target.value)} className="auth-input" placeholder="آل..." />
                                </AuthField>
                                <AuthField label="نبذة عن القبيلة (اختياري)" error={errors.new_tribe_description}>
                                    <textarea value={data.new_tribe_description} onChange={(e) => setData('new_tribe_description', e.target.value)} rows={2} className="auth-input resize-none" />
                                </AuthField>
                            </>
                        ) : (
                            <>
                                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 leading-relaxed">
                                    <AlertTriangleIcon className="w-5 h-5 shrink-0 mt-0.5" />
                                    <span>تطلب إدارة قبيلة قائمة لأن مديرها غير فعّال. سيتحقّق المدير العام من آخر نشاط للمدير الحالي قبل نقل الإدارة إليك.</span>
                                </div>
                                <AuthField label="القبيلة" error={errors.requested_tribe_id}>
                                    <SearchableSelect
                                        options={tribes.map((t) => ({ value: t.id, label: t.name_ar }))}
                                        value={data.requested_tribe_id ? Number(data.requested_tribe_id) : null}
                                        onChange={(v) => setData('requested_tribe_id', v ? String(v) : '')}
                                        placeholder="— اختر قبيلتك —"
                                        searchPlaceholder="ابحث..."
                                        emptyMessage="لا توجد قبيلة مطابقة"
                                    />
                                </AuthField>
                                <AuthField label="سبب طلب الإدارة" error={errors.claim_reason}>
                                    <textarea value={data.claim_reason} onChange={(e) => setData('claim_reason', e.target.value)} rows={2} className="auth-input resize-none" placeholder="مثال: المدير الحالي منقطع منذ مدة ولا يستجيب..." />
                                </AuthField>
                            </>
                        )}

                        {/* اختيار الباقة */}
                        <div>
                            <span className="block text-brown-mid text-sm font-medium mb-2">اختر باقتك</span>
                            <div className="space-y-2">
                                {packages.map((p) => (
                                    <PackageOption
                                        key={p.id}
                                        pkg={p}
                                        active={data.requested_package_id === p.id}
                                        onClick={() => setData('requested_package_id', p.id)}
                                    />
                                ))}
                            </div>
                            {errors.requested_package_id && <p className="text-rose-600 text-xs mt-1">{errors.requested_package_id}</p>}
                        </div>
                    </>
                )}

                {/* كلمة المرور */}
                <SectionLabel>كلمة المرور</SectionLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <AuthField label="كلمة المرور" error={errors.password}>
                        <input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} autoComplete="new-password" required className="auth-input" />
                    </AuthField>
                    <AuthField label="تأكيد كلمة المرور" error={errors.password_confirmation}>
                        <input type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} autoComplete="new-password" required className="auth-input" />
                    </AuthField>
                </div>

                <Button type="submit" disabled={processing} className="w-full mt-2">
                    {processing ? 'جاري الإرسال...' : isMember ? 'إنشاء الحساب وطلب الانضمام' : 'إنشاء الحساب وتقديم الطلب'}
                </Button>
            </form>

            <div className="mt-6 text-center text-brown-mid text-sm">
                لديك حساب بالفعل؟{' '}
                <Link href={route('login')} className="text-gold hover:text-gold-light font-medium underline underline-offset-2">تسجيل الدخول</Link>
            </div>

            <style>{authStyles}</style>
        </GuestLayout>
    );
}

function IntentCard({ active, onClick, icon, title, desc }: { readonly active: boolean; readonly onClick: () => void; readonly icon: React.ReactNode; readonly title: string; readonly desc: string }) {
    return (
        <button type="button" onClick={onClick} className={`text-right p-3 rounded-xl border-2 transition-all ${active ? 'border-gold bg-gold-soft/40' : 'border-gold/15 bg-white dark:bg-night-bg hover:border-gold/40'}`}>
            <span className={`inline-flex mb-1.5 ${active ? 'text-gold' : 'text-brown-light'}`}>{icon}</span>
            <div className="font-bold text-brown-dark text-sm">{title}</div>
            <div className="text-brown-light text-xs">{desc}</div>
        </button>
    );
}

function ModeTab({ active, onClick, children }: { readonly active: boolean; readonly onClick: () => void; readonly children: React.ReactNode }) {
    return (
        <button type="button" onClick={onClick} className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${active ? 'bg-gold text-white border-gold' : 'bg-white dark:bg-night-bg text-brown-mid border-gold/20 hover:bg-beige'}`}>
            {children}
        </button>
    );
}

function PackageOption({ pkg, active, onClick }: { readonly pkg: Package; readonly active: boolean; readonly onClick: () => void }) {
    const isFree = pkg.price_monthly === 0;
    return (
        <button type="button" onClick={onClick} className={`w-full flex items-center justify-between gap-3 p-3 rounded-xl border-2 text-right transition-all ${active ? 'border-gold bg-gold-soft/40' : 'border-gold/15 bg-white dark:bg-night-bg hover:border-gold/40'}`}>
            <span className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0" style={{ backgroundColor: pkg.color }}>
                    <PackageIcon className="w-4 h-4" />
                </span>
                <span>
                    <span className="block font-bold text-brown-dark text-sm">{pkg.name_ar}</span>
                    <span className="block text-brown-light text-xs">
                        {isFree ? 'مجانًا' : `${pkg.price_monthly.toLocaleString('en-US')} ${CURRENCY_LABEL[pkg.currency] ?? pkg.currency} / شهريًا`}
                    </span>
                </span>
            </span>
            <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${active ? 'border-gold bg-gold text-white' : 'border-gold/30'}`}>
                {active && <CheckIcon className="w-3 h-3" />}
            </span>
        </button>
    );
}

function SectionLabel({ children }: { readonly children: React.ReactNode }) {
    return (
        <div className="pt-2 pb-1 border-b border-gold/20">
            <span className="text-gold text-xs font-bold tracking-wider">{children}</span>
        </div>
    );
}
