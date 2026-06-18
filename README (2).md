# Handoff: الصفحة الترحيبية — توجّه «الجذر» (Nasab Landing)

## نظرة عامة (Overview)
إعادة تصميم الصفحة الترحيبية لمنصّة **نَسَب** (توثيق الأنساب القبلية) بأسلوب عصري فاتح وأنيق،
مع شبكة نسب هندسية متلألئة، حركة لطيفة، وأزرار احترافية. الهدف: واجهة ترحيبية تجذب الزائر
وتعرض قيمة المنصّة (الشجرة التفاعلية، صلة القرابة، وثيقة النسب، التوثيق الجماعي).

## عن ملفات التصميم (About the Design Files)
الملف المرفق `Landing - الجذر.dc.html` هو **مرجع بصري مكتوب بـ HTML** — نموذج يوضّح الشكل
والسلوك المقصودين، وليس كودًا للنسخ المباشر. المطلوب **إعادة إنشاء هذا التصميم داخل بيئة المشروع
الحالية** (Laravel 13 + Inertia v3 + React 19 + Tailwind CSS v4، RTL) باستخدام أنماطها ومكوّناتها
القائمة — لا نسخ الـ HTML كما هو.

> ملاحظة: الملف بصيغة `.dc.html` (Design Component) للعرض فقط. تجاهل أي وسوم خاصة مثل
> `<x-dc>` / `<helmet>` / `style-hover` / `style-after`؛ هي آليات عرض، وما يهمّك هو البنية
> والأنماط والقيم الموثّقة أدناه.

## مستوى الدقّة (Fidelity)
**عالي الدقّة (Hi-fi):** الألوان والخطوط والمسافات والحركات نهائية. أعِد بناء الواجهة بدقّة
بصرية مطابقة باستخدام مكوّنات وأنماط المشروع.

## مكان التنفيذ في الكود (Where to implement)
- **الصفحة:** `resources/js/Pages/Welcome.tsx` — أعِد بناءها لتطابق هذا التصميم.
- **الأنماط/الحركات:** أضِف الـ `@keyframes` إلى `resources/css/app.css`.
- **الألوان والخطوط:** معرّفة مسبقًا في `app.css` ضمن `@theme`؛ استخدمها ولا تخترع قيمًا جديدة.
- النصوص العربية في التصميم تُحفظ كما هي. اربط الأزرار بمسارات Inertia الفعلية.

---

## الشاشات / الأقسام (Screens / Sections)

التصميم صفحة واحدة طويلة، عرض المحتوى الأقصى `max-width: 1180px` ممركَز، حشوة جانبية `40px`.
الترتيب من الأعلى للأسفل: Nav → Hero → Stats → Features → CTA → Footer.

### 1) Nav (الشريط العلوي)
- **الغرض:** التنقّل + الدخول/إنشاء حساب.
- **التخطيط:** `sticky top:0`, `z-index:30`, خلفية شفافة `rgba(250,246,238,.82)` مع `backdrop-filter: blur(12px)`،
  حدّ سفلي `1px solid rgba(139,105,20,.14)`. صف `flex` بثلاث مجموعات: الشعار (يمين) / الروابط (وسط) / الأزرار (يسار). حشوة `18px 40px`.
- **الشعار:** مربّع `38×38`, `border-radius:11px`, حدّ `1.5px solid #8B6914`, بداخله حرف «ن» بخط `Amiri` حجم `22px` لون `#8B6914`؛ بجانبه كلمة «نَسَب» `font-weight:700; font-size:19px`.
- **الروابط:** الشجرة / القبائل / التوثيق / عن المنصّة — `font-size:14.5px; color:#5f5648; font-weight:500`.
  - **Hover:** اللون → `#8B6914`، **وخط سفلي ذهبي يتنامى** (انظر «الخط السفلي» في الحركات).
- **رابط «دخول»:** نصّي بنفس سلوك الـ hover.
- **زر «إنشاء حساب»:** خلفية `#8B6914`, نص أبيض, `padding:10px 22px`, `border-radius:10px`, ظل `0 4px 14px rgba(139,105,20,.25)`.
  - **Hover:** `translateY(-2px)`؛ خلفية `#79540f`؛ ظل `0 10px 24px rgba(139,105,20,.38)`.

### 2) Hero (الواجهة)
- **التخطيط:** `position:relative; overflow:hidden`؛ حاوية `flex; flex-wrap:wrap; align-items:center; gap:48px`.
  - الجانب النصّي: `flex:1 1 420px`.
  - جانب الرسم: `flex:1 1 380px` (يلتفّ أسفل النص على الشاشات الضيّقة).
