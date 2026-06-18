import type { Gender, PersonNodeData } from '@/types';
import { Handle, Position } from '@xyflow/react';

/**
 * Medallion — عُقدة الشخص كـ«ميدالية» دائرية في الشجرة الحيّة.
 * الجذع (generation 0) أكبر وبإطار ذهبي عريض، والأحياء بإطار أخضر ونقطة نابضة.
 * الشجرة تنمو لأعلى: الأبناء فوق الأب → المقبض المصدر (للأبناء) أعلى، والهدف (من الأب) أسفل.
 */

const CIRCLE_SIZE = [96, 80, 66];
const FONT_SIZE = [42, 34, 28];

function byGen<T>(arr: T[], gen: number, fallback: T): T {
    return arr[gen] ?? fallback;
}

export default function Medallion({
    data,
    selected,
    gender,
}: {
    readonly data: PersonNodeData;
    readonly selected: boolean;
    readonly gender: Gender;
}) {
    const gen = data.generation ?? 0;
    const isRoot = gen === 0;
    const isLiving = data.life_status === 'living';
    const hasChildren = data.children_count > 0;

    const size = isRoot ? 96 : byGen(CIRCLE_SIZE, gen, 56);
    const font = isRoot ? 42 : byGen(FONT_SIZE, gen, 24);

    const yearRange = data.birth_year
        ? `${data.birth_year}${data.death_year ? ` — ${data.death_year}` : ''}`
        : '';

    // ألوان الإطار/الخلفية حسب الحالة
    let border: string;
    let bg: string;
    let letterColor = '#6b4d16';
    if (isRoot) {
        border = '3px solid #8B6914';
        bg = 'linear-gradient(160deg,#FFFBF2,#F0DDB4)';
    } else if (isLiving) {
        border = '2px solid #6E9D49';
        bg = 'linear-gradient(160deg,#fff,#EAF4DF)';
        letterColor = '#3f6b28';
    } else if (data.life_status === 'deceased') {
        border = '2px solid #C9A84C';
        bg = 'linear-gradient(160deg,#FFFBF2,#F3E5C6)';
    } else {
        border = '2px solid #C9A84C';
        bg = 'linear-gradient(160deg,#fff,#F6ECD6)';
    }

    const shadow = isRoot
        ? '0 14px 30px rgba(90,63,40,.32), inset 0 2px 6px rgba(255,255,255,.7)'
        : '0 9px 20px rgba(90,63,40,.22), inset 0 2px 5px rgba(255,255,255,.6)';

    const ring = selected ? '0 0 0 4px rgba(201,168,76,.35)' : '';
    const photoUrl = data.photo
        ? (/^(https?:|\/)/.test(data.photo) ? data.photo : `/storage/${data.photo}`)
        : null;

    return (
        <div className="ns-medallion relative flex flex-col items-center gap-2 cursor-pointer" dir="rtl">
            {/* مقبض الهدف (من الأب الذي في الأسفل) */}
            <Handle type="target" position={Position.Bottom} className="!w-2 !h-2 !bg-transparent !border-0 !opacity-0 !pointer-events-none" />

            {/* زر التوسيع (بُرعم) — الأبناء للأعلى */}
            {hasChildren && (
                <button
                    type="button"
                    data-expand-btn="true"
                    className={`absolute left-1/2 -translate-x-1/2 -top-3 z-20 w-8 h-8 rounded-full bg-gradient-to-br from-gold to-gold-light text-white text-xs font-bold shadow-md hover:shadow-lg flex items-center justify-center border-2 border-white transition-all hover:scale-110 ${data.is_expanded ? 'rotate-45' : ''}`}
                    aria-label={data.is_expanded ? 'طي الأبناء' : 'عرض الأبناء'}
                    title={data.is_expanded ? 'طي الأبناء' : `عرض ${data.children_count} من الأبناء`}
                >
                    {data.is_expanded ? '×' : data.children_count}
                </button>
            )}

            {/* الدائرة */}
            <div
                className="relative flex items-center justify-center shrink-0 overflow-visible"
                style={{ width: size, height: size, borderRadius: '50%', background: bg, border, boxShadow: ring ? `${shadow}, ${ring}` : shadow }}
            >
                {photoUrl ? (
                    <img src={photoUrl} alt={data.short_name_ar} className="w-full h-full object-cover rounded-full" />
                ) : (
                    <span style={{ fontFamily: "'Amiri', serif", fontSize: font, fontWeight: 700, color: letterColor }}>
                        {data.short_name_ar?.charAt(0) ?? '؟'}
                    </span>
                )}

                {/* نقطة الحيّ النابضة */}
                {isLiving && (
                    <>
                        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full" style={{ background: '#5BAE52', boxShadow: '0 0 0 3px #fff' }} />
                        <span className="ns-live-ring absolute -top-1 -right-1 w-3 h-3 rounded-full" style={{ background: '#5BAE52', animation: 'nsLivePulse 2.6s ease-out infinite' }} />
                    </>
                )}

                {/* شارة الجدّ الأكبر */}
                {isRoot && (
                    <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full" style={{ background: '#8B6914', letterSpacing: '.05em' }}>
                        الجدّ الأكبر
                    </span>
                )}
            </div>

            {/* لوحة الاسم */}
            <div className={`text-center bg-white/80 dark:bg-night-card/80 backdrop-blur-sm border border-gold/20 rounded-xl px-3.5 py-1.5 shadow-sm ${isRoot ? 'mt-2.5' : 'mt-1'}`}>
                <div className="font-amiri font-bold text-brown-dark leading-tight" style={{ fontSize: isRoot ? 19 : gen === 1 ? 17 : 15 }}>
                    {data.short_name_ar}
                </div>
                {data.title && <div className={`text-[10px] mt-0.5 font-medium ${gender === 'female' ? 'text-rose-600' : 'text-gold'}`}>{data.title}</div>}
                {yearRange && <div className="text-brown-light text-[10px] mt-0.5 font-mono">{yearRange}</div>}
            </div>

            {/* مقبض المصدر (للأبناء في الأعلى) */}
            <Handle type="source" position={Position.Top} className="!w-2 !h-2 !bg-transparent !border-0 !opacity-0 !pointer-events-none" />
        </div>
    );
}
