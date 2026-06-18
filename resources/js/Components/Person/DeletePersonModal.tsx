import Modal from '@/Components/UI/Modal';
import { router } from '@inertiajs/react';
import { useState } from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    tribeSlug: string;
    person: { id: number; short_name_ar: string };
    childrenCount: number;
}

/**
 * DeletePersonModal — حذف شخص مع تأكيد + كتابة الاسم.
 * يَحظر العملية لو كان للشخص أبناء.
 */
export default function DeletePersonModal({ isOpen, onClose, tribeSlug, person, childrenCount }: Props) {
    const [confirmText, setConfirmText] = useState('');
    const [processing, setProcessing] = useState(false);

    const hasChildren = childrenCount > 0;
    const canDelete = !hasChildren && confirmText.trim() === person.short_name_ar.trim();

    const handleDelete = () => {
        if (!canDelete) return;
        setProcessing(true);

        // الـ controller يُرجع redirect لصفحة الشجرة تلقائياً عند نجاح الحذف
        router.post(
            `/tribes/${tribeSlug}/pending-edits`,
            {
                edit_type: 'delete',
                target_id: person.id,
            },
            {
                preserveScroll: false,
                onError: () => setProcessing(false),
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="حذف شخص"
            size="md"
            footer={
                <>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 bg-white text-brown-mid border border-gold/20 rounded-xl font-medium hover:bg-beige transition-colors"
                    >
                        إلغاء
                    </button>
                    {!hasChildren && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={!canDelete || processing}
                            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {processing ? 'جاري الحذف...' : '🗑️ احذف نهائياً'}
                        </button>
                    )}
                </>
            }
        >
            {hasChildren ? (
                <div className="text-center py-4">
                    <div className="text-5xl mb-3">⚠️</div>
                    <h3 className="text-lg font-bold text-rose-700 mb-2">
                        لا يمكن حذف هذا الشخص
                    </h3>
                    <p className="text-brown-mid text-sm leading-relaxed">
                        هذا الشخص له <strong className="text-brown-dark">{childrenCount}</strong> من
                        الأبناء في الشجرة.
                        <br />
                        يجب حذف أبنائه أولاً (أو نقلهم لوالد آخر) قبل حذفه.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
                        <p className="text-rose-800 dark:text-rose-300 text-sm leading-relaxed">
                            <strong className="font-bold">تحذير:</strong> ستحذف الشخص{' '}
                            <strong className="font-bold">"{person.short_name_ar}"</strong> نهائياً
                            مع كل سجلات زواجه. هذه العملية لا يمكن التراجع عنها.
                        </p>
                    </div>

                    <label className="block">
                        <span className="block text-brown-dark text-sm font-medium mb-1.5">
                            للتأكيد، اكتب الاسم المختصر:{' '}
                            <code className="px-1.5 py-0.5 bg-beige-dark rounded font-mono text-brown-dark">
                                {person.short_name_ar}
                            </code>
                        </span>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            autoFocus
                            placeholder="اكتب الاسم هنا..."
                            className="w-full px-4 py-2.5 border-2 border-rose-200 dark:border-rose-900/40 rounded-xl focus:border-rose-500 focus:outline-none"
                        />
                    </label>
                </div>
            )}
        </Modal>
    );
}
