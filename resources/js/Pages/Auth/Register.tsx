import { Button } from '@/Components/UI/Button';
import { ArrowLeftIcon, LightbulbIcon, PhotoIcon, PlusIcon, XIcon } from '@/Components/UI/Icons';
import SearchableSelect from '@/Components/UI/SearchableSelect';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';
import { AuthField, authStyles } from './Login';

interface TribeOption {
    id: number;
    name_ar: string;
    slug: string;
}

export default function Register({ tribes }: { readonly tribes: TribeOption[] }) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isNewTribe, setIsNewTribe] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<{
        name: string;
        email: string;
        phone: string;
        national_id: string;
        nationality: string;
        requested_tribe_id: string;
        new_tribe_name_ar: string;
        new_tribe_description: string;
        password: string;
        password_confirmation: string;
        id_card_photo: File | null;
    }>({
        name: '',
        email: '',
        phone: '',
        national_id: '',
        nationality: '',
        requested_tribe_id: '',
        new_tribe_name_ar: '',
        new_tribe_description: '',
        password: '',
        password_confirmation: '',
        id_card_photo: null,
    });

    const switchToNewTribe = () => {
        setIsNewTribe(true);
        setData('requested_tribe_id', '');
    };

    const switchToExistingTribe = () => {
        setIsNewTribe(false);
        setData('new_tribe_name_ar', '');
        setData('new_tribe_description', '');
    };

    const handleFile = (file: File | null) => {
        setData('id_card_photo', file);
        setPreview(file ? URL.createObjectURL(file) : null);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            forceFormData: true,
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="إنشاء حساب" />

            <h1 className="font-amiri text-[26px] font-bold text-brown-dark mb-1 text-center">
                انضمّ إلى الشجرة
            </h1>
            <p className="text-brown-light text-sm text-center mb-6 leading-relaxed">
                بعد التسجيل، سيُرسل طلب انضمامك لمدير القبيلة للاعتماد
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

                {/* صورة البطاقة */}
                <AuthField label="صورة البطاقة الشخصية" error={errors.id_card_photo}>
                    <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} className="hidden" />

                    {preview ? (
                        <div className="relative rounded-xl overflow-hidden border border-gold/25">
                            <img src={preview} alt="البطاقة الشخصية" className="w-full h-40 object-cover" />
                            <button
                                type="button"
                                onClick={() => handleFile(null)}
                                className="absolute top-2 left-2 w-8 h-8 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg"
                                aria-label="إزالة الصورة"
                            >
                                <XIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            className="w-full flex flex-col items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed border-gold/30 text-brown-mid hover:border-gold hover:bg-beige/60 transition-colors"
                        >
                            <PhotoIcon className="w-7 h-7 text-gold" />
                            <span className="text-sm">اضغط لرفع صورة البطاقة</span>
                            <span className="text-xs text-brown-light">JPG / PNG / WEBP — حتى 5 ميجا</span>
                        </button>
                    )}
                </AuthField>

                {/* القبيلة */}
                <SectionLabel>القبيلة</SectionLabel>

                {isNewTribe ? (
                    <>
                        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gold-soft/40 border border-gold/25 text-xs text-brown-dark leading-relaxed">
                            <LightbulbIcon className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                            <span>سيراجع المدير العام طلب إنشاء قبيلتك أولاً ثم يُعتمد انضمامك. ستحصل على إشعار عند الاعتماد.</span>
                        </div>

                        <AuthField label="اسم القبيلة المقترحة" error={errors.new_tribe_name_ar}>
                            <input type="text" value={data.new_tribe_name_ar} onChange={(e) => setData('new_tribe_name_ar', e.target.value)} required className="auth-input" />
                        </AuthField>

                        <AuthField label="نبذة عن القبيلة (اختياري)" error={errors.new_tribe_description}>
                            <textarea value={data.new_tribe_description} onChange={(e) => setData('new_tribe_description', e.target.value)} rows={3} className="auth-input resize-none" />
                        </AuthField>

                        <button
                            type="button"
                            onClick={switchToExistingTribe}
                            className="w-full inline-flex items-center justify-center gap-1.5 text-gold hover:text-gold-light text-sm py-2 hover:bg-beige/60 rounded-xl transition-colors"
                        >
                            <ArrowLeftIcon className="w-4 h-4" /> العودة لاختيار قبيلة من القائمة
                        </button>
                    </>
                ) : (
                    <>
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

                        <button
                            type="button"
                            onClick={switchToNewTribe}
                            className="w-full inline-flex items-center justify-center gap-1.5 text-gold hover:text-gold-light text-sm py-2 border border-dashed border-gold/30 rounded-xl hover:bg-beige/60 transition-colors"
                        >
                            <PlusIcon className="w-4 h-4" /> قبيلتي ليست في القائمة — اقترح قبيلة جديدة
                        </button>
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
                    {processing ? 'جاري الإرسال...' : 'إنشاء الحساب وتقديم طلب الانضمام'}
                </Button>
            </form>

            <div className="mt-6 text-center text-brown-mid text-sm">
                لديك حساب بالفعل؟{' '}
                <Link href={route('login')} className="text-gold hover:text-gold-light font-medium underline underline-offset-2">
                    تسجيل الدخول
                </Link>
            </div>

            <style>{authStyles}</style>
        </GuestLayout>
    );
}

function SectionLabel({ children }: { readonly children: React.ReactNode }) {
    return (
        <div className="pt-2 pb-1 border-b border-gold/20">
            <span className="text-gold text-xs font-bold tracking-wider">{children}</span>
        </div>
    );
}
