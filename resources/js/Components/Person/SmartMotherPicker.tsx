import PersonSearchBox, { type PersonSuggestion } from '@/Components/Search/PersonSearchBox';

export type MotherMode = 'auto' | 'pick_wife' | 'search_other' | 'none';

interface Props {
    label?: string;
    wives: PersonSuggestion[];
    mode: MotherMode;
    switchMode: (m: MotherMode) => void;
    selectedMotherId: number | null;
    onPickWife: (id: number | null) => void;
    otherParent: PersonSuggestion | null;
    onSearchSelect: (p: PersonSuggestion | null) => void;
    tribeSlug: string;
    error?: string;
    /** يُستدعى عند ضغط "إنشاء أم جديدة" من البحث */
    onCreateNew?: (name: string) => void;
}

/**
 * SmartMotherPicker — اختيار ذكي للأم:
 *  - زوجة وحيدة للأب → تُختار تلقائياً (مع زر تغيير)
 *  - عدة زوجات → اختيار من قائمة + خيار "أخرى" للحالات الخاصة
 *  - لا زوجات للأب → بحث عام
 */
export default function SmartMotherPicker({
    label = 'الأم',
    wives,
    mode,
    switchMode,
    selectedMotherId,
    onPickWife,
    otherParent,
    onSearchSelect,
    tribeSlug,
    error,
    onCreateNew,
}: Props) {
    // الحالة 1: زوجة وحيدة → عرضها تلقائياً
    if (mode === 'auto' && wives.length === 1) {
        const w = wives[0];
        return (
            <Field label={label} hint="تم تحديد الزوجة الوحيدة للأب تلقائياً" error={error}>
                <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200">
                    <span className="text-rose-900 font-medium">🧕 {w.short_name_ar}</span>
                    <button
                        type="button"
                        onClick={() => switchMode('search_other')}
                        className="text-xs text-brown-mid hover:text-brown-dark underline underline-offset-2"
                    >
                        تغيير
                    </button>
                </div>
            </Field>
        );
    }

    // الحالة 2: عدة زوجات → اختيار من القائمة
    if (mode === 'pick_wife' && wives.length > 1) {
        return (
            <Field
                label={label}
                hint="اختر من زوجات الأب، أو «أخرى» للحالات الخاصة (تبني...)"
                error={error}
            >
                <div className="space-y-2">
                    {wives.map((w) => (
                        <button
                            key={w.id}
                            type="button"
                            onClick={() => onPickWife(w.id)}
                            className={`
                                w-full text-right px-4 py-2.5 rounded-xl border-2 transition-all flex items-center gap-2
                                ${selectedMotherId === w.id
                                    ? 'bg-rose-50 border-rose-400 text-rose-900 font-medium'
                                    : 'bg-white border-gold/20 text-brown-mid hover:border-gold/40'
                                }
                            `}
                        >
                            <span>🧕</span>
                            <span>{w.short_name_ar}</span>
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={() => switchMode('search_other')}
                        className="w-full text-center py-2 rounded-xl border border-dashed border-gold/30 text-brown-mid hover:bg-beige text-sm transition-colors"
                    >
                        ✏️ أخرى... (تبني / غير مذكورة / من خارج هذا الأب)
                    </button>
                </div>
            </Field>
        );
    }

    // الحالة 3: بحث عام
    return (
        <Field
            label={`${label} (اختياري)`}
            hint={
                wives.length > 0
                    ? 'اتركها فارغة لو غير مذكورة، أو ابحث عن أم من خارج زوجات الأب'
                    : 'لا توجد زوجات مسجّلة للأب — يمكنك البحث عن أي أم'
            }
            error={error}
        >
            <div className="space-y-2">
                <PersonSearchBox
                    tribeSlug={tribeSlug}
                    placeholder="ابحث عن الأم..."
                    selected={otherParent}
                    onSelect={onSearchSelect}
                    onClear={() => onSearchSelect(null)}
                    onCreateNew={onCreateNew}
                    createLabel="إنشاء أم جديدة"
                />
                {wives.length > 0 && (
                    <button
                        type="button"
                        onClick={() => switchMode(wives.length === 1 ? 'auto' : 'pick_wife')}
                        className="text-xs text-gold hover:text-gold-light underline underline-offset-2"
                    >
                        ← العودة لاختيار من زوجات الأب
                    </button>
                )}
            </div>
        </Field>
    );
}

function Field({
    label,
    error,
    hint,
    children,
}: {
    readonly label: string;
    readonly error?: string;
    readonly hint?: string;
    readonly children: React.ReactNode;
}) {
    return (
        <label className="block">
            <span className="block text-brown-dark text-sm font-medium mb-1.5">
                {label}
            </span>
            {children}
            {hint && !error && (
                <span className="block text-brown-light text-[11px] mt-1">{hint}</span>
            )}
            {error && <span className="block text-rose-500 text-xs mt-1">{error}</span>}
        </label>
    );
}