- **خلفية خافتة:** SVG كوكبة بخطوط/نقاط ذهبية `#C9A84C`, `opacity:.5`, مع انجراف بطيء (`nsDrift 16s`) ونقاط تتلألأ (`nsTwinkle`).
- **النص:**
  - شارة (eyebrow): «منصّة توثيق الأنساب القبلية» — `font-size:13px; letter-spacing:.14em; color:#8B6914`, إطار `1px solid rgba(139,105,20,.3)`, `border-radius:999px`, حشوة `6px 14px`.
  - عنوان `h1`: «نَسَبٌ يُروى،\nوجذرٌ لا يُنسى» — خط `Amiri`, `font-size: clamp(40px,5.2vw,64px)`, `line-height:1.25`, `font-weight:700`, لون `#2a1d12`.
  - فقرة: لون `#6b6052`, `font-size: clamp(16px,1.6vw,18px)`, `line-height:1.9`, `max-width:460px`.
  - زر أساسي واحد فقط: «استكشف الشجرة» (انظر «الأزرار»). *(لا يوجد زر «شاهد عرضًا».)*
  - دخول العناصر بالتتابع عبر `nsFadeUp` بتأخير متزايد (0 / .12s / .24s / .36s).
- **لوحة شبكة النسب (الرسم):** بطاقة `max-width:440px`, `aspect-ratio:1.15/1`, `border-radius:24px`, خلفية `linear-gradient(160deg,#fff,#F5EDDF)`, حدّ `1px solid rgba(139,105,20,.18)`, ظل `0 22px 50px rgba(60,43,31,.1)`.
  - SVG (`viewBox 0 0 440 380`) به طفوٌ لطيف (`nsFloat 7s`):
    - **خطوط** تصل العُقَد، تُرسَم تدريجيًا (`nsDraw 1.8s`, عبر `stroke-dasharray/offset`), لون `#C9A84C`.
    - **عُقدة الجذر** دائرة `r=22` لون `#8B6914` بداخلها «ن» أبيض، وحولها **حلقة نبض** (`nsPulse 3s`).
    - **الجيل الثاني:** دائرتان `r=16`, تعبئة بيضاء, حدّ `#8B6914`.
    - **الجيل الثالث:** 4 دوائر `r=13`, تعبئة `#F5EDDF`, حدّ `#C9A84C`.
    - كل عُقدة تظهر بحركة `nsPop` بتأخير متتابع (.5s→1.6s).
    - نقاط زينة تتلألأ في الأركان.

### 3) Stats (شريط الإحصائيات)
- **التخطيط:** خلفية `#F5EDDF`, حدّان علوي/سفلي `1px solid rgba(139,105,20,.14)`؛ صف `flex; flex-wrap:wrap; justify-content:space-between; gap:24px`, حشوة `32px 40px`. كل عنصر `flex:1 1 140px`.
- **العناصر (الرقم ثم التسمية):**
  - `12,400` — فرد موثّق
  - `37` — جيلًا متتابعًا
  - `8` — قبائل مشاركة
  - `1,200` — وثيقة نسب
- الرقم: `font-size: clamp(28px,3vw,36px); font-weight:700; color:#8B6914`. التسمية: `font-size:13.5px; color:#7d7466`.
- **سلوك:** عدّاد يتصاعد من 0 إلى القيمة عند ظهوره (انظر الحركات/الحالة). أرقام إنجليزية بفواصل آلاف.
- يظهر القسم بحركة `nsReveal` مرتبطة بالتمرير.

### 4) Features (المزايا)
- **عنوان القسم:** eyebrow «ما تقدّمه المنصّة» (`#8B6914`) + `h2` «كل ما تحتاجه لحفظ النسب» (خط `Amiri`, `clamp(30px,3.6vw,40px)`, `#2a1d12`), ممركَز.
- **الشبكة:** `display:grid; grid-template-columns: repeat(auto-fit, minmax(230px,1fr)); gap:22px`.
- **البطاقة:** خلفية `#fff`, حدّ `1px solid rgba(139,105,20,.16)`, `border-radius:16px`, حشوة `28px 24px`.
  - أيقونة خطّية لون `#8B6914` (`30×30`), ثم عنوان `font-weight:700; font-size:17px`, ثم وصف `font-size:14px; line-height:1.7; color:#7d7466`.
  - **Hover:** `translateY(-6px)`؛ ظل `0 18px 40px rgba(60,43,31,.12)`؛ لون الحدّ `rgba(139,105,20,.4)`.
  - دخول بالتتابع عند التمرير (`nsReveal` بقيم `animation-range` متدرّجة).
- **البطاقات الأربع:**
  1. **الشجرة التفاعلية** — «تصفّح الأجيال بلمسة، ووسّع الفروع عند الطلب دون تشتيت.» (أيقونة عُقَد شجرة)
  2. **صلة القرابة** — «اكتشف العلاقة بين أي شخصين عبر الجدّ المشترك الأقرب.» (أيقونة دائرتين موصولتين)
  3. **وثيقة النسب** — «وثيقة رسمية قابلة للطباعة بخط عربي أصيل وختم القبيلة.» (أيقونة مستند بأسطر)
  4. **التوثيق الجماعي** — «كل إضافة تمرّ بمراجعة الموثّقين قبل اعتمادها في الشجرة.» (أيقونة درع + علامة صح)

