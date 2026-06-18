/**
 * ═══════════════════════════════════════════════════════════════════
 *  Nasab — Core TypeScript Types
 *  جميع أنواع البيانات المشتركة بين Laravel وReact عبر Inertia
 * ═══════════════════════════════════════════════════════════════════
 */

/* ───────────── Primitives ───────────── */

export type Gender = 'male' | 'female';

export type LifeStatus = 'living' | 'deceased' | 'unknown';

export type PersonStatus = 'approved' | 'pending' | 'rejected';

export type RelationshipStatus = 'approved' | 'pending';

export type UserRole =
    | 'super_admin'
    | 'tribe_admin'
    | 'moderator'
    | 'member'
    | 'viewer';

export type SubscriptionPlan = 'free' | 'pro' | 'enterprise';

export type PendingEditStatus = 'pending' | 'approved' | 'rejected';

export type PendingEditType =
    | 'add_person'
    | 'edit_person'
    | 'add_relationship'
    | 'edit_relationship'
    | 'add_marriage'
    | 'edit_marriage'
    | 'delete';

/* ───────────── Entities ───────────── */

export interface Tribe {
    id: number;
    name_ar: string;
    name_en: string | null;
    slug: string;
    logo: string | null;
    cover_image?: string | null;
    theme_color: string;
    root_person_id: number | null;
    description_ar?: string | null;
    description_en?: string | null;
    is_active?: boolean;
    subscription_plan?: SubscriptionPlan;
}

export interface Person {
    id: number;
    tribe_id: number;
    name_ar: string;
    name_en?: string | null;
    short_name_ar: string;
    gender: Gender;
    title?: string | null;
    birth_year?: number | null;
    death_year?: number | null;
    life_status?: LifeStatus;
    birth_place?: string | null;
    death_place?: string | null;
    photo?: string | null;
    bio_ar?: string | null;
    bio_en?: string | null;
    status: PersonStatus;

    father?: Person | null;
    mother?: Person | null;
    children?: Person[];
    marriages?: Marriage[];
    children_count?: number;
}

export interface Marriage {
    id: number;
    tribe_id: number;
    husband_id: number;
    wife_id: number;
    wife?: Person;
    husband?: Person;
    marriage_order: number;
    marriage_year?: number | null;
    divorce_year?: number | null;
    is_current: boolean;
    status: RelationshipStatus;
}

export interface ParentChild {
    id: number;
    tribe_id: number;
    father_id: number | null;
    mother_id: number | null;
    child_id: number;
    father?: Person | null;
    mother?: Person | null;
    child?: Person;
    status: RelationshipStatus;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    tribe_id: number | null;
    linked_person_id: number | null;
    can_moderate: boolean;
    can_edit: boolean;
    email_verified_at?: string | null;
}

export interface PendingEdit {
    id: number;
    tribe_id: number;
    edit_type: PendingEditType;
    target_id: number | null;
    proposed_data: Record<string, unknown>;
    requested_by: number;
    requester?: User;
    status: PendingEditStatus;
    reviewer_id: number | null;
    reviewer?: User | null;
    reviewer_note: string | null;
    reviewed_at: string | null;
    created_at: string;
}

/* ───────────── Packages ───────────── */

export interface Package {
    id: number;
    name_ar: string;
    slug: string;
    description_ar: string | null;
    price_monthly: number;
    price_yearly: number;
    currency: string;
    features: string[];
    max_persons: number | null;
    max_members: number | null;
    color: string;
    is_featured: boolean;
    is_active: boolean;
    sort_order: number;
    tribes_count?: number;
}

/* ───────────── Feedback ───────────── */

export type FeedbackType = 'idea' | 'bug';

export type FeedbackStatus = 'new' | 'in_review' | 'resolved';

export interface Feedback {
    id: number;
    type: FeedbackType;
    message: string;
    screenshot: string | null;
    page_url: string | null;
    status: FeedbackStatus;
    admin_note: string | null;
    created_at: string | null;
    user: { id: number; name: string; email: string } | null;
    tribe: { id: number; name_ar: string; slug: string } | null;
}

/* ───────────── Inertia Page Props ───────────── */

export interface FlashMessages {
    success?: string;
    error?: string;
    info?: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User | null;
    };
    tribe: Tribe | null;
    flash: FlashMessages;
    pending_count: number;
    feedback_new_count: number;
};

/* ───────────── React Flow Tree Types ───────────── */

export interface PersonNodeData extends Record<string, unknown> {
    id: number;
    name_ar: string;
    short_name_ar: string;
    gender: Gender;
    title?: string | null;
    photo?: string | null;
    children_count: number;
    is_expanded: boolean;
    birth_year?: number | null;
    death_year?: number | null;
    life_status?: LifeStatus;
}

/* ───────────── Landing Sections ───────────── */

export type LandingSectionType =
    | 'hero'
    | 'about'
    | 'quote'
    | 'features'
    | 'text'
    | 'cta';

export interface LandingFeatureItem {
    icon?: string;
    title?: string;
    body?: string;
}

export interface LandingSectionExtra {
    primary_label?: string;
    primary_action?: string;
    secondary_label?: string;
    secondary_action?: string;
    source?: string;
    items?: LandingFeatureItem[];
}

export interface LandingSection {
    id: number;
    type: LandingSectionType;
    title: string | null;
    subtitle: string | null;
    body: string | null;
    icon: string | null;
    extra: LandingSectionExtra | null;
    sort_order?: number;
    is_visible?: boolean;
}

/* ───────────── Kinship ───────────── */

export interface KinshipResult {
    common_ancestor: Person | null;
    depth_a: number;
    depth_b: number;
    relation_label: string;
}

/* ───────────── Pagination ───────────── */

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: PaginationLink[];
}
