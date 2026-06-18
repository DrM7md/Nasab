import BackButton from '@/Components/UI/BackButton';
import ThemeToggle from '@/Components/UI/ThemeToggle';
import type { Gender, PageProps } from '@/types';
import { Head } from '@inertiajs/react';

interface CertPerson {
    id: number;
    short_name_ar: string;
    name_ar: string;
    gender: Gender;
    title: string | null;
    birth_year: number | null;
    death_year: number | null;
    birth_place: string | null;
    death_place: string | null;
    photo: string | null;
}

interface ChainEntry {
    id: number;
    short_name_ar: string;
    gender: Gender;
    title: string | null;
}

type ShowProps = PageProps<{
    person: CertPerson;
    chain: ChainEntry[];
    formattedLineage: string;
    issueDate: string;
}>;

export default function CertificateShow({
    person,
    chain,
    issueDate,
    tribe,
}: ShowProps) {
    const tribeSlug = tribe?.slug ?? '';
    const pdfUrl = `/tribes/${tribeSlug}/certificate/${person.id}/pdf`;
    const inlineUrl = `/tribes/${tribeSlug}/certificate/${person.id}/inline`;

    return (
        <>
            <Head title={`وثيقة نسب — ${person.short_name_ar}`} />

            <div className="landing-bg page-enter min-h-screen py-6 sm:py-10 print:py-0">
                <div className="max-w-4xl mx-auto px-4 print:px-0 print:max-w-none">
                    {/* أزرار التحكم — لا تُطبع */}
                    <div className="print:hidden">
                        <div className="flex items-center justify-between mb-0">
                            <BackButton
                                href={`/tribes/${tribeSlug}/persons/${person.id}`}
                                label="العودة لملف الشخص"
                            />
                            <ThemeToggle />
                        </div>

                        <div className="flex flex-wrap gap-3 mb-6">
                            <a
                                href={pdfUrl}
                                className="ns-btn inline-flex items-center gap-2 px-5 py-2.5 bg-gold text-white rounded-xl font-semibold shadow-[0_8px_22px_rgba(139,105,20,0.28)] hover:bg-[#79540f]"
                            >
                                <svg className="relative z-10 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                <span className="relative z-10">تحميل PDF</span>
                            </a>

                            <a
                                href={inlineUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-night-card text-brown-dark border border-gold/30 rounded-xl font-medium hover:bg-gold-soft transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                معاينة PDF
                            </a>

                            <button
                                type="button"
                                onClick={() => globalThis.print()}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-night-card text-brown-dark border border-gold/30 rounded-xl font-medium hover:bg-gold-soft transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                طباعة
                            </button>
                        </div>
                    </div>

                    {/* الوثيقة — نسخة مرئية مطابقة للـ PDF */}
                    <CertificateFrame
                        person={person}
                        chain={chain}
                        issueDate={issueDate}
                        tribeName={tribe?.name_ar ?? ''}
                    />
                </div>
            </div>

            {/* أنماط الطباعة */}
            <style>{`
                @media print {
                    body { background: white !important; }
                    @page { margin: 1cm; }
                }
            `}</style>
        </>
    );
}

function CertificateFrame({
    person,
    chain,
    issueDate,
    tribeName,
}: {
    person: CertPerson;
    chain: ChainEntry[];
    issueDate: string;
    tribeName: string;
}) {
    return (
        <div
            className="relative bg-[#FBF8F0] shadow-2xl print:shadow-none p-8 sm:p-12 mx-auto"
            style={{
                border: '8px double #8B6914',
                minHeight: '297mm',          // A4 portrait — يتوسّع عمودياً لو زاد المحتوى
                maxWidth: '210mm',
            }}
            dir="rtl"
        >
            {/* الإطار الداخلي */}
            <div
                className="absolute inset-2 pointer-events-none"
                style={{ border: '2px solid #C9A84C' }}
            />

            {/* زخارف الأركان */}
            <div className="absolute top-3 right-5 text-4xl text-gold-light">❖</div>
            <div className="absolute top-3 left-5 text-4xl text-gold-light">❖</div>
            <div className="absolute bottom-3 right-5 text-4xl text-gold-light">❖</div>
            <div className="absolute bottom-3 left-5 text-4xl text-gold-light">❖</div>

            <div className="relative h-full flex flex-col">
                {/* رأس الوثيقة */}
                <div className="text-center pb-4 border-b-[3px] border-gold mb-6">
                    <div className="text-3xl text-gold-light tracking-[8px] mb-2">﴾ ❁ ﴿</div>
                    <h1
                        className="font-bold text-gold"
                        style={{ fontSize: '32pt', letterSpacing: '4px' }}
                    >
                        وَثيقَةُ نَسَب
                    </h1>
                    <div className="text-brown-mid font-bold mt-2 text-lg">
                        قبيلة {tribeName}
                    </div>
                </div>

                {/* المقدمة */}
                <p className="text-center text-brown-mid text-lg mb-4">
                    نشهد بتوثيق نسب الشخص الكريم:
                </p>

                <div
                    className="text-center text-4xl font-bold text-brown-dark my-4 py-5 bg-beige rounded-lg"
                    style={{ border: '2px dashed #C9A84C' }}
                >
                    {person.short_name_ar}
                </div>

                {person.title && (
                    <div className="text-center text-gold text-lg mb-6">
                        {person.title}
                    </div>
                )}

                {/* السلسلة */}
                <div className="my-6">
                    <div className="text-center text-brown-mid font-bold mb-3">
                        سلسلة النسب الشريف
                    </div>
                    <div
                        className="flex flex-wrap items-baseline justify-center gap-x-3 gap-y-2 text-2xl sm:text-3xl font-bold text-brown-dark leading-loose py-5 px-4 rounded-lg"
                        style={{
                            background: 'linear-gradient(to bottom, #FFFFFF, #F5EFE6)',
                            border: '1px solid #C9A84C',
                        }}
                    >
                        {chain.flatMap((p, index) => {
                            const items: React.ReactNode[] = [];
                            if (index > 0) {
                                const connector =
                                    chain[index - 1].gender === 'female' ? 'بنت' : 'بن';
                                items.push(
                                    <span
                                        key={`c-${p.id}`}
                                        className="text-gold-light text-xl whitespace-nowrap"
                                    >
                                        {connector}
                                    </span>,
                                );
                            }
                            items.push(
                                <span key={`n-${p.id}`} className="whitespace-nowrap">
                                    {p.short_name_ar}
                                </span>,
                            );
                            return items;
                        })}
                    </div>
                </div>

                {/* التواريخ */}
                {(person.birth_year || person.death_year) && (
                    <div className="flex flex-wrap justify-center gap-3 my-4 text-brown-mid text-sm">
                        {person.birth_year && (
                            <span
                                className="px-4 py-1.5 bg-white rounded-full"
                                style={{ border: '1px solid #C9A84C' }}
                            >
                                الميلاد: {person.birth_year}
                                {person.birth_place && ` — ${person.birth_place}`}
                            </span>
                        )}
                        {person.death_year && (
                            <span
                                className="px-4 py-1.5 bg-white rounded-full"
                                style={{ border: '1px solid #C9A84C' }}
                            >
                                الوفاة: {person.death_year}
                                {person.death_place && ` — ${person.death_place}`}
                            </span>
                        )}
                    </div>
                )}

                {/* التذييل مع الختم */}
                <div className="mt-auto pt-4 border-t-2 border-gold text-center">
                    <div
                        className="inline-block w-20 h-20 rounded-full text-gold bg-beige mb-2 flex items-center justify-center text-4xl"
                        style={{ border: '3px solid #8B6914' }}
                    >
                        ⚜
                    </div>
                    <div className="text-brown-mid font-bold">
                        ختم قبيلة {tribeName}
                    </div>
                    <div className="text-brown-light text-xs mt-1 font-mono">
                        صدرت في: {issueDate}
                    </div>
                </div>
            </div>
        </div>
    );
}
