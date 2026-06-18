import UserFormModal, { type UserFormData } from '@/Components/Admin/UserFormModal';
import { Button } from '@/Components/UI/Button';
import { AlertTriangleIcon, ClockIcon, PackageIcon, PlusIcon, TribeIcon, UsersIcon } from '@/Components/UI/Icons';
import PageHeader from '@/Components/UI/PageHeader';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import type { PageProps, Paginated, UserRole } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface UserRow {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    national_id: string | null;
    nationality: string | null;
    id_card_photo: string | null;
    role: UserRole;
    tribe_id: number | null;
    requested_tribe_id: number | null;
    tribe: { id: number; name_ar: string; slug: string } | null;
    requested_tribe: { id: number; name_ar: string; slug: string } | null;
    join_intent: 'member' | 'found_tribe' | 'claim_admin' | null;
    claim_reason: string | null;
    requested_package: { id: number; name_ar: string; price_monthly: number; currency: string } | null;
    current_admins: Array<{ name: string; last_active_at: string | null }>;
    is_active: boolean;
    is_pending_join: boolean;
    email_verified_at: string | null;
    is_self: boolean;
}

interface TribeOption {
    id: number;
    name_ar: string;
    slug: string;
}

type UsersIndexProps = PageProps<{
    users: Paginated<UserRow>;
    tribes: TribeOption[];
    search: string;
    tab: 'all' | 'joins';
    perPage: number;
    joinCount: number;
    canAssignSuperAdmin: boolean;
}>;

const PER_PAGE_OPTIONS = [10, 20, 50, 100, 500] as const;

const ROLE_LABELS: Record<UserRole, string> = {
    super_admin: 'مدير عام',
    tribe_admin: 'مدير قبيلة',
    moderator: 'مراجع',
    member: 'عضو',
    viewer: 'زائر',
};

const ROLE_COLORS: Record<UserRole, string> = {
    super_admin: 'bg-purple-100 text-purple-800 border-purple-300',
    tribe_admin: 'bg-gold-soft text-brown-dark border-gold',
    moderator: 'bg-blue-100 text-blue-800 border-blue-300',
    member: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    viewer: 'bg-gray-100 text-gray-700 border-gray-300',
};

