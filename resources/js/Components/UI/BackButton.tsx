import { router } from '@inertiajs/react';

interface Props {
    label?: string;
    href?: string;
}

export default function BackButton({ label = 'رجوع', href }: Props) {
    const handleClick = () => {
        if (href) {
            router.visit(href);
        } else {
            window.history.back();
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className="inline-flex items-center gap-2 text-brown-mid hover:text-gold transition-colors group mb-4"
        >
            {/* سهم يمين في RTL = سهم "إلى الخلف" */}
            <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                />
            </svg>
            <span className="text-sm font-medium">{label}</span>
        </button>
    );
}
