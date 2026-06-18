/**
 * مجموعة أيقونات خطّية موحّدة لمنصّة نَسَب.
 * كلها stroke=currentColor، stroke-width=1.5، قابلة للتلوين عبر النص.
 * الحجم الافتراضي w-5 h-5 ويُتجاوز عبر className.
 */
import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { readonly className?: string };

function Base({ className = 'w-5 h-5', children, ...rest }: IconProps & { children: React.ReactNode }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            {...rest}
        >
            {children}
        </svg>
    );
}

/* شعار «ن» داخل إطار — ليس SVG بل حرف بخط Amiri */
export function NunLogo({ className = '' }: { readonly className?: string }) {
    return (
        <span
            className={`inline-flex items-center justify-center rounded-[11px] border-[1.5px] border-gold text-gold font-amiri font-bold leading-none ${className}`}
        >
            ن
        </span>
    );
}

export const TreeNodesIcon = (p: IconProps) => (
    <Base {...p}>
        <circle cx={12} cy={4} r={2.2} />
        <circle cx={5} cy={19} r={2.2} />
        <circle cx={19} cy={19} r={2.2} />
        <path d="M12 6.2v3.3M12 9.5H5v7.3M12 9.5h7v7.3" />
    </Base>
);

export const KinshipIcon = (p: IconProps) => (
    <Base {...p}>
        <circle cx={6} cy={12} r={3} />
        <circle cx={18} cy={12} r={3} />
        <path d="M9 12h6" />
    </Base>
);

export const DocumentIcon = (p: IconProps) => (
    <Base {...p}>
        <rect x={5} y={3} width={14} height={18} rx={2} />
        <path d="M9 8h6M9 12h6M9 16h3" />
    </Base>
);

export const ShieldCheckIcon = (p: IconProps) => (
    <Base {...p}>
        <path d="M12 3l7 3v5.5c0 4.2-3 7-7 8.5-4-1.5-7-4.3-7-8.5V6z" />
        <path d="M9 12l2 2 4-4" />
    </Base>
);

export const UsersIcon = (p: IconProps) => (
    <Base {...p}>
        <circle cx={9} cy={8} r={3} />
        <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
        <path d="M16 3.5a3 3 0 010 5.8M17 14c2.4.5 4 2.6 4 5" />
    </Base>
);

export const TribeIcon = (p: IconProps) => (
    <Base {...p}>
        <path d="M20.6 13.4l-7.2 7.2a2 2 0 01-2.8 0l-6.2-6.2a2 2 0 01-.6-1.4V5a2 2 0 012-2h7.6a2 2 0 011.4.6l6.2 6.2a2 2 0 010 2.6z" />
        <circle cx={8} cy={8} r={1.3} />
    </Base>
);

export const SearchIcon = (p: IconProps) => (
    <Base {...p}>
        <circle cx={11} cy={11} r={7} />
        <path d="M21 21l-4.3-4.3" />
    </Base>
);

export const BellIcon = (p: IconProps) => (
    <Base {...p}>
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.7 21a2 2 0 01-3.4 0" />
    </Base>
);

export const PlusIcon = (p: IconProps) => (
    <Base {...p}>
        <path d="M12 5v14M5 12h14" />
    </Base>
);

export const EditIcon = (p: IconProps) => (
    <Base {...p}>
        <path d="M15.2 5.2l3.6 3.6M16.7 3.7a2.5 2.5 0 013.6 3.6L6.5 21H3v-3.5z" />
    </Base>
);

export const TrashIcon = (p: IconProps) => (
    <Base {...p}>
        <path d="M4 7h16M10 11v6M14 11v6M5 7l1 13a2 2 0 002 2h8a2 2 0 002-2l1-13M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
    </Base>
);

export const CheckIcon = (p: IconProps) => (
    <Base {...p}>
        <path d="M5 13l4 4L19 7" />
    </Base>
);

export const XIcon = (p: IconProps) => (
    <Base {...p}>
        <path d="M6 6l12 12M18 6L6 18" />
    </Base>
);

export const ChevronIcon = (p: IconProps) => (
    <Base {...p}>
        <path d="M14 6l-6 6 6 6" />
    </Base>
);

export const ArrowLeftIcon = (p: IconProps) => (
    <Base {...p}>
        <path d="M19 12H5M11 18l-6-6 6-6" />
    </Base>
);

