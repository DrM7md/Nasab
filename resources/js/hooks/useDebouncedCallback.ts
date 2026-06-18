import { useEffect, useMemo, useRef } from 'react';

/**
 * useDebouncedCallback
 *
 * يُرجع نسخة مؤجلة من callback — لا تُنفَّذ إلا بعد مرور delay بدون استدعاء جديد.
 * يستخدم ref لتجنب إعادة إنشاء الـ debounce عند كل render.
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
    callback: T,
    delay: number,
): (...args: Parameters<T>) => void {
    const callbackRef = useRef(callback);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    return useMemo(() => {
        return (...args: Parameters<T>) => {
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
                callbackRef.current(...args);
            }, delay);
        };
    }, [delay]);
}
