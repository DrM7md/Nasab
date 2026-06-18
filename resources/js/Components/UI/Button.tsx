import { Link } from '@inertiajs/react';
import type { ComponentProps, ReactNode } from 'react';

type Variant = 'primary' | 'ghost' | 'soft' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
    primary:
        'ns-btn bg-gold text-white shadow-[0_8px_22px_rgba(139,105,20,0.28)] hover:shadow-[0_16px_34px_rgba(139,105,20,0.42)] hover:bg-[#79540f]',
    ghost: 'bg-white dark:bg-night-card text-brown-mid border border-gold/20 hover:border-gold/40 hover:bg-beige transition-colors',
    soft: 'bg-gold-soft/60 text-brown-dark border border-gold/20 hover:bg-gold-soft transition-colors',
    danger: 'bg-rose-600 text-white shadow-md hover:bg-rose-700 transition-colors',
};

const SIZES: Record<Size, string> = {
    sm: 'text-[13px] px-3.5 py-2 rounded-lg gap-1.5',
    md: 'text-[14.5px] px-5 py-2.5 rounded-xl gap-2',
    lg: 'text-[15px] px-[30px] py-3.5 rounded-xl gap-2.5',
};

function classes(variant: Variant, size: Size, className: string) {
    return `inline-flex items-center justify-center font-semibold ${VARIANTS[variant]} ${SIZES[size]} disabled:opacity-50 disabled:pointer-events-none ${className}`;
}

interface CommonProps {
    readonly variant?: Variant;
    readonly size?: Size;
    readonly icon?: ReactNode;
    readonly className?: string;
    readonly children?: ReactNode;
}

/** زر إجراء (button) */
export function Button({
    variant = 'primary',
    size = 'md',
    icon,
    className = '',
    children,
    ...rest
}: CommonProps & Omit<ComponentProps<'button'>, 'className'>) {
    return (
        <button className={classes(variant, size, className)} {...rest}>
            {icon && <span className="relative z-10 inline-flex">{icon}</span>}
            <span className="relative z-10">{children}</span>
        </button>
    );
}

/** زر-رابط Inertia (Link) */
export function ButtonLink({
    variant = 'primary',
    size = 'md',
    icon,
    className = '',
    children,
    ...rest
}: CommonProps & Omit<ComponentProps<typeof Link>, 'className' | 'size'>) {
    return (
        <Link className={classes(variant, size, className)} {...rest}>
            {icon && <span className="relative z-10 inline-flex">{icon}</span>}
            <span className="relative z-10">{children}</span>
        </Link>
    );
}
