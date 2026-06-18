import GenderAvatar from '@/Components/UI/GenderAvatar';
import type { PersonNodeData } from '@/types';
import { Handle, NodeProps, Position } from '@xyflow/react';
import { memo } from 'react';

/**
 * FemaleNode — بطاقة الأنثى في الشجرة (شكل بيضاوي بلمسة وردية).
 * تمييز بصري حسب الحالة (مرئي من بعيد):
 *   - حيّ:    تدرّج عسلي/كريمي + إطار ذهبي + نقطة خضراء
 *   - متوفى:  تدرّج وردي/أحمر فاتح أوضح من الافتراضي
 *   - غير معروف: تدرّج وردي خفيف (الافتراضي)
 */
function FemaleNodeComponent({ data, selected }: NodeProps & { data: PersonNodeData }) {
    const hasChildren = data.children_count > 0;
    const isLiving = data.life_status === 'living';
    const isDeceased = data.life_status === 'deceased';
    const yearRange = data.birth_year
        ? `${data.birth_year}${data.death_year ? ` — ${data.death_year}` : ''}`
        : '';

    let cardBg: string;
    let cardBorder: string;

    if (isLiving) {
        cardBg = 'bg-gradient-to-b from-amber-100 via-amber-50 to-white';
        cardBorder = selected
            ? 'border-amber-500 shadow-[0_0_0_4px_rgba(245,158,11,0.22),0_8px_24px_rgba(0,0,0,0.15)] scale-[1.02]'
            : 'border-amber-400/80 hover:border-amber-500 hover:shadow-xl';
    } else if (isDeceased) {
        cardBg = 'bg-gradient-to-b from-rose-300/70 via-rose-200/60 to-rose-50/40';
        cardBorder = selected
            ? 'border-rose-500 shadow-[0_0_0_4px_rgba(244,63,94,0.2),0_8px_24px_rgba(0,0,0,0.15)] scale-[1.02]'
            : 'border-rose-400/70 hover:border-rose-500 hover:shadow-xl';
    } else {
        cardBg = 'bg-gradient-to-b from-rose-50 to-white';
        cardBorder = selected
            ? 'border-rose-400 shadow-[0_0_0_4px_rgba(244,114,182,0.2),0_8px_24px_rgba(0,0,0,0.15)] scale-[1.02]'
            : 'border-rose-200 hover:border-rose-300 hover:shadow-xl';
    }

    return (
        <div className="relative" dir="rtl">
            <Handle
                type="target"
                position={Position.Top}
                className="!w-2 !h-2 !bg-rose-300 !border-0 !opacity-0 !pointer-events-none"
            />

            <div
                className={`
                    relative ${cardBg}
                    rounded-[2rem] shadow-lg px-5 py-4 min-w-[180px]
                    border-2 transition-all duration-200
                    ${cardBorder}
                `}
            >
                {isLiving && (
                    <span
                        className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white shadow"
                        title="على قيد الحياة"
                    />
                )}

                <div className="flex justify-center mb-2">
                    <GenderAvatar
                        gender="female"
                        photo={data.photo ?? null}
                        size="md"
                        alt={data.short_name_ar}
                    />
                </div>

                <div className="text-center">
                    <div className="text-brown-dark font-bold text-base leading-tight">
                        {data.short_name_ar}
                    </div>
                    {data.title && (
                        <div className="text-rose-600 text-[11px] mt-0.5 font-medium">
                            {data.title}
                        </div>
                    )}
                    {yearRange && (
                        <div className="text-brown-light text-[10px] mt-1 font-mono">
                            {yearRange}
                        </div>
                    )}
                </div>
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                className="!w-2 !h-2 !bg-rose-300 !border-0 !opacity-0 !pointer-events-none"
            />

            {hasChildren && (
                <button
                    type="button"
                    data-expand-btn="true"
                    className={`
                        absolute left-1/2 -translate-x-1/2 -bottom-4
                        w-9 h-9 rounded-full z-20
                        bg-gradient-to-br from-rose-400 to-rose-600
                        text-white text-sm font-bold
                        shadow-md hover:shadow-lg
                        flex items-center justify-center
                        border-2 border-white
                        transition-all hover:scale-110
                        ${data.is_expanded ? 'rotate-180' : ''}
                    `}
                    aria-label={data.is_expanded ? 'طي الأبناء' : 'عرض الأبناء'}
                    title={data.is_expanded ? 'طي الأبناء' : `عرض ${data.children_count} من الأبناء`}
                >
                    {data.is_expanded ? '−' : data.children_count}
                </button>
            )}
        </div>
    );
}

export default memo(FemaleNodeComponent);