### 5) CTA (شريط الدعوة) — لوحة فاتحة فاخرة
- **التخطيط:** بطاقة ممركّزة, `border-radius:26px`, حشوة `clamp(48px,6vw,72px)`, `text-align:center`, `overflow:hidden`.
- **الخلفية:** `linear-gradient(160deg,#FFFCF5 0%,#F6EAD0 55%,#EEDDBD 100%)`؛ حدّ `1.5px solid rgba(201,168,76,.45)`؛ ظل `0 28px 60px rgba(139,105,20,.18)`.
- **وهج ذهبي:** طبقة `radial-gradient(circle, rgba(201,168,76,.28), transparent 65%)` أعلى/وسط البطاقة.
- **كوكبة منجرفة:** SVG ذهبي خافت `opacity:.55` (`nsDrift 14s`) مع نقاط `#C9A84C` تتلألأ.
- **زخرفة ماسية فوق العنوان:** خطّان متدرّجان + ثلاثة مربّعات `8×8` بزاوية `rotate(45deg)` بألوان `#8B6914 / #C9A84C / #8B6914`.
- **العنوان:** «ابدأ بتوثيق نسب قبيلتك اليوم» — خط `Amiri`, `clamp(30px,3.8vw,40px)`, `#2a1d12`.
- **الفقرة:** «انضمّ إلى آلاف الموثّقين الذين يحفظون أنسابهم للأجيال القادمة.» — `#6b5a45`.
- **الزر:** «أنشئ حساب القبيلة» — خلفية `#8B6914`, نص أبيض, `padding:16px 40px`, `border-radius:13px`, لمعان متحرّك + سهم (انظر الأزرار).
- يظهر القسم بحركة `nsReveal` عند التمرير.

### 6) Footer (التذييل)
- حدّ علوي `1px solid rgba(139,105,20,.14)`؛ صف `flex; flex-wrap:wrap; justify-content:space-between`, حشوة `26px 40px`, لون `#9a9183`, `font-size:13.5px`.
- يمين: «© 2026 نَسَب — منصّة توثيق الأنساب القبلية». يسار: «الخصوصية · الشروط · تواصل معنا».

---

## التفاعلات والحركة (Interactions & Animation)

### الخط السفلي لروابط القائمة (Underline grow)
استخدم تدرّجًا كخلفية بدل `text-decoration` لتفادي قفز التخطيط:
```css
/* الحالة الافتراضية */
background-image: linear-gradient(#8B6914, #8B6914);
background-repeat: no-repeat;
background-position: right 100%;   /* يبدأ من حافة RTL */
background-size: 0% 2px;
padding-bottom: 5px;
transition: color .25s ease, background-size .3s cubic-bezier(.2,.8,.2,1);
/* :hover */
color: #8B6914;
background-size: 100% 2px;
```

### الأزرار الاحترافية (Buttons)
- عناصر حقيقية (`<Link>` من Inertia أو `<a>`)، `display:inline-flex; align-items:center; gap:10px`.
- **Hover:** `transform: translateY(-2px)` + تعميق الظل + تغميق الخلفية (`#8B6914` → `#79540f`).
- **لمعان متحرّك (shimmer):** عنصر `::after` بعرض `~35%`, خلفية
  `linear-gradient(90deg, transparent, rgba(255,255,255,.42), transparent)`,
  `transform: translateX(-180%) skewX(-18deg)`, يتحرّك عبر `nsShimmer` (≈3.8s). يتطلّب `position:relative; overflow:hidden` على الزر، و`z-index:1` على النص والسهم.
- **السهم:** SVG `M14 6l-6 6 6 6` (يشير لليسار = «للأمام» في RTL), `stroke-width:2`.
- `transition` المقترح: `transform .25s cubic-bezier(.2,.8,.2,1), box-shadow .25s ease, background .25s ease`.

### الكشف عند التمرير (Scroll reveal)
استخدم CSS scroll-driven animations (مدعومة في Chromium):
```css
animation: nsReveal both;
animation-timeline: view();
animation-range: entry 0% cover 30%;   /* درّج البداية لكل بطاقة لتأثير متتابع */
```
> بديل متوافق أوسع: `IntersectionObserver` يضيف صنف `.is-visible` يشغّل الحركة. اختر ما يناسب دعم المتصفّحات لديك.

