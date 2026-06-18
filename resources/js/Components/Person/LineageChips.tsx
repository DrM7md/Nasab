import type { Gender } from '@/types';
import { Link } from '@inertiajs/react';

export interface ChainPerson {
    id: number;
    short_name_ar: string;
    gender: Gender;
    title?: string | null;
}

interface Props {
    chain: ChainPerson[];
    tribeSlug: string;
}

/**
 * LineageChips
 *
 * يعرض سلسلة الأجداد بشكل chips أفقية قابلة للتمرير:
 *   [سلطان] بن › [صقر] بن › [راشد] بن › [قاسم]
 *
 * الرابط الأول يتحدد بجنس الشخص الأول:
 *   - ذكر → بن | أنثى → بنت
 * بقية الروابط "بن" دائماً.
 */
export default function LineageChips({ chain, tribeSlug }: Props) {
    if (chain.length === 0) return null;

    return (
        <div
            className="flex flex-wrap items-center gap-2 py-3 px-4 bg-beige-dark/40 rounded-2xl border border-gold/10 overflow-x-auto"
            dir="rtl"
        >
            {chain.map((person, index) => {
                const connector =
                    index === 0
                        ? null
                        : chain[index - 1].gender === 'female'
                          ? 'بنت'
                          : 'بن';

                return (
                    <div key={person.id} className="flex items-center gap-2 shrink-0">
                        {connector && (
                            <span className="text-brown-light text-xs font-medium select-none">
                                {connector} ›
                            </span>
                        )}
                        <Link
                            href={`/tribes/${tribeSlug}/persons/${person.id}`}
                            className={`
                                inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium
                                transition-all hover:shadow-md
                                ${person.gender === 'female'
                                    ? 'bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-200'
                                    : 'bg-white text-brown-dark hover:bg-gold-soft border border-gold/20'
                                }
                                ${index === 0 ? 'ring-2 ring-gold/30' : ''}
                            `}
                        >
                            {person.short_name_ar}
                            {person.title && (
                                <span className="text-[10px] opacity-70">
                                    ({person.title})
                                </span>
                            )}
                        </Link>
                    </div>
                );
            })}
        </div>
    );
}
