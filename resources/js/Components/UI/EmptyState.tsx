import type { ReactNode } from 'react';

/** حالة فارغة موحّدة: أيقونة كبيرة + عنوان + وصف + إجراء اختياري. */
export default function EmptyState({
    icon,
    title,
    description,
    action,
    className = '',
}: {
    readonly icon: ReactNode;
    readonly title: string;
    readonly description?: string;
    readonly action?: ReactNode;
    readonly className?: string;
}) {
    return (
        <div className={`text-center py-14 px-6 ${className}`}>
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gold-soft/40 border border-gold/20 text-gold flex items-center justify-center mb-4 [&>svg]:w-8 [&>svg]:h-8">
                {icon}
            </div>
            <h3 className="font-amiri font-bold text-brown-dark text-xl mb-1.5">{title}</h3>
            {description && (
                <p className="text-brown-light text-sm max-w-md mx-auto leading-relaxed">
                    {description}
                </p>
            )}
            {action && <div className="mt-6 flex justify-center">{action}</div>}
        </div>
    );
}
