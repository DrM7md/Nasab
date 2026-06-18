import KinshipResult, { type KinshipResponse } from '@/Components/Search/KinshipResult';
import PersonSearchBox, { type PersonSuggestion } from '@/Components/Search/PersonSearchBox';
import BackButton from '@/Components/UI/BackButton';
import { Button } from '@/Components/UI/Button';
import { ArrowLeftIcon, KinshipIcon, SearchIcon } from '@/Components/UI/Icons';
import ThemeToggle from '@/Components/UI/ThemeToggle';
import type { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

type Tab = 'search' | 'kinship';

export default function SearchIndex({ tribe }: PageProps) {
    const tribeSlug = tribe?.slug ?? '';
    const [tab, setTab] = useState<Tab>('search');

    return (
        <>
            <Head title="البحث وصلة القرابة" />

            <div className="landing-bg page-enter min-h-screen">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                    <div className="flex items-center justify-between mb-0">
                        <BackButton href={`/tribes/${tribeSlug}/tree`} label="العودة للشجرة" />
                        <ThemeToggle />
                    </div>

                    <h1 className="font-amiri text-2xl sm:text-[30px] font-bold text-brown-dark mb-6 flex items-center gap-3">
                        <span className="w-11 h-11 rounded-2xl bg-gold-soft/50 border border-gold/20 text-gold flex items-center justify-center">
                            <SearchIcon />
                        </span>
                        <span>البحث وصلة القرابة</span>
                    </h1>

                    {/* تبويبات */}
                    <div className="flex gap-2 mb-6 p-1 bg-white/70 dark:bg-night-card/70 backdrop-blur-md rounded-2xl border border-gold/20 shadow-sm">
                        <TabButton
                            active={tab === 'search'}
                            onClick={() => setTab('search')}
                        >
                            بحث بالاسم
                        </TabButton>
                        <TabButton
                            active={tab === 'kinship'}
                            onClick={() => setTab('kinship')}
                        >
                            صلة القرابة
                        </TabButton>
                    </div>

                    {tab === 'search'
                        ? <SearchTab tribeSlug={tribeSlug} />
                        : <KinshipTab tribeSlug={tribeSlug} />
                    }
                </div>
            </div>
        </>
    );
}

function TabButton({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`
                flex-1 px-4 py-2.5 rounded-xl font-medium text-sm transition-all
                ${active
                    ? 'bg-gold text-white shadow-md'
                    : 'text-brown-mid hover:bg-white/60'
                }
            `}
        >
            {children}
        </button>
    );
}

/* ═════════ تبويب البحث الفردي ═════════ */
function SearchTab({ tribeSlug }: { tribeSlug: string }) {
    const [selected, setSelected] = useState<PersonSuggestion | null>(null);

    return (
        <div className="space-y-4">
            <div className="bg-white dark:bg-night-card rounded-2xl p-4 sm:p-6 shadow-sm border border-gold/15">
                <label className="block text-brown-mid text-sm font-medium mb-2">
                    اكتب اسم الشخص للبحث
                </label>
                <PersonSearchBox
                    tribeSlug={tribeSlug}
                    placeholder="مثال: سلطان"
                    selected={selected}
                    onSelect={setSelected}
                    onClear={() => setSelected(null)}
                />
            </div>

            {selected && (
                <Link
                    href={`/tribes/${tribeSlug}/persons/${selected.id}`}
                    className="ns-btn flex items-center justify-center gap-2 w-full p-5 bg-gold text-white text-center rounded-2xl shadow-[0_8px_22px_rgba(139,105,20,0.28)] hover:bg-[#79540f] font-bold"
                >
                    <span className="relative z-10">فتح ملف {selected.short_name_ar}</span>
                    <ArrowLeftIcon className="relative z-10 w-5 h-5" />
                </Link>
            )}
        </div>
    );
}

/* ═════════ تبويب صلة القرابة ═════════ */
function KinshipTab({ tribeSlug }: { tribeSlug: string }) {
    const [personA, setPersonA] = useState<PersonSuggestion | null>(null);
    const [personB, setPersonB] = useState<PersonSuggestion | null>(null);
    const [result, setResult] = useState<KinshipResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canSearch = personA && personB && personA.id !== personB.id;

    const handleFind = async () => {
        if (!canSearch) return;
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await fetch(
                `/tribes/${tribeSlug}/kinship?a=${personA.id}&b=${personB.id}`,
                { headers: { Accept: 'application/json' } },
            );
            if (!res.ok) throw new Error('فشل الطلب');
            const data = (await res.json()) as KinshipResponse;
            setResult(data);
        } catch {
            setError('حدث خطأ في البحث عن صلة القرابة');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setPersonA(null);
        setPersonB(null);
        setResult(null);
        setError(null);
    };

    return (
        <div className="space-y-4">
            <div className="bg-white dark:bg-night-card rounded-2xl p-4 sm:p-6 shadow-sm border border-gold/15 space-y-4">
                <div>
                    <label className="block text-brown-mid text-sm font-medium mb-2">
                        الشخص الأول
                    </label>
                    <PersonSearchBox
                        tribeSlug={tribeSlug}
                        placeholder="ابحث عن الشخص الأول..."
                        selected={personA}
                        onSelect={setPersonA}
                        onClear={() => setPersonA(null)}
                    />
                </div>

                <div className="flex items-center gap-3 justify-center text-gold">
                    <div className="flex-1 h-px bg-gold/30" />
                    <KinshipIcon className="w-6 h-6" />
                    <div className="flex-1 h-px bg-gold/30" />
                </div>

                <div>
                    <label className="block text-brown-mid text-sm font-medium mb-2">
                        الشخص الثاني
                    </label>
                    <PersonSearchBox
                        tribeSlug={tribeSlug}
                        placeholder="ابحث عن الشخص الثاني..."
                        selected={personB}
                        onSelect={setPersonB}
                        onClear={() => setPersonB(null)}
                    />
                </div>

                {personA && personB && personA.id === personB.id && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm text-center">
                        يجب اختيار شخصين مختلفين
                    </div>
                )}

                <div className="flex gap-3">
                    <Button onClick={handleFind} disabled={!canSearch || loading} className="flex-1">
                        {loading ? 'جاري البحث...' : 'أظهر صلة القرابة'}
                    </Button>

                    {(personA || personB || result) && (
                        <Button variant="ghost" onClick={handleReset}>مسح</Button>
                    )}
                </div>
            </div>

            {error && (
                <div className="p-4 bg-rose-50 border-2 border-rose-200 rounded-2xl text-rose-700 text-center">
                    {error}
                </div>
            )}

            {result && <KinshipResult result={result} tribeSlug={tribeSlug} />}
        </div>
    );
}
