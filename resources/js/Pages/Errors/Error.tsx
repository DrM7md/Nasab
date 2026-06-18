import { ButtonLink } from '@/Components/UI/Button';
import { AlertTriangleIcon, LockIcon, NunLogo, SearchIcon, SettingsIcon } from '@/Components/UI/Icons';
import type { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';

type ErrorPageProps = PageProps<{ status: number }>;

const TITLES: Record<number, string> = {
    404: 'الصفحة غير موجودة',
    403: 'غير مصرح لك بالوصول',
    500: 'حدث خطأ في الخادم',
    503: 'الخدمة غير متاحة حالياً',
};

const DESCRIPTIONS: Record<number, string> = {
    404: 'المسار الذي تبحث عنه غير موجود أو تم نقله.',
    403: 'ليست لديك الصلاحية اللازمة لعرض هذه الصفحة.',
    500: 'نأسف — حدث خطأ غير متوقع في الخادم. نحاول إصلاحه.',
    503: 'الموقع قيد الصيانة. يرجى المحاولة لاحقاً.',
};

function statusIcon(status: number): ReactNode {
    const cls = 'w-9 h-9';
    switch (status) {
        case 404: return <SearchIcon className={cls} />;
        case 403: return <LockIcon className={cls} />;
        case 503: return <SettingsIcon className={cls} />;
        default: return <AlertTriangleIcon className={cls} />;
    }
}

export default function ErrorPage({ status, tribe, auth }: ErrorPageProps) {
    const title = TITLES[status] ?? 'حدث خطأ';
    const description = DESCRIPTIONS[status] ?? 'خطأ غير معروف.';

    const homeHref = tribe ? `/tribes/${tribe.slug}/tree` : '/';
    const homeLabel = tribe ? 'العودة للشجرة' : 'الصفحة الرئيسية';

    return (
        <>
            <Head title={`${status} — ${title}`} />

            <div className="landing-bg page-enter min-h-screen flex items-center justify-center p-6 text-brown-dark" dir="rtl">
                <div
                    className="max-w-lg w-full bg-white dark:bg-night-card border border-gold/20 rounded-3xl shadow-[0_22px_50px_rgba(60,43,31,0.12)] p-10 text-center"
                    style={{ animation: 'nsFadeUp .6s ease-out both' }}
                >
                    <div className="flex justify-center mb-4">
                        <span className="w-20 h-20 rounded-3xl bg-gold-soft/50 border border-gold/20 text-gold flex items-center justify-center">
                            {statusIcon(status)}
                        </span>
                    </div>

                    <div className="font-amiri text-6xl font-bold text-gold mb-2">{status}</div>

                    <h1 className="font-amiri text-[26px] font-bold text-brown-dark mb-3">{title}</h1>

                    <p className="text-brown-mid text-sm leading-relaxed mb-8">{description}</p>

                    <div className="flex flex-wrap gap-3 justify-center">
                        <ButtonLink href={homeHref}>{homeLabel}</ButtonLink>
                        {!auth.user && (
                            <ButtonLink href="/login" variant="ghost">تسجيل الدخول</ButtonLink>
                        )}
                    </div>

                    <div className="mt-8 flex items-center justify-center gap-2 text-brown-light opacity-70">
                        <NunLogo className="w-6 h-6 text-sm" />
                        <span className="font-amiri text-sm">نَسَب</span>
                    </div>
                </div>
            </div>
        </>
    );
}
