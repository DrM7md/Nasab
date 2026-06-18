import ThemeToggle from '@/Components/UI/ThemeToggle';
import { CheckIcon, PackageIcon, StarIcon } from '@/Components/UI/Icons';
import { COUNTRIES, CURRENCY_LABEL, type Country, detectCountry, formatPrice } from '@/lib/currency';
import type { Package, PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

type WelcomeProps = PageProps<{ packages: Package[] }>;

/**
 * Welcome — صفحة الجذر (Landing) لمنصّة نَسَب.
 * أُعيد بناؤها لتطابق تصميم "Landing - الجذر" بمكوّنات React/Tailwind وأنماط المشروع.
 */
export default function Welcome({ auth, tribe, packages = [] }: WelcomeProps) {
    const treeHref = tribe ? `/tribes/${tribe.slug}/tree` : null;
    const heroHref = treeHref ?? (auth.user ? route('dashboard') : route('register'));
    const registerHref = auth.user ? route('dashboard') : route('register');

    return (
        <>
            <Head title="نَسَب — منصّة توثيق الأنساب القبلية" />

            <div className="landing-bg page-enter min-h-screen overflow-x-hidden text-brown-dark">
                <NavBar auth={auth} treeHref={treeHref} hasPricing={packages.length > 0} />
                <Hero heroHref={heroHref} />
                <Stats />
                <Features />
                {packages.length > 0 && <Pricing packages={packages} registerHref={registerHref} />}
                <CtaBand registerHref={registerHref} />
                <Footer />
            </div>
        </>
    );
}

/* ═══════════════════════════════════════════════
   شريط التنقّل
   ═══════════════════════════════════════════════ */
function NavBar({
    auth,
    treeHref,
    hasPricing,
}: {
    readonly auth: PageProps['auth'];
    readonly treeHref: string | null;
    readonly hasPricing: boolean;
}) {
    return (
        <header className="landing-nav sticky top-0 z-30 backdrop-blur-md border-b border-gold/15">
            <div className="max-w-[1180px] mx-auto flex items-center justify-between px-5 sm:px-10 py-4">
                {/* الشعار */}
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-[38px] h-[38px] rounded-[11px] border-[1.5px] border-gold flex items-center justify-center text-gold text-[22px] font-bold font-amiri">
                        ن
                    </div>
                    <span className="font-bold text-[19px] tracking-wide text-brown-dark">
                        نَسَب
                    </span>
                </Link>

                {/* روابط القائمة */}
                <nav className="hidden md:flex items-center gap-8 text-[14.5px] font-medium text-brown-mid">
                    <a href="#features" className="ns-link">الشجرة</a>
                    <a href="#stats" className="ns-link">القبائل</a>
                    {hasPricing && <a href="#pricing" className="ns-link">الأسعار</a>}
                    <a href="#cta" className="ns-link">عن المنصّة</a>
                </nav>

                {/* الإجراءات */}
                <div className="flex items-center gap-3.5">
                    <ThemeToggle />
                    {auth.user ? (
                        <Link
                            href={treeHref ?? route('dashboard')}
                            className="ns-btn text-[14px] font-semibold text-white bg-gold px-[22px] py-2.5 rounded-[10px] shadow-[0_4px_14px_rgba(139,105,20,0.25)] hover:bg-[#79540f]"
                        >
                            <span className="relative z-10">لوحة التحكم</span>
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={route('login')}
                                className="ns-link hidden sm:inline text-[14.5px] font-medium text-brown-mid"
                            >
                                دخول
                            </Link>
                            <Link
                                href={route('register')}
                                className="ns-btn text-[14px] font-semibold text-white bg-gold px-[22px] py-2.5 rounded-[10px] shadow-[0_4px_14px_rgba(139,105,20,0.25)] hover:bg-[#79540f]"
                            >
                                <span className="relative z-10">إنشاء حساب</span>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

/* ═══════════════════════════════════════════════
   الواجهة (Hero)
   ═══════════════════════════════════════════════ */
function Hero({ heroHref }: { readonly heroHref: string }) {
    return (
        <section className="relative max-w-[1180px] mx-auto px-5 sm:px-10 pt-10 pb-[70px] overflow-hidden">
            {/* كوكبة خلفية منجرفة باهتة */}
            <BackgroundConstellation />

            <div className="relative flex flex-wrap items-center gap-12 pt-9">
                {/* النص */}
                <div className="flex-1 basis-[420px]">
                    <div
                        className="inline-flex items-center gap-2 text-[13px] tracking-[0.14em] text-gold font-semibold border border-gold/30 px-3.5 py-1.5 rounded-full"
                        style={{ animation: 'nsFadeUp .6s ease-out both' }}
                    >
                        منصّة توثيق الأنساب القبلية
                    </div>

                    <h1
                        className="font-amiri font-bold text-brown-dark mt-6 leading-[1.25]"
                        style={{
                            fontSize: 'clamp(40px, 5.2vw, 64px)',
                            animation: 'nsFadeUp .7s ease-out .12s both',
                        }}
                    >
                        نَسَبٌ يُروى،
                        <br />
                        وجذرٌ لا يُنسى
                    </h1>

                    <p
                        className="text-brown-mid leading-[1.9] max-w-[460px] mt-[22px]"
                        style={{
                            fontSize: 'clamp(16px, 1.6vw, 18px)',
                            animation: 'nsFadeUp .7s ease-out .24s both',
                        }}
                    >
                        وثّق شجرة قبيلتك بدقّة علمية وتجربة بصرية تجمع الأجيال — من الجدّ
                        الأول إلى آخر مولود، في كوكبةٍ واحدة من الأسماء.
                    </p>

                    <div
                        className="flex flex-wrap gap-3.5 mt-[34px]"
                        style={{ animation: 'nsFadeUp .7s ease-out .36s both' }}
                    >
                        <Link
                            href={heroHref}
                            className="ns-btn inline-flex items-center gap-2.5 text-[15px] font-semibold text-white bg-gold px-[30px] py-3.5 rounded-xl shadow-[0_8px_22px_rgba(139,105,20,0.28)] hover:shadow-[0_16px_34px_rgba(139,105,20,0.42)] hover:bg-[#79540f]"
                        >
                            <span className="relative z-10">استكشف الشجرة</span>
                            <ChevronIcon className="relative z-10" />
                        </Link>
                    </div>
                </div>

                {/* اللوحة البصرية: شبكة نسب */}
                <div
                    className="flex-1 basis-[380px] flex justify-center"
                    style={{ animation: 'nsFadeUp .8s ease-out .2s both' }}
                >
                    <div
                        className="landing-visual relative w-full max-w-[440px] rounded-3xl border border-gold/15 shadow-[0_22px_50px_rgba(60,43,31,0.1)]"
                        style={{ aspectRatio: '1.15 / 1' }}
                    >
                        <ConstellationNetwork />
                    </div>
                </div>
            </div>
        </section>
    );
}

function BackgroundConstellation() {
    const stars: Array<[number, number, number, number, number]> = [
        [90, 80, 2.5, 4, 0],
        [240, 160, 3, 3.4, 0.6],
        [160, 300, 2, 3, 1.2],
        [420, 110, 2.5, 4.4, 0.3],
        [980, 120, 3, 3.8, 0.9],
        [1080, 230, 2.5, 3.2, 1.5],
        [1000, 360, 2, 4, 0.2],
        [880, 60, 2.5, 3.6, 1.1],
    ];
    return (
        <svg
            viewBox="0 0 1180 560"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full opacity-50 pointer-events-none"
            style={{ animation: 'nsDrift 16s ease-in-out infinite' }}
            aria-hidden="true"
        >
            <g stroke="#C9A84C" strokeWidth={1} fill="none" opacity={0.25}>
                <path d="M90 80 L240 160 L160 300 M240 160 L420 110 M980 120 L1080 230 M1080 230 L1000 360 M980 120 L880 60" />
            </g>
            {stars.map(([cx, cy, r, dur, delay]) => (
                <circle
                    key={`${cx}-${cy}`}
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill="#C9A84C"
                    style={{ animation: `nsTwinkle ${dur}s ease-in-out ${delay}s infinite` }}
                />
            ))}
        </svg>
    );
}

function ConstellationNetwork() {
    const leaf: Array<[number, number, number]> = [
        [70, 280, 1.3],
        [180, 280, 1.4],
        [270, 280, 1.5],
        [370, 280, 1.6],
    ];
    return (
        <svg
            viewBox="0 0 440 380"
            className="absolute inset-0 w-full h-full"
            style={{ overflow: 'visible', animation: 'nsFloat 7s ease-in-out infinite' }}
            aria-hidden="true"
        >
            {/* خطوط تُرسم تدريجيًا */}
            <path
                d="M220 70 L120 160 M220 70 L320 160 M120 160 L70 280 M120 160 L180 280 M320 160 L270 280 M320 160 L370 280 M220 70 L220 30"
                stroke="#C9A84C"
                strokeWidth={1.5}
                fill="none"
                strokeLinecap="round"
                opacity={0.85}
                style={{ strokeDasharray: 640, animation: 'nsDraw 1.8s ease-out .3s both' }}
            />

            {/* نجوم متلألئة */}
            {([[60, 70, 2.5, 3.5, 0], [390, 90, 2, 4, 0.7], [400, 320, 2.5, 3, 1.3], [40, 320, 2, 3.8, 0.4]] as Array<[number, number, number, number, number]>).map(
                ([cx, cy, r, dur, delay]) => (
                    <circle
                        key={`${cx}-${cy}`}
                        cx={cx}
                        cy={cy}
                        r={r}
                        fill="#C9A84C"
                        style={{ animation: `nsTwinkle ${dur}s ease-in-out ${delay}s infinite` }}
                    />
                ),
            )}

            {/* حلقة نبض حول الجذر */}
            <circle
                cx={220}
                cy={70}
                r={22}
                fill="none"
                stroke="#8B6914"
                strokeWidth={1.5}
                style={{ transformOrigin: '220px 70px', animation: 'nsPulse 3s ease-out infinite' }}
            />

            {/* عقدة الجذر */}
            <g style={{ transformOrigin: '220px 70px', animation: 'nsPop .5s cubic-bezier(.2,.8,.2,1) .5s both' }}>
                <circle cx={220} cy={70} r={22} fill="#8B6914" />
                <text x={220} y={78} textAnchor="middle" fontFamily="Amiri, serif" fontSize={20} fill="#fff">
                    ن
                </text>
            </g>

            {/* عقدتا الجيل الثاني */}
            <g style={{ transformOrigin: '120px 160px', animation: 'nsPop .5s cubic-bezier(.2,.8,.2,1) .9s both' }}>
                <circle cx={120} cy={160} r={16} fill="#fff" stroke="#8B6914" strokeWidth={1.6} />
            </g>
            <g style={{ transformOrigin: '320px 160px', animation: 'nsPop .5s cubic-bezier(.2,.8,.2,1) 1s both' }}>
                <circle cx={320} cy={160} r={16} fill="#fff" stroke="#8B6914" strokeWidth={1.6} />
            </g>

            {/* أوراق الجيل الثالث */}
            {leaf.map(([cx, cy, delay]) => (
                <g
                    key={cx}
                    style={{
                        transformOrigin: `${cx}px ${cy}px`,
                        animation: `nsPop .5s cubic-bezier(.2,.8,.2,1) ${delay}s both`,
                    }}
                >
                    <circle cx={cx} cy={cy} r={13} fill="#F5EDDF" stroke="#C9A84C" strokeWidth={1.4} />
                </g>
            ))}
        </svg>
    );
}

/* ═══════════════════════════════════════════════
   الإحصائيات — عدّادات تتصاعد عند الظهور
   ═══════════════════════════════════════════════ */
function Stats() {
    return (
        <section
            id="stats"
            className="landing-band border-y border-gold/15 ns-reveal"
        >
            <div className="max-w-[1180px] mx-auto flex flex-wrap gap-6 justify-between px-5 sm:px-10 py-8">
                <Stat value={12400} label="فرد موثّق" />
                <Stat value={37} label="جيلًا متتابعًا" />
                <Stat value={8} label="قبائل مشاركة" />
                <Stat value={1200} label="وثيقة نسب" />
            </div>
        </section>
    );
}

function Stat({ value, label }: { readonly value: number; readonly label: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [display, setDisplay] = useState('0');

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

        const run = () => {
            const dur = 1500;
            const start = performance.now();
            const step = (now: number) => {
                const t = Math.min(1, (now - start) / dur);
                const eased = 1 - Math.pow(1 - t, 3);
                setDisplay(fmt(value * eased));
                if (t < 1) requestAnimationFrame(step);
                else setDisplay(fmt(value));
            };
            requestAnimationFrame(step);
        };

        if (!('IntersectionObserver' in window)) {
            run();
            return;
        }

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        run();
                        io.disconnect();
                    }
                });
            },
            { threshold: 0.5 },
        );
        io.observe(el);
        return () => io.disconnect();
    }, [value]);

    return (
        <div className="flex-1 basis-[140px]">
            <div
                ref={ref}
                className="font-bold text-gold"
                style={{ fontSize: 'clamp(28px, 3vw, 36px)' }}
            >
                {display}
            </div>
            <div className="text-[13.5px] text-brown-light mt-0.5">{label}</div>
        </div>
    );
}

