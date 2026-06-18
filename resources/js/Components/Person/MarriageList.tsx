import RelativeCard, { type RelativeBrief } from './RelativeCard';

export interface MarriageItem {
    id: number;
    marriage_order: number;
    marriage_year?: number | null;
    divorce_year?: number | null;
    is_current: boolean;
    spouse: RelativeBrief | null;
}

interface Props {
    marriages: MarriageItem[];
    tribeSlug: string;
    personGender: 'male' | 'female';
}

const ORDER_AR: Record<number, string> = {
    1: 'الأولى',
    2: 'الثانية',
    3: 'الثالثة',
    4: 'الرابعة',
};

export default function MarriageList({ marriages, tribeSlug, personGender }: Props) {
    if (marriages.length === 0) return null;

    const spouseLabel = personGender === 'male' ? 'الزوجة' : 'الزوج';

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {marriages
                .slice()
                .sort((a, b) => a.marriage_order - b.marriage_order)
                .map((m) => {
                    if (!m.spouse) return null;

                    const orderLabel = ORDER_AR[m.marriage_order] ?? `${m.marriage_order}`;
                    const badge = personGender === 'male'
                        ? `${spouseLabel} ${orderLabel}`
                        : spouseLabel;

                    return (
                        <div key={m.id} className="space-y-2">
                            <RelativeCard
                                person={m.spouse}
                                tribeSlug={tribeSlug}
                                badge={badge}
                            />
                            {(m.marriage_year || !m.is_current) && (
                                <div className="text-[11px] text-brown-light px-2 flex gap-3 font-mono">
                                    {m.marriage_year && <span>زواج: {m.marriage_year}</span>}
                                    {m.divorce_year && <span className="text-rose-500">طلاق: {m.divorce_year}</span>}
                                    {!m.is_current && !m.divorce_year && (
                                        <span className="text-brown-light">(سابقة)</span>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
        </div>
    );
}