export default function UsersIndex({
    users,
    tribes,
    search,
    tab,
    perPage,
    joinCount,
    canAssignSuperAdmin,
}: UsersIndexProps) {
    const currentUserId = usePage<PageProps>().props.auth.user?.id ?? 0;
    const [query, setQuery] = useState(search);
    const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);

    const [showCreate, setShowCreate] = useState(false);
    const [editingUser, setEditingUser] = useState<UserFormData | null>(null);
    const [deletingUser, setDeletingUser] = useState<UserRow | null>(null);

    /** يُرسل طلب filter — يُستخدم في live search + tab + per_page */
    const fetchFiltered = (overrides: Record<string, unknown> = {}) => {
        router.get(
            route('admin.users.index'),
            { q: query, tab, per_page: perPage, ...overrides },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    /** Debounced live search — 300ms بعد آخر ضغطة */
    const debouncedSearch = useDebouncedCallback((...args: unknown[]) => {
        const q = args[0] as string;
        router.get(
            route('admin.users.index'),
            { q, tab, per_page: perPage },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }, 300);

    const onQueryChange = (value: string) => {
        setQuery(value);
        debouncedSearch(value);
    };

    const navTab = (newTab: 'all' | 'joins') => fetchFiltered({ tab: newTab });
    const onPerPageChange = (n: number) => fetchFiltered({ per_page: n, page: 1 });

    const openEdit = (u: UserRow) => {
        setEditingUser({
            id: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone ?? '',
            national_id: u.national_id ?? '',
            nationality: u.nationality ?? '',
            role: u.role,
            tribe_id: u.tribe_id,
            is_active: u.is_active,
            id_card_photo_url: u.id_card_photo,
        });
    };

    const approveJoin = (u: UserRow) => {
        router.post(route('admin.users.approve-join', u.id), {}, { preserveScroll: true });
    };

    const rejectJoin = (u: UserRow) => {
        if (confirm(`رفض طلب انضمام ${u.name}؟ سيُعطَّل الحساب.`)) {
            router.post(route('admin.users.reject-join', u.id), {}, { preserveScroll: true });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    icon={<UsersIcon />}
                    title="إدارة المستخدمين"
                    subtitle="عيّن الأدوار، وأنشئ حسابات جديدة، واعتمد طلبات الانضمام"
                    actions={
                        <Button onClick={() => setShowCreate(true)} icon={<PlusIcon className="w-4 h-4" />}>
                            مستخدم جديد
                        </Button>
                    }
                />
            }
        >
            <Head title="إدارة المستخدمين" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-4">
                {/* تبويبات */}
                <div className="flex flex-wrap gap-2">
                    <TabButton active={tab === 'all'} onClick={() => navTab('all')}>
                        كل المستخدمين
                    </TabButton>
                    <TabButton active={tab === 'joins'} onClick={() => navTab('joins')} badge={joinCount}>
                        طلبات الانضمام
                    </TabButton>
                </div>

                {/* شريط البحث المباشر + اختيار عدد الصفوف */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[220px]">
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-brown-light pointer-events-none">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => onQueryChange(e.target.value)}
                            placeholder="ابحث بالاسم أو البريد أو الرقم الشخصي..."
                            className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-white border-2 border-gold/20 focus:border-gold focus:outline-none"
                        />
                    </div>

                    <label className="inline-flex items-center gap-2 text-brown-mid text-sm">
                        <span>اعرض:</span>
                        <select
                            value={perPage}
                            onChange={(e) => onPerPageChange(Number(e.target.value))}
                            className="px-3 py-2 rounded-xl bg-white border-2 border-gold/20 focus:border-gold focus:outline-none text-brown-dark"
                        >
                            {PER_PAGE_OPTIONS.map((n) => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                    </label>
                </div>

                {/* الجدول — عرض كامل بلا scroll أفقي */}
                <div className="bg-white dark:bg-night-card rounded-2xl border border-gold/15 shadow-sm overflow-hidden">
                    {users.data.length === 0 ? (
                        <div className="p-12 text-center text-brown-mid">
                            {tab === 'joins' ? 'لا توجد طلبات انضمام حالياً' : 'لا يوجد مستخدمون'}
                        </div>
                    ) : (
                        <table className="w-full text-sm table-auto" dir="rtl">
                            <thead className="bg-beige/60 dark:bg-night-bg border-b border-gold/15">
                                <tr className="text-brown-mid text-xs font-bold">
                                    <th className="px-3 py-3 text-right">المستخدم</th>
                                    <th className="px-3 py-3 text-right hidden md:table-cell">البريد الإلكتروني</th>
                                    <th className="px-3 py-3 text-right">الدور</th>
                                    <th className="px-3 py-3 text-right hidden lg:table-cell">القبيلة</th>
                                    <th className="px-3 py-3 text-right hidden sm:table-cell">الحالة</th>
                                    <th className="px-3 py-3 text-center w-1">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gold/10">
                                {users.data.map((u) => (
                                    <UserTableRow
                                        key={u.id}
                                        user={u}
                                        onEdit={() => openEdit(u)}
                                        onDelete={() => setDeletingUser(u)}
                                        onApproveJoin={() => approveJoin(u)}
                                        onRejectJoin={() => rejectJoin(u)}
                                        onViewPhoto={(url) => setViewingPhoto(url)}
                                    />
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {users.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {users.links.map((link) => (
                            <Link
                                key={link.label + (link.url ?? '')}
                                href={link.url ?? '#'}
                                preserveState
                                preserveScroll
                                className={`
                                    px-3 py-1.5 rounded-lg text-sm
                                    ${link.active
                                        ? 'bg-gold text-white'
                                        : 'bg-white text-brown-mid border border-gold/20 hover:bg-beige'
                                    }
                                    ${link.url ? '' : 'opacity-40 pointer-events-none'}
                                `}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            <UserFormModal
                isOpen={showCreate}
                onClose={() => setShowCreate(false)}
                tribes={tribes}
                canAssignSuperAdmin={canAssignSuperAdmin}
                currentUserId={currentUserId}
            />

            {editingUser && (
                <UserFormModal
                    isOpen={true}
                    onClose={() => setEditingUser(null)}
                    user={editingUser}
                    tribes={tribes}
                    canAssignSuperAdmin={canAssignSuperAdmin}
                    currentUserId={currentUserId}
                />
            )}

            {deletingUser && (
                <DeleteUserConfirm
                    user={deletingUser}
                    onClose={() => setDeletingUser(null)}
                />
            )}

            {viewingPhoto && (
                <button
                    type="button"
                    onClick={() => setViewingPhoto(null)}
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
                    aria-label="إغلاق"
                >
                    <img
                        src={viewingPhoto}
                        alt="البطاقة الشخصية"
                        className="max-w-4xl w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
                    />
                </button>
            )}
        </AuthenticatedLayout>
    );
}

/* ═══════════════════════════════════════════════
   صف الجدول
   ═══════════════════════════════════════════════ */
function UserTableRow({
    user,
    onEdit,
    onDelete,
    onApproveJoin,
    onRejectJoin,
    onViewPhoto,
}: {
    readonly user: UserRow;
    readonly onEdit: () => void;
    readonly onDelete: () => void;
    readonly onApproveJoin: () => void;
    readonly onRejectJoin: () => void;
    readonly onViewPhoto: (url: string) => void;
}) {
    return (
        <tr className="hover:bg-beige/40 dark:hover:bg-night-bg/40 transition-colors">
            {/* المستخدم */}
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-light to-gold text-white font-bold flex items-center justify-center shrink-0">
                        {user.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-brown-dark font-medium truncate">
                                {user.name}
                            </span>
                            {user.is_self && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-gold-soft text-brown-dark rounded font-bold">
                                    أنت
                                </span>
                            )}
                        </div>
                        {user.phone && (
                            <div className="text-brown-light text-xs font-mono" dir="ltr">
                                {user.phone}
                            </div>
                        )}
                        {user.is_pending_join && <RequestInfo user={user} />}
                    </div>
                </div>
            </td>

            {/* البريد */}
            <td className="px-3 py-3 hidden md:table-cell">
                <div className="text-brown-mid text-xs font-mono truncate max-w-[220px]" dir="ltr">
                    {user.email}
                </div>
            </td>

            {/* الدور */}
            <td className="px-3 py-3">
                <span
                    className={`inline-block px-2.5 py-1 rounded-full border text-xs font-bold whitespace-nowrap ${ROLE_COLORS[user.role]}`}
                >
                    {ROLE_LABELS[user.role]}
                </span>
            </td>

            {/* القبيلة */}
            <td className="px-3 py-3 hidden lg:table-cell">
                {user.tribe ? (
                    <span className="inline-flex items-center gap-1.5 text-brown-mid text-sm"><TribeIcon className="w-4 h-4" /> {user.tribe.name_ar}</span>
                ) : user.requested_tribe ? (
                    <span className="text-amber-700 text-xs">
                        ⏳ طلب: {user.requested_tribe.name_ar}
                    </span>
                ) : (
                    <span className="text-brown-light italic text-xs">—</span>
                )}
            </td>

            {/* الحالة */}
            <td className="px-3 py-3 hidden sm:table-cell">
                {user.is_pending_join ? (
                    <span className="inline-block px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold whitespace-nowrap">
                        ⏳ طلب انضمام
                    </span>
                ) : user.is_active ? (
                    <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold whitespace-nowrap">
                        ✓ مفعّل
                    </span>
                ) : (
                    <span className="inline-block px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold whitespace-nowrap">
                        معطّل
                    </span>
                )}
            </td>

            {/* الإجراءات */}
            <td className="px-3 py-3">
                <div className="flex items-center justify-center gap-1">
                    {user.is_pending_join ? (
                        <>
                            <ActionIcon
                                label="اعتماد الانضمام"
                                color="emerald"
                                onClick={onApproveJoin}
                                icon={<CheckIcon />}
                            />
                            <ActionIcon
                                label="رفض الطلب"
                                color="rose"
                                onClick={onRejectJoin}
                                icon={<XIcon />}
                            />
                            {user.id_card_photo && (
                                <ActionIcon
                                    label="عرض البطاقة"
                                    color="gold"
                                    onClick={() => onViewPhoto(user.id_card_photo!)}
                                    icon={<PhotoIcon />}
                                />
                            )}
                        </>
                    ) : (
                        <>
                            {user.id_card_photo && (
                                <ActionIcon
                                    label="عرض البطاقة"
                                    color="gold"
                                    onClick={() => onViewPhoto(user.id_card_photo!)}
                                    icon={<PhotoIcon />}
                                />
                            )}
                            <ActionIcon
                                label="تعديل البيانات"
                                color="brown"
                                onClick={onEdit}
                                icon={<EditIcon />}
                            />
                            {!user.is_self && (
                                <ActionIcon
                                    label="حذف المستخدم"
                                    color="rose"
                                    onClick={onDelete}
                                    icon={<TrashIcon />}
                                />
                            )}
                        </>
                    )}
                </div>
            </td>
        </tr>
    );
}

/* ═══════════════════════════════════════════════
   RequestInfo — تفاصيل طلب الانضمام (النوع + الباقة + المطالبة)
   ═══════════════════════════════════════════════ */
const INTENT_META: Record<string, { label: string; cls: string }> = {
    member:      { label: 'عضو',          cls: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    found_tribe: { label: 'تأسيس قبيلة',  cls: 'bg-gold-soft text-brown-dark border-gold/40' },
    claim_admin: { label: 'مطالبة بالإدارة', cls: 'bg-amber-100 text-amber-800 border-amber-300' },
};

function timeAgo(iso: string | null): string {
    if (!iso) return 'لا نشاط مسجّل';
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86400000);
    if (days >= 30) return `منذ ${Math.floor(days / 30)} شهر`;
    if (days >= 1) return `منذ ${days} يوم`;
    const hours = Math.floor(diff / 3600000);
    if (hours >= 1) return `منذ ${hours} ساعة`;
    return 'نشِط الآن';
}

function RequestInfo({ user }: { readonly user: UserRow }) {
    const intent = user.join_intent ?? 'member';
    const meta = INTENT_META[intent];

    return (
        <div className="mt-1.5 flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-1.5">
                <span className={`inline-block px-2 py-0.5 rounded-full border text-[10px] font-bold ${meta.cls}`}>
                    {meta.label}
                </span>
                {user.requested_package && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold-soft/50 border border-gold/30 text-brown-dark text-[10px] font-bold">
                        <PackageIcon className="w-3 h-3" />
                        {user.requested_package.name_ar}
                        {user.requested_package.price_monthly > 0
                            ? ` — ${user.requested_package.price_monthly.toLocaleString('en-US')} ${user.requested_package.currency}/شهر`
                            : ' — مجانًا'}
                    </span>
                )}
            </div>

            {intent === 'claim_admin' && (
                <div className="text-[11px] bg-amber-50 border border-amber-200 rounded-lg p-2 text-amber-900 leading-relaxed max-w-sm">
                    <div className="flex items-center gap-1.5 font-bold mb-0.5">
                        <AlertTriangleIcon className="w-3.5 h-3.5" /> طلب نقل إدارة
                    </div>
                    {user.current_admins.length > 0 ? (
                        user.current_admins.map((a) => (
                            <div key={a.name} className="flex items-center gap-1.5">
                                <ClockIcon className="w-3.5 h-3.5 shrink-0" />
                                المدير الحالي «{a.name}» — آخر نشاط: <strong>{timeAgo(a.last_active_at)}</strong>
                            </div>
                        ))
                    ) : (
                        <div>لا يوجد مدير حالي مسجّل لهذه القبيلة.</div>
                    )}
                    {user.claim_reason && <div className="mt-1 text-amber-800">السبب: {user.claim_reason}</div>}
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════
   ActionIcon — زر أيقونة بـ tooltip
   ═══════════════════════════════════════════════ */
function ActionIcon({
    label,
    icon,
    onClick,
    color,
}: {
    readonly label: string;
    readonly icon: React.ReactNode;
    readonly onClick: () => void;
    readonly color: 'brown' | 'emerald' | 'rose' | 'gold';
}) {
    const btnRef = useRef<HTMLButtonElement>(null);
    const [tipPos, setTipPos] = useState<{ x: number; y: number } | null>(null);

    const colorClasses = {
        brown: 'text-brown-mid hover:text-white hover:bg-brown-mid',
        emerald: 'text-emerald-600 hover:text-white hover:bg-emerald-600',
        rose: 'text-rose-600 hover:text-white hover:bg-rose-600',
        gold: 'text-gold hover:text-white hover:bg-gold',
    }[color];

    const showTooltip = () => {
        if (!btnRef.current) return;
        const rect = btnRef.current.getBoundingClientRect();
        setTipPos({
            x: rect.left + rect.width / 2,
            y: rect.bottom + 6,
        });
    };

    return (
        <>
            <button
                ref={btnRef}
                type="button"
                onClick={onClick}
                onMouseEnter={showTooltip}
                onMouseLeave={() => setTipPos(null)}
                onFocus={showTooltip}
                onBlur={() => setTipPos(null)}
                aria-label={label}
                className={`w-9 h-9 rounded-lg border border-transparent transition-all flex items-center justify-center ${colorClasses}`}
            >
                {icon}
            </button>

            {tipPos && createPortal(
                <span
                    style={{
                        position: 'fixed',
                        top: tipPos.y,
                        left: tipPos.x,
                        transform: 'translateX(-50%)',
                        zIndex: 9999,
                    }}
                    className="px-2 py-1 bg-brown-dark text-white text-[10px] font-medium rounded whitespace-nowrap shadow-lg pointer-events-none animate-fadeIn"
                >
                    {label}
                </span>,
                document.body,
            )}
        </>
    );
}

/* ═══════════════════════════════════════════════
   أيقونات SVG
   ═══════════════════════════════════════════════ */
function EditIcon() {
    return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
    );
}
function TrashIcon() {
    return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
    );
}
function PhotoIcon() {
    return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    );
}
function CheckIcon() {
    return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
    );
}
function XIcon() {
    return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
    );
}

function TabButton({
    active,
    onClick,
    badge,
    children,
}: {
    readonly active: boolean;
    readonly onClick: () => void;
    readonly badge?: number;
    readonly children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`
                inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all
                ${active
                    ? 'bg-gold text-white shadow-md'
                    : 'bg-white text-brown-mid border border-gold/20 hover:bg-beige'
                }
            `}
        >
            <span>{children}</span>
            {badge !== undefined && badge > 0 && (
                <span className={`min-w-[22px] h-[22px] px-1.5 rounded-full text-xs font-bold flex items-center justify-center ${
                    active ? 'bg-white/25' : 'bg-rose-500 text-white'
                }`}>
                    {badge}
                </span>
            )}
        </button>
    );
}

/* ═══════════════════════════════════════════════
   Delete Confirm Modal
   ═══════════════════════════════════════════════ */
function DeleteUserConfirm({ user, onClose }: { readonly user: UserRow; readonly onClose: () => void }) {
    const [processing, setProcessing] = useState(false);

    const handleDelete = () => {
        setProcessing(true);
        router.delete(route('admin.users.destroy', user.id), {
            preserveScroll: true,
            onSuccess: () => onClose(),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brown-dark/50 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-white dark:bg-night-card rounded-2xl shadow-2xl max-w-md w-full p-6" dir="rtl">
                <div className="text-center mb-4">
                    <div className="text-4xl mb-2">⚠️</div>
                    <h2 className="text-lg font-bold text-brown-dark mb-2">حذف المستخدم</h2>
                    <p className="text-brown-mid text-sm leading-relaxed">
                        هل أنت متأكد من حذف <strong>"{user.name}"</strong>؟
                        <br />
                        ستُحذف بياناته نهائياً مع صورة بطاقته. هذه العملية لا يمكن التراجع عنها.
                    </p>
                </div>
                <div className="flex gap-3 justify-end pt-4 border-t border-gold/10">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 bg-white text-brown-mid border border-gold/20 rounded-xl font-medium hover:bg-beige"
                    >
                        إلغاء
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={processing}
                        className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md disabled:opacity-50 transition-all"
                    >
                        {processing ? 'جاري الحذف...' : '🗑️ احذف نهائياً'}
                    </button>
                </div>
            </div>
        </div>
    );
}
