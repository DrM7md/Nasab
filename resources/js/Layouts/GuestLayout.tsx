import { NunLogo } from '@/Components/UI/Icons';
import ThemeToggle from '@/Components/UI/ThemeToggle';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

/**
 * GuestLayout — قشرة صفحات الضيوف (Login / Register / Password) بنمط «الجذر».
 * خلفية كريمية + كوكبة باهتة منجرفة + بطاقة بيضاء بحدّ ذهبي.
 */
export default function GuestLayout({ children }: PropsWithChildren) {
    return (
        <div
            className="landing-bg page-enter min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden text-brown-dark"
            dir="rtl"
        >
            {/* كوكبة خلفية باهتة */}
            <svg
                viewBox="0 0 1200 800"
                preserveAspectRatio="xMidYMid slice"
                className="absolute inset-0 w-full h-full opacity-[0.35] pointer-events-none"
                style={{ animation: 'nsDrift 18s ease-in-out infinite' }}
                aria-hidden="true"
            >
                <g stroke="#C9A84C" strokeWidth={1} fill="none" opacity={0.3}>
                    <path d="M120 120 L300 220 L220 400 M300 220 L520 160 M980 160 L1100 320 M1100 320 L1000 520 M980 160 L860 80" />
                </g>
                {([[120, 120, 2.5, 4, 0], [300, 220, 3, 3.4, 0.6], [520, 160, 2.5, 4.4, 0.3], [980, 160, 3, 3.8, 0.9], [1100, 320, 2.5, 3.2, 1.5], [860, 80, 2.5, 3.6, 1.1]] as Array<[number, number, number, number, number]>).map(
                    ([cx, cy, r, dur, delay]) => (
                        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill="#C9A84C" style={{ animation: `nsTwinkle ${dur}s ease-in-out ${delay}s infinite` }} />
                    ),
                )}
            </svg>

            <div className="absolute top-4 left-4 z-10">
                <ThemeToggle />
            </div>

            {/* الشعار */}
            <Link href="/" className="relative mb-6 text-center group" style={{ animation: 'nsFadeUp .6s ease-out both' }}>
                <div className="inline-flex items-center gap-3">
                    <NunLogo className="w-14 h-14 text-3xl group-hover:scale-105 transition-transform" />
                    <div className="text-right">
                        <div className="font-amiri text-[26px] font-bold text-brown-dark">نَسَب</div>
                        <div className="text-brown-light text-xs">منصّة توثيق الأنساب القبلية</div>
                    </div>
                </div>
            </Link>

            {/* البطاقة */}
            <div
                className="relative w-full max-w-md bg-white dark:bg-night-card border border-gold/20 rounded-3xl shadow-[0_22px_50px_rgba(60,43,31,0.12)] p-8 sm:p-10"
                style={{ animation: 'nsFadeUp .7s ease-out .12s both' }}
            >
                {children}
            </div>

            <p className="relative mt-6 text-brown-light text-xs">© 2026 — جميع الحقوق محفوظة</p>
        </div>
    );
}
