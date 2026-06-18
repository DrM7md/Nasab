import type { ReactNode } from 'react';

/**
 * PageHeader — ترويسة صفحة موحّدة: عنوان بخط Amiri + وصف + إجراءات على اليسار.
 * يُمرَّر إلى prop الـ header في AuthenticatedLayout.
 */
export default function PageHeader({
    title,
    subtitle,
    icon,
    actions,
}: {
    readonly title: string;
    readonly subtitle?: string;
    readonly icon?: ReactNode;
    readonly actions?: ReactNode;
}) {
    return (
        <div className="flex items-end justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
                {icon && (
                    <span className="w-11 h-11 rounded-2xl bg-gold-soft/50 border border-gold/20 text-gold flex items-center justify-center shrink-0">
                        {icon}
                    </span>
                )}
                <div>
                    <h1 className="font-amiri font-bold text-brown-dark text-[26px] leading-tight">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-brown-light text-sm mt-0.5">{subtitle}</p>
                    )}
                </div>
            </div>
            {actions && <div className="flex items-center gap-2.5">{actions}</div>}
        </div>
    );
}
