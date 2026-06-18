import { useEffect, useRef, useState } from 'react';

/**
 * AnimatedNumber — رقم يتصاعد عند ظهوره (IntersectionObserver + rAF).
 * أرقام إنجليزية بفواصل. يحترم prefers-reduced-motion.
 */
export default function AnimatedNumber({
    value,
    className = '',
    duration = 1500,
}: {
    readonly value: number;
    readonly className?: string;
    readonly duration?: number;
}) {
    const ref = useRef<HTMLSpanElement>(null);
    const [display, setDisplay] = useState('0');

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

        const reduce = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        if (reduce) {
            setDisplay(fmt(value));
            return;
        }

        const run = () => {
            const start = performance.now();
            const step = (now: number) => {
                const t = Math.min(1, (now - start) / duration);
                const eased = 1 - Math.pow(1 - t, 3);
                setDisplay(fmt(value * eased));
                if (t < 1) requestAnimationFrame(step);
                else setDisplay(fmt(value));
            };
            requestAnimationFrame(step);
        };

        if (!('IntersectionObserver' in globalThis)) {
            run();
            return;
        }

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        run();
                        io.disconnect();
                    }
                });
            },
            { threshold: 0.5 },
        );
        io.observe(el);
        return () => io.disconnect();
    }, [value, duration]);

    return (
        <span ref={ref} className={className}>
            {display}
        </span>
    );
}
