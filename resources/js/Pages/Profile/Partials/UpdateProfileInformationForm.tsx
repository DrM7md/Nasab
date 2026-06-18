import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}: {
    mustVerifyEmail: boolean;
    status?: string;
    className?: string;
}) {
    const user = usePage().props.auth.user!;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <div className={className}>
            <p className="text-brown-mid text-sm mb-5">
                حدّث معلومات حسابك وبريدك الإلكتروني.
            </p>

            <form onSubmit={submit} className="space-y-4">
                <ProfileField label="الاسم" error={errors.name}>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        autoComplete="name"
                        required
                        className="profile-input"
                    />
                </ProfileField>

                <ProfileField label="البريد الإلكتروني" error={errors.email}>
                    <input
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        autoComplete="username"
                        required
                        dir="ltr"
                        className="profile-input text-right"
                    />
                </ProfileField>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-sm">
                        <p className="text-amber-800 dark:text-amber-300">
                            بريدك الإلكتروني غير موثّق.{' '}
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="text-amber-900 dark:text-amber-200 underline underline-offset-2 font-medium"
                            >
                                اضغط هنا لإعادة إرسال رابط التوثيق.
                            </Link>
                        </p>
                        {status === 'verification-link-sent' && (
                            <p className="mt-2 text-emerald-600 dark:text-emerald-400 font-medium">
                                ✓ تم إرسال رابط جديد إلى بريدك الإلكتروني.
                            </p>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4 pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-6 py-2.5 bg-gradient-to-r from-gold to-gold-light text-white rounded-xl font-bold shadow-md hover:shadow-lg disabled:opacity-50 transition-all"
                    >
                        {processing ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                            ✓ تم الحفظ
                        </p>
                    </Transition>
                </div>
            </form>

            <style>{profileInputStyles}</style>
        </div>
    );
}

export function ProfileField({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <label className="block">
            <span className="block text-brown-dark text-sm font-medium mb-1.5">
                {label}
            </span>
            {children}
            {error && (
                <span className="block text-rose-500 text-xs mt-1">{error}</span>
            )}
        </label>
    );
}

export const profileInputStyles = `
    .profile-input {
        width: 100%;
        padding: 0.625rem 1rem;
        background: white;
        color: #3D2B1F;
        border: 2px solid rgba(139, 105, 20, 0.2);
        border-radius: 0.75rem;
        transition: all 150ms;
    }
    .profile-input:focus {
        outline: none;
        border-color: #8B6914;
        box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.15);
    }
`;
