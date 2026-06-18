import { useTheme } from '@/hooks/useTheme';

interface Props {
    variant?: 'icon' | 'full';
    className?: string;
}

export default function ThemeToggle({ variant = 'icon', className = '' }: Props) {
    const { theme, toggle } = useTheme();
    const isDark = theme === 'dark';

    const label = isDark ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي';

    if (variant === 'full') {
        return (
            <button
                type="button"
                onClick={toggle}
                aria-label={label}
                title={label}
                className={`
                    inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all
                    bg-white/90 dark:bg-night-card/90 backdrop-blur-md
                    border border-gold/20 dark:border-gold/30
                    text-brown-dark dark:text-beige
                    shadow-md hover:shadow-lg
                    ${className}
                `}
            >
                {isDark ? <SunIcon /> : <MoonIcon />}
                <span>{isDark ? 'وضع نهاري' : 'وضع ليلي'}</span>
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={toggle}
            aria-label={label}
            title={label}
            className={`
                w-10 h-10 rounded-xl
                bg-white/90 dark:bg-night-card/90 backdrop-blur-md
                border border-gold/20 dark:border-gold/30
                text-brown-dark dark:text-gold-soft
                shadow-md hover:shadow-lg
                flex items-center justify-center
                transition-all hover:scale-105
                ${className}
            `}
        >
            {isDark ? <SunIcon /> : <MoonIcon />}
        </button>
    );
}

function SunIcon() {
    return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    );
}

function MoonIcon() {
    return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
    );
}
