import type { ReactNode } from 'react';

/**
 * Card — سطح موحّد بنمط «الجذر»: خلفية بيضاء/ليلية، حدّ ذهبي خفيف، زوايا ناعمة.
 * مرّر hover للحصول على رفع لطيف (ns-card)، وreveal لكشف عند التمرير.
 */
export default function Card({
    children,
    className = '',
    hover = false,
    reveal = false,
    as = 'div',
}: {
    readonly children: ReactNode;
    readonly className?: string;
    readonly hover?: boolean;
    readonly reveal?: boolean;
    readonly as?: 'div' | 'section' | 'article';
}) {
    const Tag = as;
    return (
        <Tag
            className={`bg-white dark:bg-night-card border border-gold/15 rounded-2xl shadow-sm ${
                hover ? 'ns-card' : ''
            } ${reveal ? 'ns-reveal' : ''} ${className}`}
        >
            {children}
        </Tag>
    );
}
