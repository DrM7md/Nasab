import type { PersonSuggestion } from '@/Components/Search/PersonSearchBox';

const ORDER_LABELS: Record<number, string> = {
    1: 'الأولى',
    2: 'الثانية',
    3: 'الثالثة',
    4: 'الرابعة',
};

interface Props {
    spouse: PersonSuggestion;
    order: number;
    showOrder: boolean;
    onRemove: () => void;
}

/**
 * SpouseChip — chip للزوج/الزوجة المختار في فورم الإضافة/التعديل.
 */
export default function SpouseChip({ spouse, order, showOrder, onRemove }: Props) {
    return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-sm">
            {showOrder && (
                <span className="text-[10px] bg-rose-200 px-1.5 py-0.5 rounded font-bold">
                    {ORDER_LABELS[order] ?? order}
                </span>
            )}
            <span className="font-medium">{spouse.short_name_ar}</span>
            <button
                type="button"
                onClick={onRemove}
                className="w-5 h-5 rounded-full hover:bg-rose-200 flex items-center justify-center text-rose-700 text-xs"
                aria-label="إزالة"
            >
                ✕
            </button>
        </div>
    );
}
