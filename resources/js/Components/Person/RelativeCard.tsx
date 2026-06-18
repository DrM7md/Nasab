import GenderAvatar from '@/Components/UI/GenderAvatar';
import type { Gender } from '@/types';
import { Link } from '@inertiajs/react';

export interface RelativeBrief {
    id: number;
    name_ar: string;
    short_name_ar: string;
    gender: Gender;
    title?: string | null;
    birth_year?: number | null;
    death_year?: number | null;
    photo?: string | null;
}

interface Props {
    person: RelativeBrief;
    tribeSlug: string;
    badge?: string; // مثال: "الأب" / "الأم" / "الزوجة الأولى"
}

export default function RelativeCard({ person, tribeSlug, badge }: Props) {
    const yearRange = person.birth_year
        ? `${person.birth_year}${person.death_year ? ` — ${person.death_year}` : ''}`
        : '';

    return (
        <Link
            href={`/tribes/${tribeSlug}/persons/${person.id}`}
            className={`
                group relative block p-4 rounded-2xl border-2 transition-all duration-200
                hover:shadow-lg hover:-translate-y-0.5
                ${person.gender === 'female'
                    ? 'bg-rose-50/50 border-rose-200 hover:border-rose-400'
                    : 'bg-white border-gold/20 hover:border-gold-light'
                }
            `}
        >
            {badge && (
                <div
                    className={`
                        absolute -top-2 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold
                        ${person.gender === 'female'
                            ? 'bg-rose-500 text-white'
                            : 'bg-gold text-white'
                        }
                    `}
                >
                    {badge}
                </div>
            )}

            <div className="flex items-center gap-3">
                <GenderAvatar
                    gender={person.gender}
                    photo={person.photo}
                    size="md"
                    alt={person.short_name_ar}
                />
                <div className="flex-1 min-w-0">
                    <div className="text-brown-dark font-bold text-sm truncate">
                        {person.short_name_ar}
                    </div>
                    {person.title && (
                        <div
                            className={`text-[11px] mt-0.5 font-medium ${
                                person.gender === 'female'
                                    ? 'text-rose-600'
                                    : 'text-gold'
                            }`}
                        >
                            {person.title}
                        </div>
                    )}
                    {yearRange && (
                        <div className="text-brown-light text-[10px] mt-0.5 font-mono">
                            {yearRange}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
