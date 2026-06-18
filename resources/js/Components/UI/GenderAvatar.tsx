import type { Gender } from '@/types';

interface Props {
    gender: Gender;
    photo?: string | null;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    alt?: string;
}

const sizes: Record<NonNullable<Props['size']>, { box: string; svg: string }> = {
    sm: { box: 'w-10 h-10', svg: 'w-6 h-6' },
    md: { box: 'w-14 h-14', svg: 'w-8 h-8' },
    lg: { box: 'w-20 h-20', svg: 'w-12 h-12' },
    xl: { box: 'w-32 h-32', svg: 'w-20 h-20' },
};

export default function GenderAvatar({ gender, photo, size = 'md', alt }: Props) {
    const { box, svg } = sizes[size];

    if (photo) {
        return (
            <img
                src={photo}
                alt={alt ?? ''}
                className={`${box} rounded-full object-cover border-2 ${
                    gender === 'female' ? 'border-rose-300' : 'border-gold-light'
                }`}
            />
        );
    }

    // Silhouette — بدون ملامح، لون غامق موحّد
    const bgClass =
        gender === 'female'
            ? 'bg-gradient-to-br from-rose-200 to-rose-400'
            : 'bg-gradient-to-br from-gold-light to-gold';

    return (
        <div
            className={`${box} ${bgClass} rounded-full flex items-center justify-center shadow-md overflow-hidden`}
            aria-label={gender === 'female' ? 'أنثى' : 'ذكر'}
        >
            {gender === 'female' ? (
                <FemaleSilhouette className={`${svg} text-rose-900/70`} />
            ) : (
                <MaleSilhouette className={`${svg} text-brown-dark/70`} />
            )}
        </div>
    );
}

/**
 * Silhouette ذكر — رأس دائري + كتفان، بدون ملامح.
 */
function MaleSilhouette({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            className={className}
            fill="currentColor"
            aria-hidden="true"
        >
            {/* الرأس */}
            <circle cx="12" cy="7.5" r="4" />
            {/* الكتف والصدر — قوس محدّد */}
            <path d="M3 21.5c0-4.5 4.03-7.5 9-7.5s9 3 9 7.5v.5H3v-.5z" />
        </svg>
    );
}

/**
 * Silhouette أنثى — رأس + أكتاف مع حجاب (قوس إضافي يحيط الرأس).
 */
function FemaleSilhouette({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            className={className}
            fill="currentColor"
            aria-hidden="true"
        >
            {/* قوس الحجاب المحيط */}
            <path d="M12 1.5c-4.5 0-7 3.5-7 7v4c0 .5 .2 1 .5 1.3l2 1.7h9l2-1.7c.3-.3 .5-.8 .5-1.3v-4c0-3.5-2.5-7-7-7z" opacity="0.35" />
            {/* الوجه */}
            <circle cx="12" cy="8" r="3.2" />
            {/* الكتف والصدر */}
            <path d="M3 21.5c0-4.5 4.03-7.5 9-7.5s9 3 9 7.5v.5H3v-.5z" />
        </svg>
    );
}
