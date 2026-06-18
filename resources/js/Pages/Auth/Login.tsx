import { Button } from '@/Components/UI/Button';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <GuestLayout>
            <Head title="تسجيل الدخول" />

            <h1 className="font-amiri text-[26px] font-bold text-brown-dark mb-1 text-center">
                مرحباً بعودتك
            </h1>
            <p className="text-brown-light text-sm text-center mb-6">
                سجّل دخولك لمتابعة توثيق الأنساب
            </p>

            {status && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-700 text-sm text-center">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <AuthField label="البريد الإلكتروني" error={errors.email}>
                    <input
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        autoComplete="username"
                        autoFocus
                        dir="ltr"
                        className="auth-input text-right"
                        placeholder="you@example.com"
                    />
                </AuthField>

                <AuthField label="كلمة المرور" error={errors.password}>
                    <input
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        autoComplete="current-password"
                        className="auth-input"
                        placeholder="••••••••"
                    />
                </AuthField>

                <div className="flex items-center justify-between text-sm">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-brown-mid hover:text-brown-dark transition-colors">
                        <input
                            type="checkbox"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="w-4 h-4 rounded accent-gold"
                        />
                        <span>تذكّرني</span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-gold hover:text-gold-light underline underline-offset-2 text-xs"
                        >
                            نسيت كلمة المرور؟
                        </Link>
                    )}
                </div>

                <Button type="submit" disabled={processing} className="w-full mt-2">
                    {processing ? 'جاري الدخول...' : 'تسجيل الدخول'}
                </Button>
            </form>

            <div className="mt-6 text-center text-brown-mid text-sm">
                ليس لديك حساب؟{' '}
                <Link
                    href={route('register')}
                    className="text-gold hover:text-gold-light font-medium underline underline-offset-2"
                >
                    إنشاء حساب جديد
                </Link>
            </div>

            <style>{authStyles}</style>
        </GuestLayout>
    );
}

export function AuthField({
    label,
    error,
    children,
}: {
    readonly label: string;
    readonly error?: string;
    readonly children: React.ReactNode;
}) {
    return (
        <label className="block">
            <span className="block text-brown-mid text-sm font-medium mb-1.5">{label}</span>
            {children}
            {error && <span className="block text-rose-600 text-xs mt-1">{error}</span>}
        </label>
    );
}

export const authStyles = `
    .auth-input {
        width: 100%;
        padding: 0.7rem 1rem;
        background: #fff;
        color: #3D2B1F;
        border: 1px solid rgba(139, 105, 20, 0.25);
        border-radius: 0.75rem;
        transition: all 150ms;
        font-family: inherit;
    }
    .auth-input::placeholder { color: rgba(61, 43, 31, 0.35); }
    .auth-input:focus {
        outline: none;
        border-color: #8B6914;
        box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.2);
    }
    .dark .auth-input {
        background: #2C1F10;
        color: #F5EFE6;
        border-color: rgba(201, 168, 76, 0.3);
    }
    .dark .auth-input::placeholder { color: rgba(245, 239, 230, 0.35); }
`;
