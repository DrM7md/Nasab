import FeedbackButton from '@/Components/UI/FeedbackButton';
import {
    LayoutIcon,
    LightbulbIcon,
    LogoutIcon,
    NunLogo,
    PackageIcon,
    SettingsIcon,
    ShieldCheckIcon,
    TribeIcon,
    UsersIcon,
} from '@/Components/UI/Icons';
import ThemeToggle from '@/Components/UI/ThemeToggle';
import type { PageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';

/**
 * AuthenticatedLayout — قشرة صفحات المستخدم المسجّل بنمط «الجذر».
 * خلفية كريمية، شعار «ن» بخط Amiri، روابط بخط سفلي ذهبي، أيقونات خطّية.
 */
export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const page = usePage<PageProps>();
    const user = page.props.auth.user!;
    const tribe = page.props.tribe;
    const feedbackNewCount = page.props.feedback_new_count ?? 0;
    const [menuOpen, setMenuOpen] = useState(false);

    const roleLabel: Record<string, string> = {
        super_admin: 'مدير عام',
        tribe_admin: 'مدير قبيلة',
        moderator: 'مراجع',
        member: 'عضو',
        viewer: 'زائر',
    };

    const close = () => setMenuOpen(false);

    return (
        <div className="landing-bg min-h-screen text-brown-dark" dir="rtl">
            <nav className="landing-nav sticky top-0 z-30 backdrop-blur-md border-b border-gold/15">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex h-16 items-center justify-between">
                        {/* الشعار + الروابط */}
                        <div className="flex items-center gap-7">
                            <Link href="/" className="inline-flex items-center gap-2.5">
                                <NunLogo className="w-9 h-9 text-[20px]" />
                                <span className="font-amiri text-brown-dark font-bold text-lg hidden sm:inline tracking-wide">
                                    نَسَب
                                </span>
                            </Link>

                            <div className="hidden md:flex items-center gap-6 text-[14.5px] font-medium text-brown-mid">
                                <Link
                                    href={route('dashboard')}
                                    className={navCls(route().current('dashboard'))}
                                >
                                    لوحة التحكم
                                </Link>
                                {tribe && (
                                    <>
                                        <Link href={`/tribes/${tribe.slug}/tree`} className="ns-link">
                                            الشجرة
                                        </Link>
                                        <Link href={`/tribes/${tribe.slug}/search`} className="ns-link">
                                            البحث
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* الإجراءات + القائمة */}
                        <div className="flex items-center gap-3">
                            <FeedbackButton />
                            <ThemeToggle />

                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setMenuOpen(!menuOpen)}
                                    className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white dark:bg-night-card border border-gold/20 text-brown-dark hover:border-gold/40 transition-colors"
                                >
                                    <span className="w-7 h-7 rounded-full bg-gradient-to-br from-gold-light to-gold flex items-center justify-center text-white font-bold text-xs">
                                        {user.name.charAt(0)}
                                    </span>
                                    <span className="hidden sm:block text-right leading-tight">
                                        <span className="block font-medium text-[13px]">{user.name}</span>
                                        <span className="block text-brown-light text-[10px]">
                                            {roleLabel[user.role] ?? user.role}
                                        </span>
                                    </span>
                                    <svg className="w-4 h-4 text-brown-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {menuOpen && (
                                    <>
                                        <button
                                            type="button"
                                            className="fixed inset-0 z-10 cursor-default"
                                            onClick={close}
                                            aria-label="إغلاق القائمة"
                                            tabIndex={-1}
                                        />
                                        <div className="absolute left-0 top-full mt-2 w-60 bg-white dark:bg-night-card rounded-2xl shadow-xl border border-gold/20 overflow-hidden z-20">
                                            <div className="p-3 border-b border-gold/10">
                                                <div className="text-brown-dark text-sm font-medium truncate">{user.name}</div>
                                                <div className="text-brown-light text-xs truncate" dir="ltr">{user.email}</div>
                                            </div>

                                            <MenuLink href={route('profile.edit')} icon={<SettingsIcon className="w-[18px] h-[18px]" />} onClick={close}>
                                                الملف الشخصي
                                            </MenuLink>

                                            {user.can_moderate && (
                                                <>
                                                    <MenuLink href={route('admin.users.index')} icon={<UsersIcon className="w-[18px] h-[18px]" />} onClick={close}>
                                                        إدارة المستخدمين
                                                    </MenuLink>
                                                    {user.role === 'super_admin' && (
                                                        <>
                                                            <MenuLink href={route('admin.tribes.index')} icon={<TribeIcon className="w-[18px] h-[18px]" />} onClick={close}>
                                                                إدارة القبائل
                                                            </MenuLink>
                                                            <MenuLink href={route('admin.packages.index')} icon={<PackageIcon className="w-[18px] h-[18px]" />} onClick={close}>
                                                                الباقات والتسعير
                                                            </MenuLink>
                                                            <MenuLink href={route('admin.landing.index')} icon={<LayoutIcon className="w-[18px] h-[18px]" />} onClick={close}>
                                                                تحرير الواجهة
                                                            </MenuLink>
                                                            <MenuLink
                                                                href={route('admin.feedback.index')}
                                                                icon={<LightbulbIcon className="w-[18px] h-[18px]" />}
                                                                onClick={close}
                                                                badge={feedbackNewCount}
                                                            >
                                                                الاقتراحات والبلاغات
                                                            </MenuLink>
                                                        </>
                                                    )}
                                                    {tribe && (
                                                        <MenuLink
                                                            href={`/tribes/${tribe.slug}/admin/pending-edits`}
                                                            icon={<ShieldCheckIcon className="w-[18px] h-[18px]" />}
                                                            onClick={close}
                                                        >
                                                            طلبات الموافقة
                                                        </MenuLink>
                                                    )}
                                                </>
                                            )}

                                            <Link
                                                href={route('logout')}
                                                method="post"
                                                as="button"
                                                className="flex items-center gap-2.5 w-full text-right px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 border-t border-gold/10 transition-colors"
                                            >
                                                <LogoutIcon className="w-[18px] h-[18px]" />
                                                <span>تسجيل الخروج</span>
                                            </Link>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white/50 dark:bg-night-card/40 backdrop-blur-sm border-b border-gold/10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">{header}</div>
                </header>
            )}

            <main className="page-enter">{children}</main>
        </div>
    );
}

function navCls(active: boolean) {
    return active
        ? 'text-gold font-semibold'
        : 'ns-link';
}

function MenuLink({
    href,
    icon,
    children,
    onClick,
    badge,
}: {
    readonly href: string;
    readonly icon: ReactNode;
    readonly children: ReactNode;
    readonly onClick: () => void;
    readonly badge?: number;
}) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-brown-dark hover:bg-beige dark:hover:bg-night-bg transition-colors"
        >
            <span className="text-gold inline-flex">{icon}</span>
            <span className="flex-1">{children}</span>
            {badge !== undefined && badge > 0 && (
                <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center">
                    {badge}
                </span>
            )}
        </Link>
    );
}