/* ═══════════════════════════════════════════════
   المزايا
   ═══════════════════════════════════════════════ */
const FEATURES: Array<{ icon: React.ReactNode; title: string; body: string; range: string }> = [
    {
        icon: <TreeNodesIcon />,
        title: 'الشجرة التفاعلية',
        body: 'تصفّح الأجيال بلمسة، ووسّع الفروع عند الطلب دون تشتيت.',
        range: 'entry 2% cover 32%',
    },
    {
        icon: <KinshipIcon />,
        title: 'صلة القرابة',
        body: 'اكتشف العلاقة بين أي شخصين عبر الجدّ المشترك الأقرب.',
        range: 'entry 6% cover 36%',
    },
    {
        icon: <DocumentIcon />,
        title: 'وثيقة النسب',
        body: 'وثيقة رسمية قابلة للطباعة بخط عربي أصيل وختم القبيلة.',
        range: 'entry 10% cover 40%',
    },
    {
        icon: <ShieldCheckIcon />,
        title: 'التوثيق الجماعي',
        body: 'كل إضافة تمرّ بمراجعة الموثّقين قبل اعتمادها في الشجرة.',
        range: 'entry 14% cover 44%',
    },
];

function Features() {
    return (
        <section id="features" className="max-w-[1180px] mx-auto px-5 sm:px-10 py-[72px]">
            <div
                className="text-center mb-12 ns-reveal"
                style={{ animationRange: 'entry 0% cover 28%' }}
            >
                <div className="text-[13px] tracking-[0.14em] text-gold font-semibold">
                    ما تقدّمه المنصّة
                </div>
                <h2
                    className="font-amiri font-bold text-brown-dark mt-2"
                    style={{ fontSize: 'clamp(30px, 3.6vw, 40px)' }}
                >
                    كل ما تحتاجه لحفظ النسب
                </h2>
            </div>

            <div className="grid gap-[22px]" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))' }}>
                {FEATURES.map((f) => (
                    <div
                        key={f.title}
                        className="ns-card ns-reveal bg-white border border-gold/15 rounded-2xl px-6 py-7"
                        style={{ animationRange: f.range }}
                    >
                        <div className="text-gold mb-4">{f.icon}</div>
                        <div className="font-bold text-[17px] text-brown-dark mb-2">{f.title}</div>
                        <div className="text-[14px] leading-[1.7] text-brown-light">{f.body}</div>
                    </div>
                ))}
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════════
   التسعير + مُحوّل العملة حسب الدولة
   ═══════════════════════════════════════════════ */
