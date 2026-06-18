import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';
type ResolvedTheme = Theme;

const STORAGE_KEY = 'nasab-theme';

/**
 * يُرجع الـ theme الحالي المطبّق على <html>.
 * لا نستخدم 'system' للتبسيط — المستخدم يختار صراحةً.
 */
function readStoredTheme(): ResolvedTheme {
    if (typeof globalThis === 'undefined' || typeof document === 'undefined') {
        return 'light';
    }
    const stored = globalThis.localStorage?.getItem(STORAGE_KEY) as Theme | null;
    if (stored === 'dark' || stored === 'light') return stored;

    // fallback: تفضيل النظام
    return globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
}

function applyTheme(theme: ResolvedTheme): void {
    const root = document.documentElement;
    if (theme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
    root.style.colorScheme = theme;
}

export function useTheme() {
    const [theme, setThemeState] = useState<ResolvedTheme>(() => readStoredTheme());

    const setTheme = useCallback((next: Theme) => {
        setThemeState(next);
        globalThis.localStorage?.setItem(STORAGE_KEY, next);
        applyTheme(next);
    }, []);

    const toggle = useCallback(() => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    }, [theme, setTheme]);

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    return { theme, setTheme, toggle };
}
