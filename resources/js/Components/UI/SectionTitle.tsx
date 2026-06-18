import type { ReactNode } from 'react';

/** عنوان قسم داخلي موحّد: أيقونة ذهبية + نص. */
export default function SectionTitle({
    icon,
    children,
    className = '',
}: {
    readonly icon?: ReactNode;
    readonly children: ReactNode;
    readonly className?: string;
}) {
    return (
        <h2 className={`flex items-center gap-2.5 text-lg font-bold text-brown-dark ${className}`}>
            {icon && <span className="text-gold inline-flex">{icon}</span>}
            <span>{children}</span>
        </h2>
    );
}
