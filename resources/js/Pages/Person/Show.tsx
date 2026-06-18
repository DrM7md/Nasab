import AddPersonModal from '@/Components/Person/AddPersonModal';
import ChildrenGrid, { type ChildEntry } from '@/Components/Person/ChildrenGrid';
import DeletePersonModal from '@/Components/Person/DeletePersonModal';
import EditPersonModal from '@/Components/Person/EditPersonModal';
import LineageChips, { type ChainPerson } from '@/Components/Person/LineageChips';
import MarriageList, { type MarriageItem } from '@/Components/Person/MarriageList';
import RelativeCard, { type RelativeBrief } from '@/Components/Person/RelativeCard';
import BackButton from '@/Components/UI/BackButton';
import { ButtonLink } from '@/Components/UI/Button';
import GenderAvatar from '@/Components/UI/GenderAvatar';
import {
    DocumentIcon,
    EditIcon,
    KinshipIcon,
    PlusIcon,
    TrashIcon,
    TreeNodesIcon,
    UsersIcon,
} from '@/Components/UI/Icons';
import ThemeToggle from '@/Components/UI/ThemeToggle';
import type { Gender, LifeStatus, PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useState } from 'react';

interface PersonFull {
    id: number;
    tribe_id: number;
    name_ar: string;
    name_en: string | null;
    short_name_ar: string;
    gender: Gender;
    title: string | null;
    birth_year: number | null;
    death_year: number | null;
    life_status: LifeStatus;
    birth_place: string | null;
    death_place: string | null;
    photo: string | null;
    bio_ar: string | null;
    status: string;
}

type ShowProps = PageProps<{
    person: PersonFull;
    father: RelativeBrief | null;
    mother: RelativeBrief | null;
    ancestorChain: ChainPerson[];
    formattedLineage: string;
    marriages: MarriageItem[];
    children: ChildEntry[];
    siblings: RelativeBrief[];
    fullSiblings: RelativeBrief[];
    currentSpouses?: RelativeBrief[];
    currentMotherId?: number | null;
    fatherWives?: RelativeBrief[];
}>;