function Pricing({ packages, registerHref }: { readonly packages: Package[]; readonly registerHref: string }) {
    const [cycle, setCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [country, setCountry] = useState<Country>(COUNTRIES[0]);

    // تخمين دولة الزائر من المتصفح عند التحميل
    useEffect(() => {
        setCountry(detectCountry());
    }, []);

    return (
        <section id="pricing" className="max-w-[1180px] mx-auto px-5 sm:px-10 py-[72px]">
            <div className="text-center mb-8 ns-reveal" style={{ animationRange: 'entry 0% cover 28%' }}>
                <div className="text-[13px] tracking-[0.14em] text-gold font-semibold">الباقات والأسعار</div>
                <h2 className="font-amiri font-bold text-brown-dark mt-2" style={{ fontSize: 'clamp(30px, 3.6vw, 40px)' }}>
                    اختر ما يناسب قبيلتك
                </h2>
            </div>

            {/* أدوات التحكّم: الدولة + دورة الفوترة */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
                <label className="inline-flex items-center gap-2 bg-white dark:bg-night-card border border-gold/20 rounded-xl px-3 py-2 shadow-sm">
                    <span className="text-brown-light text-xs">الدولة:</span>
                    <select
                        value={country.code}
                        onChange={(e) => setCountry(COUNTRIES.find((c) => c.code === e.target.value) ?? COUNTRIES[0])}
                        className="bg-transparent text-brown-dark text-sm font-medium focus:outline-none cursor-pointer"
                    >
                        {COUNTRIES.map((c) => (
                            <option key={c.code} value={c.code}>
                                {c.name_ar} ({CURRENCY_LABEL[c.currency]})
                            </option>
                        ))}
                    </select>
                </label>

                <div className="inline-flex p-1 bg-white dark:bg-night-card rounded-xl border border-gold/20 shadow-sm">
                    <CycleTab active={cycle === 'monthly'} onClick={() => setCycle('monthly')}>شهري</CycleTab>
                    <CycleTab active={cycle === 'yearly'} onClick={() => setCycle('yearly')}>
                        سنوي <span className="text-[10px] font-bold text-emerald-600">(وفّر أكثر)</span>
                    </CycleTab>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                {packages.map((pkg) => (
                    <PricingCard key={pkg.id} pkg={pkg} cycle={cycle} currency={country.currency} registerHref={registerHref} />
                ))}
            </div>
        </section>
    );
}

function PricingCard({
    pkg,
    cycle,
    currency,
    registerHref,
}: {
    readonly pkg: Package;
    readonly cycle: 'monthly' | 'yearly';
    readonly currency: string;
    readonly registerHref: string;
}) {
    const rawPrice = cycle === 'monthly' ? pkg.price_monthly : pkg.price_yearly;
    const isFree = rawPrice === 0;
    const cycleLabel = cycle === 'monthly' ? '/ شهريًا' : '/ سنويًا';

    return (
        <div
            className={`ns-card ns-reveal relative flex flex-col bg-white dark:bg-night-card rounded-3xl border shadow-sm overflow-hidden ${
                pkg.is_featured ? 'border-gold ring-2 ring-gold/30' : 'border-gold/15'
            }`}
            style={{ animationRange: 'entry 2% cover 34%' }}
        >
            {pkg.is_featured && (
                <div className="absolute top-0 inset-x-0 bg-gradient-to-l from-gold to-gold-light text-white text-xs font-bold py-1.5 text-center flex items-center justify-center gap-1.5">
                    <StarIcon className="w-3.5 h-3.5" /> الأكثر شيوعًا
                </div>
            )}

            <div className={`p-6 ${pkg.is_featured ? 'pt-10' : ''} flex flex-col h-full`}>
                <div className="flex items-center gap-2.5 mb-1">
                    <span className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: pkg.color }}>
                        <PackageIcon className="w-5 h-5" />
                    </span>
                    <h3 className="font-amiri text-xl font-bold text-brown-dark">{pkg.name_ar}</h3>
                </div>

                {pkg.description_ar && (
                    <p className="text-brown-light text-xs leading-relaxed mb-4 min-h-[32px]">{pkg.description_ar}</p>
                )}

                <div className="mb-5">
                    {isFree ? (
                        <div className="font-amiri text-3xl font-bold text-gold">مجانًا</div>
                    ) : (
                        <div className="flex items-end gap-1.5">
                            <span className="text-3xl font-bold text-brown-dark">{formatPrice(rawPrice, pkg.currency, currency)}</span>
                            <span className="text-brown-mid text-sm font-medium mb-1">{CURRENCY_LABEL[currency]}</span>
                            <span className="text-brown-light text-xs mb-1.5">{cycleLabel}</span>
                        </div>
                    )}
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                    {pkg.features.map((f, i) => (
                        <li key={`${f}-${i}`} className="flex items-start gap-2 text-sm text-brown-mid">
                            <span className="text-emerald-500 mt-0.5 shrink-0"><CheckIcon className="w-4 h-4" /></span>
                            <span>{f}</span>
                        </li>
                    ))}
                </ul>

                <Link
                    href={registerHref}
                    className={`ns-btn mt-auto inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold shadow-md ${
                        pkg.is_featured
                            ? 'bg-gold text-white hover:bg-[#79540f]'
                            : 'bg-gold-soft/70 text-brown-dark hover:bg-gold-soft'
                    }`}
                >
                    <span className="relative z-10">{isFree ? 'ابدأ مجانًا' : 'ابدأ الآن'}</span>
                </Link>
            </div>
        </div>
    );
}