export const SettingsIcon = (p: IconProps) => (
    <Base {...p}>
        <circle cx={12} cy={12} r={3} />
        <path d="M19.4 15a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-1.8-.3 1.6 1.6 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.6 1.6 0 00-1-1.5 1.6 1.6 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.6 1.6 0 00.3-1.8 1.6 1.6 0 00-1.5-1H3a2 2 0 110-4h.1a1.6 1.6 0 001.5-1 1.6 1.6 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.6 1.6 0 001.8.3H9a1.6 1.6 0 001-1.5V3a2 2 0 114 0v.1a1.6 1.6 0 001 1.5 1.6 1.6 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 00-.3 1.8V9a1.6 1.6 0 001.5 1H21a2 2 0 110 4h-.1a1.6 1.6 0 00-1.5 1z" />
    </Base>
);

export const LogoutIcon = (p: IconProps) => (
    <Base {...p}>
        <path d="M15 17l5-5-5-5M20 12H9M9 21H6a2 2 0 01-2-2V5a2 2 0 012-2h3" />
    </Base>
);

export const LayoutIcon = (p: IconProps) => (
    <Base {...p}>
        <rect x={3} y={3} width={18} height={18} rx={2} />
        <path d="M3 9h18M9 21V9" />
    </Base>
);

export const LightbulbIcon = (p: IconProps) => (
    <Base {...p}>
        <path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.6 10.8c.6.5 1 1.2 1.1 2H14.5c.1-.8.5-1.5 1.1-2A6 6 0 0012 3z" />
    </Base>
);

export const EyeIcon = (p: IconProps) => (
    <Base {...p}>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
        <circle cx={12} cy={12} r={3} />
    </Base>
);

export const PhotoIcon = (p: IconProps) => (
    <Base {...p}>
        <rect x={3} y={5} width={18} height={14} rx={2} />
        <circle cx={9} cy={10} r={1.5} />
        <path d="M5 18l4.5-4.5a2 2 0 012.8 0L19 19" />
    </Base>
);

export const UserIcon = (p: IconProps) => (
    <Base {...p}>
        <circle cx={12} cy={8} r={4} />
        <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
    </Base>
);

export const RocketIcon = (p: IconProps) => (
    <Base {...p}>
        <path d="M5 15c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.9.6-2.2-.2-3-.8-.8-2.1-.7-2.8.2z" />
        <path d="M9 13c4-7 8-8 11-8 0 3-1 7-8 11l-3-3z" />
        <path d="M14 8.5a1.5 1.5 0 102.99 0A1.5 1.5 0 0014 8.5z" />
    </Base>
);

export const SparkleIcon = (p: IconProps) => (
    <Base {...p}>
        <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
    </Base>
);

export const MailIcon = (p: IconProps) => (
    <Base {...p}>
        <rect x={3} y={5} width={18} height={14} rx={2} />
        <path d="M4 7l8 6 8-6" />
    </Base>
);

export const LockIcon = (p: IconProps) => (
    <Base {...p}>
        <rect x={5} y={11} width={14} height={10} rx={2} />
        <path d="M8 11V8a4 4 0 018 0v3" />
    </Base>
);

export const AlertTriangleIcon = (p: IconProps) => (
    <Base {...p}>
        <path d="M12 4l9 16H3z" />
        <path d="M12 10v4M12 17.5v.5" />
    </Base>
);

export const ClockIcon = (p: IconProps) => (
    <Base {...p}>
        <circle cx={12} cy={12} r={9} />
        <path d="M12 7v5l3 2" />
    </Base>
);

export const LinkIcon = (p: IconProps) => (
    <Base {...p}>
        <path d="M10 13a5 5 0 007 0l2-2a5 5 0 00-7-7l-1 1" />
        <path d="M14 11a5 5 0 00-7 0l-2 2a5 5 0 007 7l1-1" />
    </Base>
);

export const DownloadIcon = (p: IconProps) => (
    <Base {...p}>
        <path d="M12 3v12M8 11l4 4 4-4M4 19h16" />
    </Base>
);

export const PackageIcon = (p: IconProps) => (
    <Base {...p}>
        <path d="M21 8l-9-5-9 5 9 5 9-5z" />
        <path d="M3 8v8l9 5 9-5V8M12 13v8" />
    </Base>
);

export const StarIcon = (p: IconProps) => (
    <Base {...p}>
        <path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.2l1-5.8L3.5 9.2l5.9-.9z" />
    </Base>
);

export const BugIcon = (p: IconProps) => (
    <Base {...p}>
        <rect x={8} y={6} width={8} height={12} rx={4} />
        <path d="M12 6V4M9 4h6M5 9h3M16 9h3M5 14h3M16 14h3M6 19l2-2M18 19l-2-2" />
    </Base>
);
