import Modal from '@/Components/UI/Modal';
import type { FeedbackType } from '@/types';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

/**
 * FeedbackButton — أيقونة بجانب الوضع الليلي.
 * تفتح نافذة لإرسال اقتراح تطويري أو بلاغ خلل (مع صورة اختيارية) إلى المدير العام.
 */
export default function FeedbackButton() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="اقتراح أو بلاغ خلل"
                title="إرسال اقتراح أو بلاغ خلل"
                className="
                    w-10 h-10 rounded-xl
                    bg-white/90 dark:bg-night-card/90 backdrop-blur-md
                    border border-gold/20 dark:border-gold/30
                    text-brown-dark dark:text-gold-soft
                    shadow-md hover:shadow-lg
                    flex items-center justify-center
                    transition-all hover:scale-105
                "
            >
                <MegaphoneIcon />
            </button>

            <FeedbackModal isOpen={open} onClose={() => setOpen(false)} />
        </>
    );
}

function FeedbackModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const { data, setData, post, transform, processing, errors, reset, clearErrors } = useForm<{
        type: FeedbackType;
        message: string;
        page_url: string;
        screenshot: File | null;
    }>({
        type: 'idea',
        message: '',
        page_url: '',
        screenshot: null,
    });

    const close = () => {
        reset();
        clearErrors();
        setPreview(null);
        if (fileRef.current) fileRef.current.value = '';
        onClose();
    };

    const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setData('screenshot', file);
        setPreview(file ? URL.createObjectURL(file) : null);
    };

    const removeImage = () => {
        setData('screenshot', null);
        setPreview(null);
        if (fileRef.current) fileRef.current.value = '';
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // المسار الحالي لمساعدة المدير على معرفة موضع الخلل
        const url = window.location.pathname + window.location.search;
        transform((d) => ({ ...d, page_url: url }));
        post(route('feedback.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => close(),
        });
    };

    const isBug = data.type === 'bug';

    return (
        <Modal isOpen={isOpen} onClose={close} title="اقتراح أو بلاغ خلل" size="md">
            <form onSubmit={submit} className="space-y-5">
                {/* اختيار النوع */}
                <div className="grid grid-cols-2 gap-3">
                    <TypeCard
                        active={data.type === 'idea'}
                        onClick={() => setData('type', 'idea')}
                        emoji="💡"
                        title="اقتراح تطويري"
                        desc="فكرة لتحسين الموقع"
                        color="gold"
                    />
                    <TypeCard
                        active={isBug}
                        onClick={() => setData('type', 'bug')}
                        emoji="🐞"
                        title="بلاغ خلل"
                        desc="مشكلة تواجهك"
                        color="rose"
                    />
                </div>

                {/* الرسالة */}
                <div>
                    <label className="block text-sm font-bold text-brown-dark mb-1.5">
                        {isBug ? 'صف الخلل بالتفصيل' : 'اكتب اقتراحك'}
                    </label>
                    <textarea
                        value={data.message}
                        onChange={(e) => setData('message', e.target.value)}
                        rows={5}
                        placeholder={
                            isBug
                                ? 'ماذا حدث؟ وأين بالضبط؟ وما الذي كنت تتوقعه؟'
                                : 'صف فكرتك بوضوح وكيف ستفيد المستخدمين...'
                        }
                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-night-bg border-2 border-gold/20 focus:border-gold focus:outline-none text-brown-dark resize-y"
                    />
                    {errors.message && (
                        <p className="text-rose-600 text-xs mt-1">{errors.message}</p>
                    )}
                </div>

                {/* إرفاق صورة */}
                <div>
                    <label className="block text-sm font-bold text-brown-dark mb-1.5">
                        إرفاق صورة {isBug && <span className="text-brown-light font-normal">(تُظهر موضع الخلل)</span>}
                    </label>

                    {preview ? (
                        <div className="relative inline-block">
                            <img
                                src={preview}
                                alt="معاينة المرفق"
                                className="max-h-48 rounded-xl border border-gold/20 shadow-sm"
                            />
                            <button
                                type="button"
                                onClick={removeImage}
                                className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-rose-600 text-white text-sm flex items-center justify-center shadow-md hover:bg-rose-700"
                                aria-label="إزالة الصورة"
                            >
                                ✕
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            className="w-full flex flex-col items-center justify-center gap-2 px-4 py-6 rounded-xl border-2 border-dashed border-gold/30 text-brown-mid hover:border-gold hover:bg-beige/50 dark:hover:bg-night-bg transition-colors"
                        >
                            <PhotoIcon />
                            <span className="text-sm">اضغط لاختيار صورة (PNG/JPG حتى 5MB)</span>
                        </button>
                    )}

                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={onPickFile}
                        className="hidden"
                    />
                    {errors.screenshot && (
                        <p className="text-rose-600 text-xs mt-1">{errors.screenshot}</p>
                    )}
                </div>

                {/* أزرار */}
                <div className="flex gap-3 justify-end pt-2 border-t border-gold/10">
                    <button
                        type="button"
                        onClick={close}
                        className="px-5 py-2.5 bg-white dark:bg-night-card text-brown-mid border border-gold/20 rounded-xl font-medium hover:bg-beige"
                    >
                        إلغاء
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-5 py-2.5 bg-gradient-to-r from-gold to-gold-light text-white rounded-xl font-bold shadow-md hover:shadow-lg disabled:opacity-50 transition-all"
                    >
                        {processing ? 'جاري الإرسال...' : '📨 إرسال إلى المدير العام'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

function TypeCard({
    active,
    onClick,
    emoji,
    title,
    desc,
    color,
}: {
    active: boolean;
    onClick: () => void;
    emoji: string;
    title: string;
    desc: string;
    color: 'gold' | 'rose';
}) {
    const activeRing =
        color === 'gold'
            ? 'border-gold bg-gold-soft/40'
            : 'border-rose-400 bg-rose-50 dark:bg-rose-950/20';

    return (
        <button
            type="button"
            onClick={onClick}
            className={`
                text-right p-3 rounded-xl border-2 transition-all
                ${active ? activeRing : 'border-gold/15 bg-white dark:bg-night-bg hover:border-gold/40'}
            `}
        >
            <div className="text-2xl mb-1">{emoji}</div>
            <div className="font-bold text-brown-dark text-sm">{title}</div>
            <div className="text-brown-light text-xs">{desc}</div>
        </button>
    );
}

function MegaphoneIcon() {
    return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
    );
}

function PhotoIcon() {
    return (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    );
}
