import { Button } from '@/Components/UI/Button';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { AuthField, authStyles } from './Login';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="استعادة كلمة المرور" />

            <h1 className="font-amiri text-[26px] font-bold text-brown-dark mb-1 text-center">
                نسيت كلمة المرور؟
            </h1>
            <p className="text-brown-light text-sm text-center mb-6 leading-relaxed">
                أدخل بريدك الإلكتروني وسنرسل لك رابطاً لاستعادتها.
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
                        autoFocus
                        required
                        dir="ltr"
                        className="auth-input text-right"
                        placeholder="you@example.com"
                    />
                </AuthField>

                <Button type="submit" disabled={processing} className="w-full">
                    {processing ? 'جاري الإرسال...' : 'إرسال رابط الاستعادة'}
                </Button>
            </form>

            <div className="mt-6 text-center text-brown-mid text-sm">
                <Link
                    href={route('login')}
                    className="text-gold hover:text-gold-light underline underline-offset-2"
                >
                    العودة لتسجيل الدخول
                </Link>
            </div>

            <style>{authStyles}</style>
        </GuestLayout>
    );
}
