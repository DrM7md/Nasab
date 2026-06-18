import AnimatedNumber from '@/Components/UI/AnimatedNumber';
import { ButtonLink } from '@/Components/UI/Button';
import Card from '@/Components/UI/Card';
import EmptyState from '@/Components/UI/EmptyState';
import {
    ArrowLeftIcon,
    BellIcon,
    DocumentIcon,
    DownloadIcon,
    KinshipIcon,
    LayoutIcon,
    PackageIcon,
    PlusIcon,
    RocketIcon,
    SearchIcon,
    ShieldCheckIcon,
    TreeNodesIcon,
    TribeIcon,
    UsersIcon,
} from '@/Components/UI/Icons';
import PageHeader from '@/Components/UI/PageHeader';
import SectionTitle from '@/Components/UI/SectionTitle';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import type { PageProps, Tribe } from '@/types';
import { Head, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

interface TribeCard extends Tribe {
    persons_count: number;
    is_mine: boolean;
}

interface Stats {
    total_tribes?: number;
    active_tribes?: number;
    total_users?: number;
    total_persons?: number;
    pending_system?: number;
    tribe_persons?: number;
    tribe_members?: number;
    tribe_pending?: number;
}

interface TribeMeta {
    package_name: string | null;
    person_count: number;
    person_limit: number | null;
    member_count: number;
    member_limit: number | null;
    can_export: boolean;
}

type DashProps = PageProps<{
    stats: Stats;
    tribes: TribeCard[];
    myTribe: { id: number; name_ar: string; slug: string } | null;
    myTribeMeta: TribeMeta | null;
}>;

export default function Dashboard({ auth, tribe, pending_count, stats, tribes, myTribe, myTribeMeta }: DashProps) {
    const user = auth.user!;
    const isSuper = user.role === 'super_admin';

    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    icon={<LayoutIcon />}
                    title="لوحة التحكم"
                    subtitle={`مرحباً بك، ${user.name}`}
                />
            }
        >
            <Head title="لوحة التحكم" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-7">
                {/* ═════════ الإحصائيات ═════════ */}
                {isSuper && stats.total_tribes !== undefined && (
                    <section className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                        <StatTile label="القبائل" value={stats.total_tribes} icon={<TribeIcon />} />
                        <StatTile label="المستخدمون" value={stats.total_users ?? 0} icon={<UsersIcon />} />
                        <StatTile label="الأشخاص" value={stats.total_persons ?? 0} icon={<TreeNodesIcon />} />
                        <StatTile label="طلبات معلّقة" value={stats.pending_system ?? 0} icon={<ShieldCheckIcon />} alert={(stats.pending_system ?? 0) > 0} />
                    </section>
                )}
                {!isSuper && myTribe && stats.tribe_persons !== undefined && (
                    <section className="grid grid-cols-3 gap-3.5">
                        <StatTile label="أشخاص القبيلة" value={stats.tribe_persons} icon={<TreeNodesIcon />} />
                        <StatTile label="أعضاء القبيلة" value={stats.tribe_members ?? 0} icon={<UsersIcon />} />
                        <StatTile label="طلبات معلّقة" value={stats.tribe_pending ?? 0} icon={<ShieldCheckIcon />} alert={(stats.tribe_pending ?? 0) > 0} />
                    </section>
                )}

                {/* ═════════ إشعار الطلبات المعلّقة ═════════ */}
                {user.can_moderate && pending_count > 0 && tribe && (
                    <Card className="!border-rose-200 dark:!border-rose-900/40 bg-rose-50 dark:bg-rose-950/20 p-4 flex items-center gap-3.5">
                        <span className="w-11 h-11 rounded-2xl bg-rose-100 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center shrink-0">
                            <BellIcon />
                        </span>
                        <div className="flex-1">
                            <div className="text-rose-800 dark:text-rose-300 font-bold">
                                لديك {pending_count} {pending_count === 1 ? 'طلب' : 'طلبات'} بحاجة لمراجعتك
                            </div>
                            <Link
                                href={`/tribes/${tribe.slug}/admin/pending-edits`}
                                className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 text-sm hover:gap-2 transition-all"
                            >
                                الذهاب إلى لوحة الموافقات <ArrowLeftIcon className="w-4 h-4" />
                            </Link>
                        </div>
                    </Card>
                )}

                {/* ═════════ استهلاك الباقة ═════════ */}
                {myTribeMeta && <PackageUsage meta={myTribeMeta} slug={myTribe?.slug ?? null} />}

                {/* ═════════ الإجراءات الرئيسية ═════════ */}
                <section className="space-y-4">
                    <SectionTitle icon={<RocketIcon />}>الإجراءات الرئيسية</SectionTitle>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {isSuper && (
                            <>
                                <ActionCard icon={<TribeIcon />} title="إدارة القبائل" description="إنشاء قبائل جديدة وتعديل الموجودة" href={route('admin.tribes.index')} primary />
                                <ActionCard icon={<UsersIcon />} title="إدارة المستخدمين" description="تعيين الأدوار وإسناد القبائل" href={route('admin.users.index')} primary />
                            </>
                        )}

                        {user.role === 'tribe_admin' && myTribe && (
                            <>
                                <ActionCard icon={<TreeNodesIcon />} title="شجرة القبيلة" description="تصفّح وأدِر شجرة نسب القبيلة" href={`/tribes/${myTribe.slug}/tree`} primary />
                                <ActionCard icon={<UsersIcon />} title="أعضاء القبيلة" description="أدِر أعضاء قبيلتك وصلاحياتهم" href={route('admin.users.index')} primary />
                                <ActionCard icon={<ShieldCheckIcon />} title="طلبات الموافقة" description="راجع طلبات الإضافة والتعديل" href={`/tribes/${myTribe.slug}/admin/pending-edits`} badge={pending_count} primary />
                                {myTribeMeta?.can_export && (
                                    <a
                                        href={`/tribes/${myTribe.slug}/admin/export/persons`}
                                        className="ns-card group block p-5 rounded-2xl border border-gold/15 bg-white dark:bg-night-card shadow-sm"
                                    >
                                        <span className="w-12 h-12 rounded-2xl bg-gold-soft/50 border border-gold/20 text-gold flex items-center justify-center mb-3.5 group-hover:scale-105 transition-transform [&>svg]:w-6 [&>svg]:h-6">
                                            <DownloadIcon />
                                        </span>
                                        <h3 className="text-brown-dark font-bold mb-1">تصدير بيانات الشجرة</h3>
                                        <p className="text-brown-light text-xs leading-relaxed">حمّل أشخاص القبيلة كملف Excel</p>
                                    </a>
                                )}
                            </>
                        )}

                        {!isSuper && user.role !== 'tribe_admin' && myTribe && (
                            <>
                                <ActionCard icon={<TreeNodesIcon />} title="شجرة قبيلتي" description="تصفّح شجرة نسب قبيلتك" href={`/tribes/${myTribe.slug}/tree`} primary />
                                <ActionCard icon={<SearchIcon />} title="البحث وصلة القرابة" description="ابحث عن شخص أو اكتشف صلة القرابة" href={`/tribes/${myTribe.slug}/search`} />
                                {user.linked_person_id && (
                                    <ActionCard icon={<DocumentIcon />} title="وثيقة نسبي" description="اعرض أو حمّل وثيقة نسبك الشريف" href={`/tribes/${myTribe.slug}/certificate/${user.linked_person_id}`} />
                                )}
                            </>
                        )}
                    </div>
                </section>

                {/* ═════════ القبائل ═════════ */}
                {(isSuper || !myTribe) && tribes.length > 0 && (
                    <section className="space-y-4">
                        <SectionTitle icon={<TribeIcon />}>
                            {isSuper ? 'كل القبائل' : 'استكشف القبائل المتاحة'}
                        </SectionTitle>

                        {!isSuper && !myTribe && (
                            <Card className="p-4 bg-gold-soft/30 dark:bg-night-card !border-gold/20 text-brown-dark text-sm flex items-start gap-2.5">
                                <KinshipIcon className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                                <span>أنت لم تُسنَد لقبيلة بعد. يمكنك تصفّح الشجرة للقبائل المتاحة، وسيتواصل معك مدير القبيلة عند إسنادك إليها.</span>
                            </Card>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {tribes.map((t) => (
                                <TribeCardLink key={t.id} tribe={t} isSuper={isSuper} />
                            ))}
                        </div>

                        {isSuper && (
                            <div className="flex justify-end">
                                <ButtonLink href={route('admin.tribes.index')} icon={<PlusIcon className="w-4 h-4" />}>
                                    إضافة قبيلة جديدة
                                </ButtonLink>
                            </div>
                        )}
                    </section>
                )}

                {tribes.length === 0 && isSuper && (
                    <Card className="py-2">
                        <EmptyState
                            icon={<TribeIcon />}
                            title="لا توجد قبائل بعد"
                            description="ابدأ بإنشاء أول قبيلة في النظام."
                            action={
                                <ButtonLink href={route('admin.tribes.index')} icon={<PlusIcon className="w-4 h-4" />}>
                                    إنشاء قبيلة
                                </ButtonLink>
                            }
                        />
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

/* ═══════════════════════════════════════════════ */
function PackageUsage({ meta, slug }: { readonly meta: TribeMeta; readonly slug: string | null }) {
    return (
        <Card className="p-5">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                <SectionTitle icon={<PackageIcon />}>
                    باقة القبيلة{meta.package_name ? ` — ${meta.package_name}` : ''}
                </SectionTitle>
                {meta.can_export && slug && (
                    <a
                        href={`/tribes/${slug}/admin/export/persons`}
                        className="inline-flex items-center gap-1.5 text-sm text-gold hover:text-gold-light font-medium"
                    >
                        <DownloadIcon className="w-4 h-4" /> تصدير Excel
                    </a>
                )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <UsageBar label="الأشخاص" count={meta.person_count} limit={meta.person_limit} />
                <UsageBar label="الأعضاء" count={meta.member_count} limit={meta.member_limit} />
            </div>
        </Card>
    );
}

function UsageBar({ label, count, limit }: { readonly label: string; readonly count: number; readonly limit: number | null }) {
    const unlimited = limit === null;
    const pct = unlimited || limit === 0 ? 0 : Math.min(100, Math.round((count / limit) * 100));
    const near = !unlimited && pct >= 80;
    return (
        <div>
            <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-brown-mid">{label}</span>
                <span className="font-bold text-brown-dark">
                    {count.toLocaleString('en-US')}
                    <span className="text-brown-light font-normal"> / {unlimited ? 'غير محدود' : limit.toLocaleString('en-US')}</span>
                </span>
            </div>
            <div className="h-2.5 rounded-full bg-beige-dark/60 dark:bg-night-bg overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all ${near ? 'bg-rose-500' : 'bg-gradient-to-l from-gold to-gold-light'}`}
                    style={{ width: unlimited ? '12%' : `${pct}%`, opacity: unlimited ? 0.4 : 1 }}
                />
            </div>
        </div>
    );
}

function StatTile({
    label,
    value,
    icon,
    alert = false,
}: {
    readonly label: string;
    readonly value: number;
    readonly icon: ReactNode;
    readonly alert?: boolean;
}) {
    return (
        <Card
            hover
            className={`p-4 ${alert ? '!border-rose-300 bg-rose-50/60 dark:bg-rose-950/15' : ''}`}
        >
            <div className={`mb-2 inline-flex ${alert ? 'text-rose-500' : 'text-gold'} [&>svg]:w-6 [&>svg]:h-6`}>
                {icon}
            </div>
            <AnimatedNumber value={value} className="block text-3xl font-bold text-brown-dark" />
            <div className="text-brown-light text-xs mt-0.5">{label}</div>
        </Card>
    );
}

function ActionCard({
    icon,
    title,
    description,
    href,
    primary,
    badge,
}: {
    readonly icon: ReactNode;
    readonly title: string;
    readonly description: string;
    readonly href: string;
    readonly primary?: boolean;
    readonly badge?: number;
}) {
    return (
        <Link
            href={href}
            className={`ns-card group relative block p-5 rounded-2xl border shadow-sm ${
                primary
                    ? 'bg-gradient-to-br from-white to-gold-soft/30 dark:from-night-card dark:to-night-bg border-gold/30'
                    : 'bg-white dark:bg-night-card border-gold/15'
            }`}
        >
            {badge !== undefined && badge > 0 && (
                <span className="absolute top-4 left-4 min-w-[24px] h-6 px-1.5 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center">
                    {badge}
                </span>
            )}
            <span className="w-12 h-12 rounded-2xl bg-gold-soft/50 border border-gold/20 text-gold flex items-center justify-center mb-3.5 group-hover:scale-105 transition-transform [&>svg]:w-6 [&>svg]:h-6">
                {icon}
            </span>
            <h3 className="text-brown-dark font-bold mb-1">{title}</h3>
            <p className="text-brown-light text-xs leading-relaxed">{description}</p>
        </Link>
    );
}

function TribeCardLink({ tribe, isSuper }: { readonly tribe: TribeCard; readonly isSuper: boolean }) {
    return (
        <Link
            href={`/tribes/${tribe.slug}/tree`}
            className={`ns-card group block p-5 rounded-2xl border shadow-sm ${
                tribe.is_mine ? 'bg-gold-soft/30 dark:bg-night-card border-gold' : 'bg-white dark:bg-night-card border-gold/15'
            } ${!tribe.is_active ? 'opacity-60' : ''}`}
        >
            <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                    <span className="text-gold"><TribeIcon className="w-5 h-5" /></span>
                    <h3 className="text-brown-dark font-bold">{tribe.name_ar}</h3>
                </div>
                {tribe.is_mine && (
                    <span className="shrink-0 px-2 py-0.5 bg-gold text-white rounded-full text-[10px] font-bold">قبيلتي</span>
                )}
                {isSuper && !tribe.is_active && (
                    <span className="shrink-0 px-2 py-0.5 bg-rose-500 text-white rounded-full text-[10px] font-bold">معطّلة</span>
                )}
            </div>
            {tribe.description_ar && (
                <p className="text-brown-light text-xs mb-3 line-clamp-2">{tribe.description_ar}</p>
            )}
            <div className="flex items-center justify-between pt-3 border-t border-gold/10">
                <span className="inline-flex items-center gap-1.5 text-brown-mid text-xs">
                    <UsersIcon className="w-4 h-4" /> {tribe.persons_count.toLocaleString('en-US')} شخص
                </span>
                <span className="inline-flex items-center gap-1 text-gold text-sm font-medium group-hover:gap-2 transition-all">
                    دخول <ArrowLeftIcon className="w-4 h-4" />
                </span>
            </div>
        </Link>
    );
}
