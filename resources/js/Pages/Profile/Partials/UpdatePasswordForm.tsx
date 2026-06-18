import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';
import { ProfileField, profileInputStyles } from './UpdateProfileInformationForm';

export default function UpdatePasswordForm({
    className = '',
}: {
    className?: string;
}) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errs) => {
                if (errs.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }
                if (errs.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <div className={className}>
            <p className="text-brown-mid text-sm mb-5">
                اختر كلمة مرور قوية وفريدة لحماية حسابك.
            </p>

            <form onSubmit={updatePassword} className="space-y-4">
                <ProfileField
                    label="كلمة المرور الحالية"
                    error={errors.current_password}
                >
                    <input
                        ref={currentPasswordInput}
                        type="password"
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                        autoComplete="current-password"
                        className="profile-input"
                    />
                </ProfileField>

                <ProfileField label="كلمة المرور الجديدة" error={errors.password}>
                    <input
                        ref={passwordInput}
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        autoComplete="new-password"
                        className="profile-input"
                    />
                </ProfileField>

                <ProfileField
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
                        className="profile-input"
                    />
                </ProfileField>

                <div className="flex items-center gap-4 pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-6 py-2.5 bg-gradient-to-r from-gold to-gold-light text-white rounded-xl font-bold shadow-md hover:shadow-lg disabled:opacity-50 transition-all"
                    >
                        {processing ? 'جاري الحفظ...' : 'تحديث كلمة المرور'}
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
