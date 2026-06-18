import RelativeCard, { type RelativeBrief } from './RelativeCard';
import { useMemo, useState } from 'react';

export interface ChildEntry extends RelativeBrief {
    mother_id: number | null;
    mother: RelativeBrief | null;
}

interface Props {
    children: ChildEntry[];
    tribeSlug: string;
}

/**
 * ChildrenGrid — شبكة الأبناء مع تصفية اختيارية بالأم.
 * لو فيه أم واحدة فقط، لا نُظهر الفلتر.
 */
export default function ChildrenGrid({ children, tribeSlug }: Props) {
    const [motherFilter, setMotherFilter] = useState<number | 'all'>('all');

    // قائمة الأمهات الفريدة
    const uniqueMothers = useMemo(() => {
        const map = new Map<number, RelativeBrief>();
        for (const c of children) {
            if (c.mother && !map.has(c.mother.id)) {
                map.set(c.mother.id, c.mother);
            }
        }
        return Array.from(map.values());
    }, [children]);

    const filtered = useMemo(() => {
        if (motherFilter === 'all') return children;
        return children.filter((c) => c.mother_id === motherFilter);
    }, [children, motherFilter]);

    if (children.length === 0) return null;

    const showFilter = uniqueMothers.length >= 2;

    return (
        <div className="space-y-4">
            {showFilter && (
                <div className="flex flex-wrap gap-2" dir="rtl">
                    <FilterChip
                        active={motherFilter === 'all'}
                        onClick={() => setMotherFilter('all')}
                    >
                        الكل ({children.length})
                    </FilterChip>

                    {uniqueMothers.map((m) => {
                        const count = children.filter((c) => c.mother_id === m.id).length;
                        return (
                            <FilterChip
                                key={m.id}
                                active={motherFilter === m.id}
                                onClick={() => setMotherFilter(m.id)}
                            >
                                من {m.short_name_ar} ({count})
                            </FilterChip>
                        );
                    })}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filtered.map((child) => (
                    <RelativeCard
                        key={child.id}
                        person={child}
                        tribeSlug={tribeSlug}
                    />
                ))}
            </div>
        </div>
    );
}

function FilterChip({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`
                px-3 py-1.5 rounded-full text-sm font-medium transition-all
                ${active
                    ? 'bg-gold text-white shadow-md'
                    : 'bg-white text-brown-mid border border-gold/20 hover:bg-gold-soft hover:text-brown-dark'
                }
            `}
        >
            {children}
        </button>
    );
}
