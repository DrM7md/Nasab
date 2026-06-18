import { Button } from '@/Components/UI/Button';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { AuthField, authStyles } from './Login';

export default function ResetPassword({
    token,
    email,
}: {
    token: string;
    email: string;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="كلمة مرور جديدة" />

            <h1 className="font-amiri text-[26px] font-bold text-brown-dark mb-1 text-center">
                تعيين كلمة مرور جديدة
            </h1>
            <p className="text-brown-light text-sm text-center mb-6">
                اختر كلمة مرور قوية لحسابك
            </p>

            <form onSubmit={submit} className="space-y-4">
                <AuthField label="البريد الإلكتروني" error={errors.email}>
                    <input
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        autoComplete="username"
                        dir="ltr"
                        className="auth-input text-right"
                    />
                </AuthField>

                <AuthField label="كلمة المرور الجديدة" error={errors.password}>
                    <input
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        autoComplete="new-password"
                        autoFocus
                        required
                        className="auth-input"
                        placeholder="••••••••"
                    />
                </AuthField>

                <AuthField
                    label="تأكيد كلمة المرور"
                    error={errors.password_confirmation}
                >
                    <input
                        type="password"
                        value={data.password_confirmation}
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        autoComplete="new-password"
                        required
                        className="auth-input"
                        placeholder="••••••••"
                    />
                </AuthField>

                <Button type="submit" disabled={processing} className="w-full">
                    {processing ? 'جاري الحفظ...' : 'حفظ كلمة المرور'}
                </Button>
            </form>

            <style>{authStyles}</style>
        </GuestLayout>
    );
}
