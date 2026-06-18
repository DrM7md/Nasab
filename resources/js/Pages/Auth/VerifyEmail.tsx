import { Button } from '@/Components/UI/Button';
import { MailIcon } from '@/Components/UI/Icons';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="توثيق البريد الإلكتروني" />

            <div className="text-center mb-6">
                <div className="inline-flex w-16 h-16 rounded-2xl bg-gold-soft/50 border border-gold/20 text-gold items-center justify-center mb-3">
                    <MailIcon className="w-8 h-8" />
                </div>
                <h1 className="font-amiri text-[26px] font-bold text-brown-dark mb-2">
                    تحقّق من بريدك الإلكتروني
                </h1>
                <p className="text-brown-light text-sm leading-relaxed">
                    شكراً لانضمامك! أرسلنا رابط توثيق إلى بريدك.
                    يرجى الضغط عليه لتفعيل حسابك.
                </p>
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-700 text-sm text-center">
                    تم إرسال رابط توثيق جديد إلى بريدك الإلكتروني.
                </div>
            )}

            <form onSubmit={submit} className="space-y-3">
                <Button type="submit" disabled={processing} className="w-full">
                    {processing ? 'جاري الإرسال...' : 'إعادة إرسال رابط التوثيق'}
                </Button>

                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="block w-full py-2.5 text-center text-brown-light hover:text-brown-dark text-sm underline underline-offset-2"
                >
                    تسجيل الخروج
                </Link>
            </form>
        </GuestLayout>
    );
}