function CycleTab({ active, onClick, children }: { readonly active: boolean; readonly onClick: () => void; readonly children: React.ReactNode }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-medium text-sm transition-all ${
                active ? 'bg-gold text-white shadow-sm' : 'text-brown-mid hover:bg-beige'
            }`}
        >
            {children}
        </button>
    );
}

/* ═══════════════════════════════════════════════
   شريط الدعوة (CTA)
   ═══════════════════════════════════════════════ */
function CtaBand({ registerHref }: { readonly registerHref: string }) {
    return (
        <section id="cta" className="max-w-[1180px] mx-auto px-5 sm:px-10 pb-[72px]">
            <div
                className="landing-cta relative rounded-[26px] border-[1.5px] border-gold-light/45 text-center text-brown-dark overflow-hidden shadow-[0_28px_60px_rgba(139,105,20,0.18)] ns-reveal"
                style={{ padding: 'clamp(48px, 6vw, 72px)', animationRange: 'entry 0% cover 30%' }}
            >
                {/* وهج radial خلف العنوان */}
                <div
                    className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
                    style={{
                        top: '-55%',
                        width: '62%',
                        height: '130%',
                        background: 'radial-gradient(circle, rgba(201,168,76,.28), transparent 65%)',
                    }}
                    aria-hidden="true"
                />

                {/* شبكة نسب منجرفة */}
                <svg
                    viewBox="0 0 900 300"
                    preserveAspectRatio="xMidYMid slice"
                    className="absolute inset-0 w-full h-full opacity-55 pointer-events-none"
                    style={{ animation: 'nsDrift 14s ease-in-out infinite' }}
                    aria-hidden="true"
                >
                    <g stroke="#C9A84C" strokeWidth={1} fill="none" opacity={0.45}>
                        <path d="M80 60 L200 130 L140 230 M700 70 L820 150 L760 250 M200 130 L700 70" />
                    </g>
                    {([[80, 60, 2.5, 3.5, 0], [200, 130, 3, 4, 0.6], [700, 70, 3, 3.2, 1.1], [820, 150, 2.5, 4.2, 0.4]] as Array<[number, number, number, number, number]>).map(
                        ([cx, cy, r, dur, delay]) => (
                            <circle
                                key={`${cx}-${cy}`}
                                cx={cx}
                                cy={cy}
                                r={r}
                                fill="#C9A84C"
                                style={{ animation: `nsTwinkle ${dur}s ease-in-out ${delay}s infinite` }}
                            />
                        ),
                    )}
                </svg>

                <div className="relative">
                    {/* زخرفة ماسية */}
                    <div className="flex items-center justify-center gap-2.5 mb-[18px]">
                        <span className="w-[46px] h-px" style={{ background: 'linear-gradient(90deg, transparent, #C9A84C)' }} />
                        <span className="w-2 h-2 bg-gold rotate-45" />
                        <span className="w-2 h-2 bg-gold-light rotate-45" />
                        <span className="w-2 h-2 bg-gold rotate-45" />
                        <span className="w-[46px] h-px" style={{ background: 'linear-gradient(90deg, #C9A84C, transparent)' }} />
                    </div>

                    <h2
                        className="font-amiri font-bold text-brown-dark m-0"
                        style={{ fontSize: 'clamp(30px, 3.8vw, 40px)' }}
                    >
                        ابدأ بتوثيق نسب قبيلتك اليوم
                    </h2>
                    <p className="text-[16px] text-brown-mid max-w-[480px] mx-auto mt-3.5 mb-[30px]">
                        انضمّ إلى آلاف الموثّقين الذين يحفظون أنسابهم للأجيال القادمة.
                    </p>

                    <Link
                        href={registerHref}
                        className="ns-btn inline-flex items-center gap-2.5 text-[15px] font-bold text-white bg-gold px-10 py-4 rounded-[13px] shadow-[0_12px_30px_rgba(139,105,20,0.32)] hover:shadow-[0_18px_40px_rgba(139,105,20,0.46)] hover:bg-[#79540f]"
                    >
                        <span className="relative z-10">أنشئ حساب القبيلة</span>
                        <ChevronIcon className="relative z-10" />
                    </Link>
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════════
   التذييل
   ═══════════════════════════════════════════════ */
function Footer() {
    return (
        <footer className="border-t border-gold/15">
            <div className="max-w-[1180px] mx-auto flex flex-wrap gap-3.5 items-center justify-between px-5 sm:px-10 py-[26px] text-[13.5px] text-brown-light">
                <span>© 2026 نَسَب — منصّة توثيق الأنساب القبلية</span>
                <span className="flex gap-[22px]">الخصوصية · الشروط · تواصل معنا</span>
            </div>
        </footer>
    );
}

/* ═══════════════════════════════════════════════
   أيقونات SVG خطّية (stroke=currentColor, width=1.5)
   ═══════════════════════════════════════════════ */
function ChevronIcon({ className = '' }: { readonly className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M14 6l-6 6 6 6" />
        </svg>
    );
}

function TreeNodesIcon() {
    return (
        <svg viewBox="0 0 24 24" width={30} height={30} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx={12} cy={4} r={2.2} />
            <circle cx={5} cy={19} r={2.2} />
            <circle cx={19} cy={19} r={2.2} />
            <path d="M12 6.2v3.3M12 9.5H5v7.3M12 9.5h7v7.3" />
        </svg>
    );
}

function KinshipIcon() {
    return (
        <svg viewBox="0 0 24 24" width={30} height={30} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx={6} cy={12} r={3} />
            <circle cx={18} cy={12} r={3} />
            <path d="M9 12h6" />
        </svg>
    );
}

function DocumentIcon() {
    return (
        <svg viewBox="0 0 24 24" width={30} height={30} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x={5} y={3} width={14} height={18} rx={2} />
            <path d="M9 8h6M9 12h6M9 16h3" />
        </svg>
    );
}

function ShieldCheckIcon() {
    return (
        <svg viewBox="0 0 24 24" width={30} height={30} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 3l7 3v5.5c0 4.2-3 7-7 8.5-4-1.5-7-4.3-7-8.5V6z" />
            <path d="M9 12l2 2 4-4" />
        </svg>
    );
}
