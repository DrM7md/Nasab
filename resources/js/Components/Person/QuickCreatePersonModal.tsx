import type { PersonSuggestion } from '@/Components/Search/PersonSearchBox';
import Modal from '@/Components/UI/Modal';
import type { Gender } from '@/types';
import { useEffect, useState } from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    tribeSlug: string;
    /** الاسم المبدئي (يأتي من البحث الفاشل) */
    initialName: string;
    /** الجنس المتوقع (نُلزم به لئلا يخلط بين زوج وزوجة) */
    fixedGender: Gender;
    /** التسمية المعروضة (مثلاً "زوجة جديدة") */
    title?: string;
    /** يُستدعى بعد إنشاء الشخص بنجاح */
    onCreated: (person: PersonSuggestion) => void;
}

/**
 * QuickCreatePersonModal — modal صغير لإنشاء شخص بسرعة من داخل فورم آخر
 * (مثل: إنشاء زوجة جديدة من فورم إضافة شخص).
 * يستخدم endpoint POST /tribes/{slug}/persons المتاح للمشرفين.
 */
export default function QuickCreatePersonModal({
    isOpen,
    onClose,
    tribeSlug,
    initialName,
    fixedGender,
    title,
    onCreated,
}: Props) {
    const [shortName, setShortName] = useState(initialName);
    const [fullName, setFullName] = useState(initialName);
    const [birthYear, setBirthYear] = useState('');
    const [deathYear, setDeathYear] = useState('');
    const [titleField, setTitleField] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setShortName(initialName);
            setFullName(initialName);
            setBirthYear('');
            setDeathYear('');
            setTitleField('');
            setError(null);
        }
    }, [isOpen, initialName]);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!shortName.trim() || !fullName.trim()) {
            setError('الاسم مطلوب');
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null)?.content
                ?? (document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? '');

            const res = await fetch(`/tribes/${tribeSlug}/persons`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': decodeURIComponent(csrfToken),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    name_ar: fullName.trim(),
                    short_name_ar: shortName.trim(),
                    gender: fixedGender,
                    title: titleField.trim() || null,
                    birth_year: birthYear ? Number(birthYear) : null,
                    death_year: deathYear ? Number(deathYear) : null,
                }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                const msg = body.message || `فشل الإنشاء (HTTP ${res.status})`;
                throw new Error(msg);
            }

            const created = (await res.json()) as PersonSuggestion;
            onCreated(created);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'فشل غير متوقع');
        } finally {
            setProcessing(false);
        }
    };

    const defaultTitle = title ?? (fixedGender === 'female' ? 'إنشاء زوجة جديدة' : 'إنشاء شخص جديد');

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={defaultTitle}
            size="md"
            footer={
                <>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 bg-white text-brown-mid border border-gold/20 rounded-xl font-medium hover:bg-beige"
                    >
                        إلغاء
                    </button>
                    <button
                        type="button"
                        onClick={submit}
                        disabled={processing}
                        className="px-5 py-2.5 bg-gradient-to-r from-gold to-gold-light text-white rounded-xl font-bold shadow-md hover:shadow-lg disabled:opacity-50"
                    >
                        {processing ? 'جاري الإنشاء...' : 'إنشاء وإضافة'}
                    </button>
                </>
            }
        >
            <form onSubmit={submit} className="space-y-4">
                <div className="bg-gold-soft/30 border border-gold/20 rounded-xl p-3 text-xs text-brown-mid leading-relaxed">
                    💡 سيُنشأ هذا الشخص فوراً ثم يُضاف للقائمة. يمكنك تعديل بياناته لاحقاً من ملفه.
                </div>

                {error && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl p-3">
                        {error}
                    </div>
                )}

                <FormField label="الاسم المختصر" required>
                    <input
                        type="text"
                        value={shortName}
                        onChange={(e) => setShortName(e.target.value)}
                        autoFocus
                        required
                        className="quick-input"
                    />
                </FormField>

                <FormField label="الاسم الكامل" required>
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="quick-input"
                    />
                </FormField>

                <FormField label="اللقب (اختياري)">
                    <input
                        type="text"
                        value={titleField}
                        onChange={(e) => setTitleField(e.target.value)}
                        className="quick-input"
                    />
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField label="سنة الميلاد">
                        <input
                            type="number"
                            value={birthYear}
                            onChange={(e) => setBirthYear(e.target.value)}
                            min="1000"
                            max="2200"
                            className="quick-input"
                        />
                    </FormField>

                    <FormField label="سنة الوفاة">
                        <input
                            type="number"
                            value={deathYear}
                            onChange={(e) => setDeathYear(e.target.value)}
                            min="1000"
                            max="2200"
                            className="quick-input"
                        />
                    </FormField>
                </div>
            </form>

            <style>{`
                .quick-input {
                    width: 100%;
                    padding: 0.625rem 1rem;
                    border: 2px solid rgba(139, 105, 20, 0.2);
                    border-radius: 0.75rem;
                    background: white;
                    color: #3D2B1F;
                    transition: border-color 150ms;
                }
                .quick-input:focus {
                    outline: none;
                    border-color: #8B6914;
                    box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.15);
                }
            `}</style>
        </Modal>
    );
}

function FormField({
    label,
    required,
    children,
}: {
    readonly label: string;
    readonly required?: boolean;
    readonly children: React.ReactNode;
}) {
    return (
        <label className="block">
            <span className="block text-brown-dark text-sm font-medium mb-1.5">
                {label}
                {required && <span className="text-rose-500 mr-1">*</span>}
            </span>
            {children}
        </label>
    );
}
