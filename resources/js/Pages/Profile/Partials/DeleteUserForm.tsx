import NasabModal from '@/Components/UI/Modal';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';

export default function DeleteUserForm({
    className = '',
}: {
    className?: string;
}) {
    const [confirming, setConfirming] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({ password: '' });

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirming(false);
        clearErrors();
        reset();
    };

    return (
        <div className={className}>
            <p className="text-rose-700 dark:text-rose-400 text-sm mb-5 leading-relaxed">
                <strong className="font-bold">تحذير:</strong> حذف الحساب عملية لا رجعة فيها.
                ستُحذف كل بياناتك ومعلوماتك نهائياً. احرص على تحميل أي بيانات ترغب بالاحتفاظ بها قبل الحذف.
            </p>

            <button
                type="button"
                onClick={() => setConfirming(true)}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
            >
                🗑️ حذف حسابي
            </button>

            <NasabModal
                isOpen={confirming}
                onClose={closeModal}
                title="تأكيد حذف الحساب"
                size="md"
                footer={
                    <>
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-5 py-2.5 bg-white text-brown-mid border border-gold/20 rounded-xl font-medium hover:bg-beige transition-colors"
                        >
                            إلغاء
                        </button>
                        <button
                            type="button"
                            onClick={deleteUser}
                            disabled={processing}
                            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md disabled:opacity-50 transition-all"
                        >
                            {processing ? 'جاري الحذف...' : 'نعم، احذف حسابي'}
                        </button>
                    </>
                }
            >
                <form onSubmit={deleteUser} className="space-y-4">
                    <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
                        <p className="text-rose-800 dark:text-rose-300 text-sm leading-relaxed">
                            هل أنت متأكد من حذف حسابك؟ سيتم حذف جميع بياناتك
                            ومواردك نهائياً. أدخل كلمة المرور للتأكيد.
                        </p>
                    </div>

                    <label className="block">
                        <span className="block text-brown-dark text-sm font-medium mb-1.5">
                            كلمة المرور
                        </span>
                        <input
                            ref={passwordInput}
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            autoFocus
                            placeholder="أدخل كلمة المرور للتأكيد"
                            className="w-full px-4 py-2.5 border-2 border-rose-200 dark:border-rose-900/40 rounded-xl focus:border-rose-500 focus:outline-none"
                        />
                        {errors.password && (
                            <span className="block text-rose-500 text-xs mt-1">
                                {errors.password}
                            </span>
                        )}
                    </label>
                </form>
            </NasabModal>
        </div>
    );
}