### عدّاد الإحصائيات (Count-up)
عند تقاطع العنصر (`IntersectionObserver`, threshold ~0.5) شغّل تصاعدًا بـ `requestAnimationFrame`:
- مدّة ≈ 1500ms, تخفيف `easeOutCubic` = `1 - (1-t)^3`.
- التنسيق: `Math.round(value).toLocaleString('en-US')` (أرقام إنجليزية + فواصل).
- اضبط القيمة النهائية بدقّة في النهاية، ونفّذ مرّة واحدة (`unobserve`).

### الـ @keyframes المطلوبة (أضِفها إلى app.css)
```css
@keyframes nsFadeUp { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
@keyframes nsReveal { from{opacity:0;transform:translateY(34px);} to{opacity:1;transform:translateY(0);} }
@keyframes nsTwinkle{ 0%,100%{opacity:.18;} 50%{opacity:1;} }
@keyframes nsPulse  { 0%{transform:scale(1);opacity:.55;} 70%,100%{transform:scale(2.6);opacity:0;} }
@keyframes nsFloat  { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-9px);} }
@keyframes nsDrift  { 0%{transform:translate(0,0);} 50%{transform:translate(-10px,6px);} 100%{transform:translate(0,0);} }
@keyframes nsDraw   { from{stroke-dashoffset:640;} to{stroke-dashoffset:0;} }
@keyframes nsShimmer{ 0%{transform:translateX(-180%) skewX(-18deg);} 55%,100%{transform:translateX(220%) skewX(-18deg);} }
@keyframes nsPop    { 0%{opacity:0;transform:scale(0);} 60%{transform:scale(1.18);} 100%{opacity:1;transform:scale(1);} }
```
> احترم `@media (prefers-reduced-motion: reduce)` بإلغاء الحركات اللانهائية.

### السلوك المتجاوب (Responsive)
- Hero يلتفّ عموديًا عبر `flex-wrap` عند ضيق الشاشة.
- المزايا `grid auto-fit minmax(230px,1fr)`؛ الإحصائيات `flex-wrap`.
- أحجام الخطوط عبر `clamp()`. RTL في كل الصفحة. الحدّ الأدنى لمساحة الأزرار ≥ 44px.

---

## إدارة الحالة (State)
- `statsAnimated` (لكل رقم): تشغيل العدّاد مرّة واحدة عند الظهور.
- لا حالة معقّدة أخرى — الصفحة عرض ثابت مع حركات. اربط الأزرار بمسارات Inertia.

---

## رموز التصميم (Design Tokens)
موجودة في `resources/css/app.css` ضمن `@theme` — استخدمها:

| الاسم | القيمة | الاستخدام |
|------|--------|-----------|
| `--color-gold` | `#8B6914` | اللون الأساسي، الأزرار، التمييز |
| `--color-gold-light` | `#C9A84C` | الخطوط/النقاط الذهبية، حدود |
| `--color-gold-soft` | `#E8D69F` | ذهبي فاتح |
| `--color-beige` | `#F5EFE6` | خلفية رئيسية |
| `--color-beige-dark` | `#E8DDD0` | خلفيات أقسام |
| `--color-brown-dark` | `#3D2B1F` | نصوص رئيسية |
| `--font-arabic` | `'Tajawal', ...` | نص الواجهة |
| `--font-naskh` | `'Amiri', ...` | العناوين الكبيرة |

قيم إضافية مستخدمة في التصميم:
- خلفية الصفحة: `#FAF6EE` — نص أساسي `#2a2017`.
- نصوص ثانوية: `#6b6052 / #7d7466 / #5f5648`.
- خلفية بطاقة الرسم: `linear-gradient(160deg,#fff,#F5EDDF)`.
- زر hover غامق: `#79540f`.
- خلفية CTA: `linear-gradient(160deg,#FFFCF5,#F6EAD0,#EEDDBD)`.
- نصف أقطار: `10–13px` (أزرار) / `16–26px` (بطاقات/أقسام) / `999px` (شارة).
- ظلال: `0 8px 22px rgba(139,105,20,.28)` (زر), `0 18px 40px rgba(60,43,31,.12)` (بطاقة hover), `0 28px 60px rgba(139,105,20,.18)` (CTA).

## الأصول (Assets)
- **لا صور** — كل العناصر البصرية SVG داخلي + CSS.
- **الأيقونات:** أيقونات خطّية SVG (انظر الملف) — استبدل بها أي إيموجي. يمكن استبدالها بمكتبة الأيقونات لديكم بنفس الأسلوب (stroke 1.5).
- **الخطوط:** `Amiri` (عناوين) و`Tajawal/IBM Plex Sans Arabic` (نص) — متوفّرة عبر Google Fonts؛ المشروع يستخدم Tajawal/Amiri أصلًا.

## الملفات (Files)
- `Landing - الجذر.dc.html` — المرجع البصري الكامل (افتحه في المتصفّح لرؤية الحركات والقيم الحيّة).
