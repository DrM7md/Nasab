import GenderAvatar from '@/Components/UI/GenderAvatar';
import type { Gender } from '@/types';
import { Link } from '@inertiajs/react';

export interface KinshipResponse {
    person_a: KinshipPerson;
    person_b: KinshipPerson;
    relation_label: string;
    depth_a: number;
    depth_b: number;
    common_ancestor: {
        id: number;
        short_name_ar: string;
        title: string | null;
    } | null;
}

interface KinshipPerson {
    id: number;
    short_name_ar: string;
    gender: Gender;
    title: string | null;
    photo: string | null;
    lineage: string;
}

interface Props {
    result: KinshipResponse;
    tribeSlug: string;
}

/**
 * KinshipResult
 *
 * يعرض صلة القرابة بشكل مرئي:
 *   [شخص A]    هو ←relation→    [شخص B]
 *            ↑ الجد المشترك ↑
 */
export default function KinshipResult({ result, tribeSlug }: Props) {
    const { person_a, person_b, relation_label, common_ancestor, depth_a, depth_b } = result;
    const hasRelation = common_ancestor !== null;

    return (
        <div className="space-y-6">
            {/* ═════════ العنوان النصي ═════════ */}
            <div
                className={`
                    text-center p-6 rounded-3xl border-2 shadow-lg
                    ${hasRelation
                        ? 'bg-gradient-to-br from-gold-soft to-white border-gold'
                        : 'bg-gradient-to-br from-rose-50 to-white border-rose-200'
                    }
                `}
            >
                <div className="text-brown-light text-xs mb-1">الصلة</div>
                <div className="text-2xl sm:text-3xl font-bold text-brown-dark">
                    {person_a.short_name_ar}
                    <span className="text-gold mx-3 text-xl">•</span>
                    <span className="text-gold">{relation_label}</span>
                    <span className="text-gold mx-3 text-xl">•</span>
                    {person_b.short_name_ar}
                </div>

                {hasRelation && common_ancestor && (
                    <div className="mt-4 text-sm text-brown-mid">
                        الجد المشترك:{' '}
                        <Link
                            href={`/tribes/${tribeSlug}/persons/${common_ancestor.id}`}
                            className="font-bold text-gold hover:text-gold-light underline underline-offset-2"
                        >
                            {common_ancestor.short_name_ar}
                        </Link>
                        {common_ancestor.title && (
                            <span className="text-brown-light text-xs mr-2">
                                ({common_ancestor.title})
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* ═════════ البطاقات + الفجوة ═════════ */}
            {hasRelation && (
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
                    <KinshipPersonCard
                        person={person_a}
                        tribeSlug={tribeSlug}
                        depthLabel={depth_a}
                    />

                    <div className="flex md:flex-col items-center justify-center gap-2 py-2">
                        <div className="h-px md:h-12 w-12 md:w-px bg-gradient-to-r md:bg-gradient-to-b from-gold to-transparent" />
                        <div className="text-gold font-bold text-2xl">⚭</div>
                        <div className="h-px md:h-12 w-12 md:w-px bg-gradient-to-r md:bg-gradient-to-b from-transparent to-gold" />
                    </div>

                    <KinshipPersonCard
                        person={person_b}
                        tribeSlug={tribeSlug}
                        depthLabel={depth_b}
                    />
                </div>
            )}
        </div>
    );
}

function KinshipPersonCard({
    person,
    tribeSlug,
    depthLabel,
}: {
    person: KinshipPerson;
    tribeSlug: string;
    depthLabel: number;
}) {
    return (
        <Link
            href={`/tribes/${tribeSlug}/persons/${person.id}`}
            className={`
                block p-4 rounded-2xl border-2 bg-white transition-all hover:shadow-lg hover:-translate-y-0.5
                ${person.gender === 'female'
                    ? 'border-rose-200 hover:border-rose-400'
                    : 'border-gold/20 hover:border-gold-light'
                }
            `}
        >
            <div className="flex items-center gap-3 mb-3">
                <GenderAvatar gender={person.gender} photo={person.photo} size="lg" />
                <div className="flex-1 min-w-0">
                    <div className="text-brown-dark font-bold text-lg truncate">
                        {person.short_name_ar}
                    </div>
                    {person.title && (
                        <div
                            className={`text-xs font-medium ${
                                person.gender === 'female' ? 'text-rose-600' : 'text-gold'
                            }`}
                        >
                            {person.title}
                        </div>
                    )}
                </div>
            </div>

            <div className="text-brown-mid text-xs leading-relaxed bg-beige-dark/40 rounded-xl p-2 font-medium text-right" dir="rtl">
                {person.lineage}
            </div>

            {depthLabel > 0 && (
                <div className="mt-2 text-[10px] text-brown-light text-center">
                    على بُعد {depthLabel} {depthLabel === 1 ? 'جيل' : 'أجيال'} من الجد المشترك
                </div>
            )}
        </Link>
    );
}