export default function PersonShow({
    person,
    father,
    mother,
    ancestorChain,
    formattedLineage,
    marriages,
    children,
    siblings,
    fullSiblings,
    currentSpouses = [],
    currentMotherId = null,
    fatherWives = [],
    tribe,
    auth,
}: ShowProps) {
    const tribeSlug = tribe?.slug ?? '';
    const canEdit = auth.user?.can_edit ?? false;
    const canModerate = auth.user?.can_moderate ?? false;
    const [showAddChild, setShowAddChild] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);

    // الإخوة غير الأشقاء فقط (الإخوة من نفس الأب لكن ليسوا أشقاء)
    const fullSiblingIds = new Set(fullSiblings.map((s) => s.id));
    const halfSiblings = siblings.filter((s) => !fullSiblingIds.has(s.id));

    const isLiving = person.life_status === 'living';
    const isDeceased = person.life_status === 'deceased';
    const accentColor = person.gender === 'female' ? 'rose' : 'gold';

    return (
        <>
            <Head title={person.name_ar} />

            <div className="landing-bg page-enter min-h-screen">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                    <div className="flex items-center justify-between mb-0">
                        <BackButton href={`/tribes/${tribeSlug}/tree`} label="العودة للشجرة" />
                        <ThemeToggle />
                    </div>

                    {/* ═════════ Header ═════════ */}
                    <section
                        className={`
                            relative rounded-3xl p-6 sm:p-8 mb-6 border shadow-sm
                            ${person.gender === 'female'
                                ? 'bg-gradient-to-br from-rose-50 to-white dark:from-rose-950/30 dark:to-night-card border-rose-200 dark:border-rose-800/40'
                                : 'bg-gradient-to-br from-white to-beige dark:from-night-card dark:to-night-bg border-gold/20 dark:border-gold/30'
                            }
                        `}
                    >
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                            <GenderAvatar
                                gender={person.gender}
                                photo={person.photo}
                                size="xl"
                                alt={person.name_ar}
                            />

                            <div className="flex-1 text-center sm:text-right">
                                {person.title && (
                                    <div
                                        className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-2 ${
                                            accentColor === 'rose'
                                                ? 'bg-rose-100 text-rose-700'
                                                : 'bg-gold-soft text-brown-dark'
                                        }`}
                                    >
                                        {person.title}
                                    </div>
                                )}

                                <h1 className="font-amiri text-2xl sm:text-4xl font-bold text-brown-dark mb-1">
                                    {person.short_name_ar}
                                </h1>

                                <p className="text-brown-mid text-sm sm:text-base mb-3">
                                    {formattedLineage}
                                </p>

                                <div className="flex flex-wrap gap-4 justify-center sm:justify-start text-sm text-brown-mid">
                                    {person.birth_year && (
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-brown-light">الميلاد:</span>
                                            <span className="font-mono font-bold text-brown-dark">
                                                {person.birth_year}
                                            </span>
                                            {person.birth_place && (
                                                <span className="text-brown-light">({person.birth_place})</span>
                                            )}
                                        </div>
                                    )}

                                    {person.death_year && (
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-brown-light">الوفاة:</span>
                                            <span className="font-mono font-bold text-brown-dark">
                                                {person.death_year}
                                            </span>
                                            {person.death_place && (
                                                <span className="text-brown-light">({person.death_place})</span>
                                            )}
                                        </div>
                                    )}

                                    {isLiving && (
                                        <div className="inline-flex items-center gap-1.5 text-emerald-700">
                                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                            <span className="text-xs font-bold">على قيد الحياة</span>
                                        </div>
                                    )}

                                    {isDeceased && !person.death_year && (
                                        <div className="inline-flex items-center gap-1.5 text-brown-mid">
                                            <span className="w-2 h-2 bg-brown-mid rounded-full" />
                                            <span className="text-xs font-medium">رحمه الله</span>
                                        </div>
                                    )}
                                </div>

                                {person.bio_ar && (
                                    <p className="mt-4 text-brown-dark text-sm leading-relaxed">
                                        {person.bio_ar}
                                    </p>
                                )}

                                <div className="mt-5 flex flex-wrap gap-2">
                                    <ButtonLink
                                        href={`/tribes/${tribeSlug}/certificate/${person.id}`}
                                        size="sm"
                                        icon={<DocumentIcon className="w-4 h-4" />}
                                    >
                                        عرض وثيقة النسب
                                    </ButtonLink>

                                    {canEdit && (
                                        <button
                                            type="button"
                                            onClick={() => setShowAddChild(true)}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-night-card text-brown-dark border border-gold/30 rounded-xl font-medium text-sm hover:bg-gold-soft transition-all"
                                        >
                                            <PlusIcon className="w-4 h-4" />
                                            <span>إضافة ابن/ابنة</span>
                                        </button>
                                    )}

                                    {canModerate && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => setShowEdit(true)}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-night-card text-brown-dark border border-gold/30 rounded-xl font-medium text-sm hover:bg-gold-soft transition-all"
                                                title="تعديل بيانات الشخص"
                                            >
                                                <EditIcon className="w-4 h-4" />
                                                <span>تعديل</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setShowDelete(true)}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-night-card text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 rounded-xl font-medium text-sm hover:bg-rose-50 transition-all"
                                                title="حذف الشخص"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                                <span>حذف</span>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    {canEdit && (
                        <AddPersonModal
                            isOpen={showAddChild}
                            onClose={() => setShowAddChild(false)}
                            tribeSlug={tribeSlug}
                            knownParent={{
                                id: person.id,
                                short_name_ar: person.short_name_ar,
                                gender: person.gender,
                                lineage: formattedLineage,
                                // تمرير زوجات الأب لتسهيل اختيار أم الابن
                                wives: person.gender === 'male'
                                    ? marriages
                                        .filter((m) => m.spouse)
                                        .map((m) => ({
                                            id: m.spouse!.id,
                                            short_name_ar: m.spouse!.short_name_ar,
                                            name_ar: m.spouse!.name_ar ?? m.spouse!.short_name_ar,
                                            gender: 'female' as const,
                                            title: m.spouse!.title ?? null,
                                            birth_year: m.spouse!.birth_year ?? null,
                                            death_year: m.spouse!.death_year ?? null,
                                            photo: m.spouse!.photo ?? null,
                                        }))
                                    : undefined,
                            }}
                        />
                    )}

                    {canModerate && (
                        <>
                            <EditPersonModal
                                isOpen={showEdit}
                                onClose={() => setShowEdit(false)}
                                tribeSlug={tribeSlug}
                                person={person}
                                currentSpouses={currentSpouses.map((s) => ({
                                    id: s.id,
                                    name_ar: s.name_ar,
                                    short_name_ar: s.short_name_ar,
                                    gender: s.gender,
                                    title: s.title ?? null,
                                    birth_year: s.birth_year ?? null,
                                    death_year: s.death_year ?? null,
                                    photo: s.photo ?? null,
                                }))}
                                currentMotherId={currentMotherId}
                                fatherWives={fatherWives.map((w) => ({
                                    id: w.id,
                                    name_ar: w.name_ar,
                                    short_name_ar: w.short_name_ar,
                                    gender: w.gender,
                                    title: w.title ?? null,
                                    birth_year: w.birth_year ?? null,
                                    death_year: w.death_year ?? null,
                                    photo: w.photo ?? null,
                                }))}
                                hasFather={father !== null}
                            />
                            <DeletePersonModal
                                isOpen={showDelete}
                                onClose={() => setShowDelete(false)}
                                tribeSlug={tribeSlug}
                                person={{ id: person.id, short_name_ar: person.short_name_ar }}
                                childrenCount={children.length}
                            />
                        </>
                    )}

                    {/* ═════════ سلسلة النسب ═════════ */}
                    {ancestorChain.length > 1 && (
                        <Section title="سلسلة النسب" icon={<TreeNodesIcon />}>
                            <LineageChips chain={ancestorChain} tribeSlug={tribeSlug} />
                        </Section>
                    )}

                    {/* ═════════ الوالدان ═════════ */}
                    {(father || mother) && (
                        <Section title="الوالدان" icon={<UsersIcon />}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {father && (
                                    <RelativeCard
                                        person={father}
                                        tribeSlug={tribeSlug}
                                        badge="الأب"
                                    />
                                )}
                                {mother && (
                                    <RelativeCard
                                        person={mother}
                                        tribeSlug={tribeSlug}
                                        badge="الأم"
                                    />
                                )}
                            </div>
                        </Section>
                    )}

                    {/* ═════════ الزيجات ═════════ */}
                    {marriages.length > 0 && (
                        <Section
                            title={person.gender === 'male' ? 'الزوجات' : 'الزوج'}
                            icon={<KinshipIcon />}
                        >
                            <MarriageList
                                marriages={marriages}
                                tribeSlug={tribeSlug}
                                personGender={person.gender}
                            />
                        </Section>
                    )}

                    {/* ═════════ الأبناء ═════════ */}
                    {children.length > 0 && (
                        <Section title={`الأبناء (${children.length})`} icon={<UsersIcon />}>
                            <ChildrenGrid children={children} tribeSlug={tribeSlug} />
                        </Section>
                    )}

                    {/* ═════════ الإخوة الأشقاء ═════════ */}
                    {fullSiblings.length > 0 && (
                        <Section
                            title={`الإخوة الأشقاء (${fullSiblings.length})`}
                            icon={<UsersIcon />}
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {fullSiblings.map((s) => (
                                    <RelativeCard key={s.id} person={s} tribeSlug={tribeSlug} />
                                ))}
                            </div>
                        </Section>
                    )}

                    {/* ═════════ الإخوة (من الأب فقط) ═════════ */}
                    {halfSiblings.length > 0 && (
                        <Section
                            title={`إخوة من الأب (${halfSiblings.length})`}
                            icon={<UsersIcon />}
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {halfSiblings.map((s) => (
                                    <RelativeCard key={s.id} person={s} tribeSlug={tribeSlug} />
                                ))}
                            </div>
                        </Section>
                    )}
                </div>
            </div>
        </>
    );
}

function Section({
    title,
    icon,
    children,
}: {
    readonly title: string;
    readonly icon: ReactNode;
    readonly children: ReactNode;
}) {
    return (
        <section className="mb-8">
            <h2 className="flex items-center gap-2.5 text-lg sm:text-xl font-bold text-brown-dark mb-4">
                <span className="text-gold inline-flex [&>svg]:w-6 [&>svg]:h-6">{icon}</span>
                <span>{title}</span>
                <span className="flex-1 h-px bg-gradient-to-l from-gold/30 to-transparent ms-2" />
            </h2>
            {children}
        </section>
    );
}
