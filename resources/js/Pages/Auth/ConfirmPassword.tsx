import { Button } from '@/Components/UI/Button';
import { LockIcon } from '@/Components/UI/Icons';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { AuthField, authStyles } from './Login';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.confirm'), { onFinish: () => reset('password') });
    };

    return (
        <GuestLayout>
            <Head title="تأكيد كلمة المرور" />

            <div className="flex justify-center mb-3">
                <span className="w-14 h-14 rounded-2xl bg-gold-soft/50 border border-gold/20 text-gold flex items-center justify-center">
                    <LockIcon className="w-7 h-7" />
                </span>
            </div>
            <h1 className="font-amiri text-[26px] font-bold text-brown-dark mb-1 text-center">
                منطقة آمنة
            </h1>
            <p className="text-brown-light text-sm text-center mb-6 leading-relaxed">
                هذه منطقة حساسة. يرجى تأكيد كلمة المرور للمتابعة.
            </p>

            <form onSubmit={submit} className="space-y-4">
                <AuthField label="كلمة المرور" error={errors.password}>
                    <input
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        autoFocus
                        required
                        className="auth-input"
                        placeholder="••••••••"
                    />
                </AuthField>

                <Button type="submit" disabled={processing} className="w-full">
                    {processing ? 'جاري التأكيد...' : 'تأكيد'}
                </Button>
            </form>

            <style>{authStyles}</style>
        </GuestLayout>
    );
}
