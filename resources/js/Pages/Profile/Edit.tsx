import { AlertTriangleIcon, LockIcon, UserIcon } from '@/Components/UI/Icons';
import PageHeader from '@/Components/UI/PageHeader';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    icon={<UserIcon />}
                    title="الملف الشخصي"
                    subtitle="إعدادات حسابك وكلمة المرور"
                />
            }
        >
            <Head title="الملف الشخصي" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
                <Section icon={<UserIcon />} title="المعلومات الشخصية">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        className="max-w-xl"
                    />
                </Section>

                <Section icon={<LockIcon />} title="كلمة المرور">
                    <UpdatePasswordForm className="max-w-xl" />
                </Section>

                <Section icon={<AlertTriangleIcon />} title="حذف الحساب" danger>
                    <DeleteUserForm className="max-w-xl" />
                </Section>
            </div>
        </AuthenticatedLayout>
    );
}

function Section({
    icon,
    title,
    danger,
    children,
}: {
    readonly icon: ReactNode;
    readonly title: string;
    readonly danger?: boolean;
    readonly children: ReactNode;
}) {
    return (
        <section
            className={`bg-white dark:bg-night-card p-6 sm:p-8 rounded-2xl shadow-sm border ${
                danger ? 'border-rose-200 dark:border-rose-900/40' : 'border-gold/15'
            }`}
        >
            <h2
                className={`flex items-center gap-2.5 text-lg font-bold mb-5 pb-3 border-b ${
                    danger
                        ? 'text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-900/30'
                        : 'text-brown-dark border-gold/10'
                }`}
            >
                <span className={danger ? 'text-rose-500' : 'text-gold'}>{icon}</span>
                <span>{title}</span>
            </h2>
            {children}
        </section>
    );
}
