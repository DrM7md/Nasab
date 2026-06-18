import { useEffect, useRef, useState } from 'react';

export interface SearchOption {
    value: string | number;
    label: string;
    sublabel?: string;
}

interface Props {
    options: SearchOption[];
    value: string | number | null;
    onChange: (value: string | number | null) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    allowClear?: boolean;
    clearLabel?: string;
    variant?: 'light' | 'dark'; // dark = for GuestLayout
    disabled?: boolean;
}

/**
 * SearchableSelect — dropdown يتضمن مربع بحث داخلياً.
 * يعمل كـ controlled component. يغلق عند النقر خارجه.
 */
export default function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = '— اختر —',
    searchPlaceholder = 'ابحث...',
    emptyMessage = 'لا توجد نتائج',
    allowClear = false,
    clearLabel = '— بدون اختيار —',
    variant = 'light',
    disabled = false,
}: Props) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedOption = options.find((o) => o.value === value);

    const filtered = query.trim() === ''
        ? options
        : options.filter((o) =>
              o.label.toLowerCase().includes(query.toLowerCase())
              || o.sublabel?.toLowerCase().includes(query.toLowerCase())
          );

    useEffect(() => {
        if (open && inputRef.current) {
            inputRef.current.focus();
        }
        if (!open) {
            setQuery('');
            setActiveIndex(-1);
        }
    }, [open]);

    useEffect(() => {
        const onClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, []);

    const handleSelect = (option: SearchOption) => {
        onChange(option.value);
        setOpen(false);
    };

    const handleClear = () => {
        onChange(null);
        setOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === 'Enter' && activeIndex >= 0 && filtered[activeIndex]) {
            e.preventDefault();
            handleSelect(filtered[activeIndex]);
        } else if (e.key === 'Escape') {
            setOpen(false);
        }
    };

    const isDark = variant === 'dark';

    const triggerClass = isDark
        ? `w-full text-right px-4 py-2.5 rounded-xl border transition-all ${
            open ? 'border-gold-light bg-white/10' : 'border-gold-light/25 bg-white/5'
          } text-beige`
        : `w-full text-right px-4 py-2.5 rounded-xl border-2 transition-all ${
            open ? 'border-gold bg-white' : 'border-gold/20 bg-white'
          } text-brown-dark dark:bg-night-card dark:text-beige`;

    return (
        <div ref={containerRef} className="relative" dir="rtl">
            <button
                type="button"
                onClick={() => !disabled && setOpen(!open)}
                disabled={disabled}
                className={`${triggerClass} flex items-center justify-between gap-2 disabled:opacity-50`}
            >
                <span className={selectedOption ? '' : 'opacity-50'}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <svg
                    className={`w-4 h-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <div
                    className={`
                        absolute z-30 top-full right-0 left-0 mt-2 rounded-xl shadow-xl overflow-hidden
                        ${isDark
                            ? 'bg-[#1a1208] border border-gold-light/30'
                            : 'bg-white dark:bg-night-card border border-gold/20'
                        }
                    `}
                >
                    <div className={`p-2 border-b ${isDark ? 'border-gold-light/20' : 'border-gold/10'}`}>
                        <input
                            ref={inputRef}
                            type="search"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setActiveIndex(0);
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder={searchPlaceholder}
                            className={`
                                w-full px-3 py-2 rounded-lg text-sm transition-colors
                                ${isDark
                                    ? 'bg-white/5 border border-gold-light/20 text-beige placeholder:text-beige/40'
                                    : 'bg-beige/50 border border-gold/20 text-brown-dark'
                                }
                                focus:outline-none focus:border-gold-light
                            `}
                        />
                    </div>

                    <ul className="max-h-60 overflow-y-auto py-1">
                        {allowClear && (
                            <li>
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    className={`
                                        w-full text-right px-4 py-2 text-sm italic transition-colors
                                        ${isDark
                                            ? 'text-beige/60 hover:bg-white/5'
                                            : 'text-brown-light hover:bg-beige'
                                        }
                                    `}
                                >
                                    {clearLabel}
                                </button>
                            </li>
                        )}

                        {filtered.length === 0 ? (
                            <li className={`px-4 py-6 text-center text-sm ${isDark ? 'text-beige/50' : 'text-brown-light'}`}>
                                {emptyMessage}
                            </li>
                        ) : (
                            filtered.map((option, index) => (
                                <li key={option.value}>
                                    <button
                                        type="button"
                                        onClick={() => handleSelect(option)}
                                        onMouseEnter={() => setActiveIndex(index)}
                                        className={`
                                            w-full text-right px-4 py-2 text-sm transition-colors
                                            ${option.value === value
                                                ? (isDark ? 'bg-gold/30 text-gold-soft font-bold' : 'bg-gold-soft text-brown-dark font-bold')
                                                : activeIndex === index
                                                    ? (isDark ? 'bg-white/10 text-beige' : 'bg-beige text-brown-dark')
                                                    : (isDark ? 'text-beige hover:bg-white/5' : 'text-brown-dark hover:bg-beige')
                                            }
                                        `}
                                    >
                                        <div>{option.label}</div>
                                        {option.sublabel && (
                                            <div className={`text-xs mt-0.5 ${isDark ? 'text-beige/50' : 'text-brown-light'}`}>
                                                {option.sublabel}
                                            </div>
                                        )}
                                    </button>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
