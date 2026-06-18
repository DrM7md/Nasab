import Modal from '@/Components/UI/Modal';
import SearchableSelect from '@/Components/UI/SearchableSelect';
import type { UserRole } from '@/types';
import { useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

const ROLE_LABELS: Record<UserRole, string> = {
    super_admin: 'مدير عام',
    tribe_admin: 'مدير قبيلة',
    moderator: 'مراجع',
    member: 'عضو',
    viewer: 'زائر',
};

export interface UserFormData {
    id?: number;
    name: string;
    email: string;
    phone: string;
    national_id: string;
    nationality: string;
    role: UserRole;
    tribe_id: number | null;
    is_active: boolean;
    id_card_photo_url?: string | null;
}

interface TribeOption {
    id: number;
    name_ar: string;
    slug: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    user?: UserFormData; // لو موجود → edit، إن لا → create
    tribes: TribeOption[];
    canAssignSuperAdmin: boolean;
    currentUserId: number;
}

export default function UserFormModal({
    isOpen,
    onClose,
    user,
    tribes,
    canAssignSuperAdmin,
    currentUserId,
}: Props) {
    const isEdit = !!user?.id;
    const isSelf = user?.id === currentUserId;
    const fileRef = useRef<HTMLInputElement>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const form = useForm<{
        _method?: string;
        name: string;
        email: string;
        phone: string;
        national_id: string;
        nationality: string;
        role: UserRole;
        tribe_id: number | null;
        is_active: boolean;
        password: string;
        password_confirmation: string;
        id_card_photo: File | null;
    }>({
        name: user?.name ?? '',
        email: user?.email ?? '',
        phone: user?.phone ?? '',
        national_id: user?.national_id ?? '',
        nationality: user?.nationality ?? '',
        role: user?.role ?? 'member',
        tribe_id: user?.tribe_id ?? null,
        is_active: user?.is_active ?? true,
        password: '',
        password_confirmation: '',
        id_card_photo: null,
    });

    // Reset حين يُفتح الـ modal
    useEffect(() => {
        if (isOpen) {
            form.setData({
                name: user?.name ?? '',
                email: user?.email ?? '',
                phone: user?.phone ?? '',
                national_id: user?.national_id ?? '',
                nationality: user?.nationality ?? '',
                role: user?.role ?? 'member',
                tribe_id: user?.tribe_id ?? null,
                is_active: user?.is_active ?? true,
                password: '',
                password_confirmation: '',
                id_card_photo: null,
            });
            form.clearErrors();
            setPhotoPreview(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, user?.id]);

    const handleFile = (file: File | null) => {
        form.setData('id_card_photo', file);
        setPhotoPreview(file ? URL.createObjectURL(file) : null);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit && user) {
            form.post(route('admin.users.update', user.id), {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => onClose(),
            });
        } else {
            form.post(route('admin.users.store'), {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => onClose(),
            });
        }
    };

    const roleOptions: UserRole[] = canAssignSuperAdmin
        ? ['super_admin', 'tribe_admin', 'moderator', 'member', 'viewer']
        : ['tribe_admin', 'moderator', 'member', 'viewer'];

    const displayedPhoto = photoPreview ?? user?.id_card_photo_url ?? null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? `تعديل — ${user?.name}` : 'إضافة مستخدم جديد'}
            size="lg"
            footer={
                <>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 bg-white text-brown-mid border border-gold/20 rounded-xl font-medium hover:bg-beige transition-colors"
                    >
                        إلغاء
                    </button>
                    <button
                        type="button"
                        onClick={submit}
                        disabled={form.processing}
                        className="px-5 py-2.5 bg-gradient-to-r from-gold to-gold-light text-white rounded-xl font-bold shadow-md hover:shadow-lg disabled:opacity-50 transition-all"
                    >
                        {form.processing
                            ? 'جاري الحفظ...'
                            : (isEdit ? 'حفظ التغييرات' : 'إنشاء المستخدم')}
                    </button>
                </>
            }
        >
            <form onSubmit={submit} className="space-y-4" encType="multipart/form-data">
                <SectionLabel>المعلومات الأساسية</SectionLabel>

                <Field label="الاسم" required error={form.errors.name}>
                    <input
                        type="text"
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                        required
                        className="form-input"
                    />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="البريد الإلكتروني" required error={form.errors.email}>
                        <input
                            type="email"
                            value={form.data.email}
                            onChange={(e) => form.setData('email', e.target.value)}
                            required
                            dir="ltr"
                            className="form-input text-right"
                        />
                    </Field>

                    <Field label="رقم الهاتف" error={form.errors.phone}>
                        <input
                            type="tel"
                            value={form.data.phone}
                            onChange={(e) => form.setData('phone', e.target.value)}
                            dir="ltr"
                            className="form-input text-right"
                        />
                    </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="الرقم الشخصي" error={form.errors.national_id}>
                        <input
                            type="text"
                            value={form.data.national_id}
                            onChange={(e) => form.setData('national_id', e.target.value)}
                            dir="ltr"
                            className="form-input text-right font-mono"
                        />
                    </Field>

                    <Field label="الجنسية" error={form.errors.nationality}>
                        <input
                            type="text"
                            value={form.data.nationality}
                            onChange={(e) => form.setData('nationality', e.target.value)}
                            className="form-input"
                        />
                    </Field>
                </div>

                {/* صورة البطاقة */}
                <Field label="صورة البطاقة الشخصية" error={form.errors.id_card_photo}>
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                        className="hidden"
                    />

                    {displayedPhoto ? (
                        <div className="flex items-center gap-3">
                            <img
                                src={displayedPhoto}
                                alt="بطاقة شخصية"
                                className="w-40 h-24 object-cover rounded-xl border border-gold/20"
                            />
                            <div className="flex flex-col gap-2">
                                <button
                                    type="button"
                                    onClick={() => fileRef.current?.click()}
                                    className="px-3 py-1.5 bg-white border border-gold/30 text-brown-dark rounded-lg text-xs font-medium hover:bg-gold-soft"
                                >
                                    🔄 استبدال
                                </button>
                                {photoPreview && (
                                    <button
                                        type="button"
                                        onClick={() => handleFile(null)}
                                        className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-medium hover:bg-rose-100"
                                    >
                                        ✕ إلغاء
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            className="w-full flex flex-col items-center justify-center gap-2 py-5 rounded-xl border-2 border-dashed border-gold/30 bg-beige/50 hover:bg-beige text-brown-mid transition-colors"
                        >
                            <span className="text-2xl">📷</span>
                            <span className="text-sm">اضغط لرفع صورة البطاقة</span>
                            <span className="text-xs text-brown-light">JPG/PNG/WEBP — حتى 5 ميجا</span>
                        </button>
                    )}
                </Field>

                <SectionLabel>الدور والقبيلة</SectionLabel>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="الدور" required error={form.errors.role}>
                        <select
                            value={form.data.role}
                            onChange={(e) => form.setData('role', e.target.value as UserRole)}
                            disabled={isSelf}
                            className="form-input"
                        >
                            {roleOptions.map((r) => (
                                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                            ))}
                        </select>
                        {isSelf && (
                            <span className="block text-xs text-brown-light mt-1">
                                لا يمكنك تغيير دورك بنفسك
                            </span>
                        )}
                    </Field>

                    <Field label="القبيلة" error={form.errors.tribe_id}>
                        <SearchableSelect
                            options={tribes.map((t) => ({ value: t.id, label: t.name_ar }))}
                            value={form.data.tribe_id}
                            onChange={(v) => form.setData('tribe_id', v ? Number(v) : null)}
                            placeholder="— بدون قبيلة —"
                            searchPlaceholder="ابحث عن قبيلة..."
                            allowClear
                            clearLabel="— بدون قبيلة —"
                        />
                    </Field>
                </div>

                <label className="inline-flex items-center gap-2 cursor-pointer text-brown-dark text-sm">
                    <input
                        type="checkbox"
                        checked={form.data.is_active}
                        onChange={(e) => form.setData('is_active', e.target.checked)}
                        className="accent-gold-light w-4 h-4"
                    />
                    <span>الحساب مفعّل</span>
                </label>

                <SectionLabel>
                    كلمة المرور {isEdit && <span className="text-brown-light font-normal">(اتركها فارغة للإبقاء على الحالية)</span>}
                </SectionLabel>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="كلمة المرور" required={!isEdit} error={form.errors.password}>
                        <input
                            type="password"
                            value={form.data.password}
                            onChange={(e) => form.setData('password', e.target.value)}
                            autoComplete="new-password"
                            required={!isEdit}
                            className="form-input"
                        />
                    </Field>

                    <Field label="تأكيد كلمة المرور">
                        <input
                            type="password"
                            value={form.data.password_confirmation}
                            onChange={(e) => form.setData('password_confirmation', e.target.value)}
                            autoComplete="new-password"
                            required={!isEdit || !!form.data.password}
                            className="form-input"
                        />
                    </Field>
                </div>
            </form>

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
                .form-input:disabled {
                    background: #f5efe6;
                    opacity: 0.7;
                    cursor: not-allowed;
                }
            `}</style>
        </Modal>
    );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <div className="pt-2 pb-1 border-b border-gold/20">
            <span className="text-gold text-xs font-bold uppercase tracking-wider">
                {children}
            </span>
        </div>
    );
}

function Field({
    label,
    required,
    error,
    children,
}: {
    label: string;
    required?: boolean;
    error?: string;
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
