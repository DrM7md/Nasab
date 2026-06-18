import GenderAvatar from '@/Components/UI/GenderAvatar';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import type { Gender } from '@/types';
import { useEffect, useId, useRef, useState } from 'react';

export interface PersonSuggestion {
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
    tribeSlug: string;
    placeholder?: string;
    selected?: PersonSuggestion | null;
    onSelect: (person: PersonSuggestion) => void;
    onClear?: () => void;
    /** يُستدعى عند ضغط "إنشاء جديد" — يُمرَّر له النص المكتوب */
    onCreateNew?: (name: string) => void;
    /** نص زر الإنشاء (مثلاً "إنشاء زوجة جديدة") */
    createLabel?: string;
}

/**
 * PersonSearchBox — حقل بحث مع autocomplete
 *  - debounce 300ms على الطباعة
 *  - عرض أول 8 نتائج
 *  - اختيار بالضغط أو Enter
 *  - مسح بزر X
 *  - زر "إنشاء جديد" اختياري عبر onCreateNew
 */
export default function PersonSearchBox({
    tribeSlug,
    placeholder = 'ابحث عن شخص...',
    selected,
    onSelect,
    onClear,
    onCreateNew,
    createLabel = 'إنشاء جديد',
}: Props) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<PersonSuggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const containerRef = useRef<HTMLDivElement>(null);
    const inputId = useId();

    const fetchSuggestions = useDebouncedCallback((...args: unknown[]) => {
        const q = args[0] as string;
        if (q.length < 2) {
            setResults([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        fetch(`/tribes/${tribeSlug}/search/suggest?q=${encodeURIComponent(q)}`, {
            headers: { Accept: 'application/json' },
        })
            .then((r) => r.json())
            .then((data: { results: PersonSuggestion[] }) => {
                setResults(data.results);
                setActiveIndex(-1);
            })
            .catch(() => setResults([]))
            .finally(() => setLoading(false));
    }, 300);

    useEffect(() => {
        if (!selected) fetchSuggestions(query);
    }, [query, selected, fetchSuggestions]);

    // إغلاق القائمة عند النقر خارجها
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleSelect = (person: PersonSuggestion) => {
        onSelect(person);
        setQuery('');
        setResults([]);
        setOpen(false);
    };

    const handleClear = () => {
        setQuery('');
        setResults([]);
        onClear?.();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!open || results.length === 0) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === 'Enter' && activeIndex >= 0) {
            e.preventDefault();
            handleSelect(results[activeIndex]);
        } else if (e.key === 'Escape') {
            setOpen(false);
        }
    };

    /* ═════════ عرض الشخص المختار ═════════ */
    if (selected) {
        return (
            <div
                className={`
                    flex items-center gap-3 p-3 rounded-2xl border-2 shadow-sm
                    ${selected.gender === 'female'
                        ? 'bg-rose-50 border-rose-200'
                        : 'bg-white border-gold/30'
                    }
                `}
            >
                <GenderAvatar
                    gender={selected.gender}
                    photo={selected.photo}
                    size="md"
                    alt={selected.short_name_ar}
                />
                <div className="flex-1 min-w-0">
                    <div className="text-brown-dark font-bold truncate">
                        {selected.short_name_ar}
                    </div>
                    <div className="text-brown-light text-xs truncate">
                        {selected.name_ar}
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleClear}
                    className="w-8 h-8 rounded-full bg-brown-dark/5 hover:bg-brown-dark/10 text-brown-mid flex items-center justify-center transition-colors"
                    aria-label="مسح الاختيار"
                >
                    ✕
                </button>
            </div>
        );
    }

    /* ═════════ حقل البحث ═════════ */
    return (
        <div ref={containerRef} className="relative" dir="rtl">
            <div className="relative">
                <input
                    id={inputId}
                    type="search"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="w-full pr-12 pl-4 py-3 rounded-2xl bg-white border-2 border-gold/20 focus:border-gold focus:outline-none text-brown-dark placeholder:text-brown-light/60 shadow-sm transition-all"
                />
                <div className="absolute top-1/2 right-4 -translate-y-1/2 text-brown-light pointer-events-none">
                    {loading ? (
                        <span className="inline-block w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    )}
                </div>
            </div>

            {open && (results.length > 0 || (query.length >= 2 && !loading)) && (
                <div className="absolute z-20 top-full right-0 left-0 mt-2 bg-white rounded-2xl shadow-xl border border-gold/20 overflow-hidden max-h-96 overflow-y-auto">
                    {results.length > 0 && (
                        <ul>
                            {results.map((p, index) => (
                                <li key={p.id}>
                                    <button
                                        type="button"
                                        onClick={() => handleSelect(p)}
                                        onMouseEnter={() => setActiveIndex(index)}
                                        className={`
                                            w-full flex items-center gap-3 p-3 text-right transition-colors
                                            ${activeIndex === index ? 'bg-gold-soft' : 'hover:bg-beige'}
                                            border-b border-gold/10
                                        `}
                                    >
                                        <GenderAvatar
                                            gender={p.gender}
                                            photo={p.photo}
                                            size="sm"
                                            alt={p.short_name_ar}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-brown-dark font-medium truncate">
                                                {p.short_name_ar}
                                                {p.title && (
                                                    <span className="text-gold text-xs mr-2">
                                                        ({p.title})
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-brown-light text-xs truncate">
                                                {p.name_ar}
                                            </div>
                                        </div>
                                        {p.birth_year && (
                                            <div className="text-brown-light text-[10px] font-mono shrink-0">
                                                {p.birth_year}
                                                {p.death_year && `—${p.death_year}`}
                                            </div>
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* لا نتائج */}
                    {results.length === 0 && query.length >= 2 && !loading && (
                        <div className="px-4 py-3 text-center text-brown-light text-sm">
                            لا توجد نتائج لـ "{query}"
                        </div>
                    )}

                    {/* زر إنشاء جديد — يظهر دائماً عند توفر onCreateNew وكتابة شيء */}
                    {onCreateNew && query.trim().length >= 2 && (
                        <button
                            type="button"
                            onClick={() => {
                                onCreateNew(query.trim());
                                setOpen(false);
                                setQuery('');
                            }}
                            className="w-full flex items-center justify-center gap-2 p-3 bg-gold-soft/50 hover:bg-gold-soft text-brown-dark font-medium text-sm border-t border-gold/20 transition-colors"
                        >
                            <span>➕</span>
                            <span>{createLabel} «{query.trim()}»</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
