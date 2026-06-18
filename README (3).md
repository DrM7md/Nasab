# Handoff: صفحة الشجرة الحيّة (Nasab — Living Tree)

## نظرة عامة (Overview)
إعادة تصميم صفحة الشجرة في منصّة **نَسَب** لتبدو **شجرة حيّة حقيقية** بدل رسم العُقَد الآلي
الحالي: الجدّ الأكبر هو **الجذع** في الأسفل، والأجيال تتفرّع صاعدة كأغصان عضوية حتى
**الأوراق الخضراء (= الأحياء)** في الأعلى — بأجواء دافئة، حركة لطيفة، وميداليات أنيقة.

## السياق التقني (Stack)
Laravel 13 + Inertia v3 + React 19 + Tailwind v4 (RTL). الصفحة الحالية تستخدم **React Flow**
(`@xyflow/react`) لرسم العُقَد. الألوان والخطوط معرّفة في `resources/css/app.css` ضمن `@theme`.

## عن ملف التصميم (About the Design File)
`Tree - الشجرة الحية.dc.html` هو **مرجع بصري مكتوب بـ HTML** — يوضّح الشكل والحركة والقيم
المقصودة، وليس كودًا للنسخ المباشر. أعِد إنشاءه بمكوّنات React وأنماط المشروع. تجاهل وسوم
العرض الخاصة (`<x-dc>`, `<helmet>`, `style-hover`)؛ المهم البنية والقيم الموثّقة أدناه.
> افتح الملف في المتصفّح أولًا لرؤية الحركات الحيّة (رسم الأغصان، تمايل الأوراق، طفو اللقاح).

## مستوى الدقّة (Fidelity)
عالي الدقّة (Hi-fi) — الألوان والمسافات والحركات نهائية.

---

## مكان التنفيذ (Where to implement)
| الملف | التغيير |
|------|---------|
| `resources/js/Pages/Tree/Index.tsx` | الحاوية، الخلفية، عناصر الشاشة (chrome) |
| `resources/js/Components/Tree/PersonNode.tsx` | الميدالية الدائرية بدل البطاقة المستطيلة |
| `resources/js/Components/Tree/FemaleNode.tsx` | نفس الأسلوب للإناث |
| **جديد:** `resources/js/Components/Tree/OrganicEdge.tsx` | حافة (edge) عضوية متدرّجة السماكة |
| `resources/css/app.css` | إضافة `@keyframes` + تنسيق `.tree-bg` |

---

## القرار المعماري الأهم: الأغصان العضوية (Organic Edges)
React Flow الحالي يستخدم `type: 'smoothstep'` (خطوط بزوايا، سماكة ثابتة `2px`). الشكل الحيّ
يتطلّب **حافة مخصّصة**:

1. أنشئ مكوّن **`OrganicEdge`** عبر `<BaseEdge>` + `getBezierPath` من `@xyflow/react`.
   - استخدم منحنى Bézier (لا smoothstep) لانسيابية الغصن.
   - **سماكة متدرّجة حسب الجيل**: مرّر `data.generation` للحافة وحدّد `strokeWidth`:
     جذع `≈30` → جيل1 `≈18` → جيل2 `≈11` → جيل3 `≈7`. (بديل: اشتقّها من فرق `y` بين الطرفين.)
   - `stroke` = تدرّج لحاء عبر `<linearGradient id="bark">` (انظر الألوان).
   - `strokeLinecap="round"`.
2. سجّلها في `edgeTypes={{ organic: OrganicEdge }}` واجعلها الافتراضية:
   `defaultEdgeOptions={{ type: 'organic' }}`.
3. عرّف الـ `<defs><linearGradient>` مرّة واحدة (مكوّن `<TreeDefs/>` يُركَّب داخل لوحة React Flow،
   أو SVG عام في الصفحة).
4. **اتجاه النمو:** الشجرة الحالية الجذر في الأعلى. للحصول على "شجرة تنمو لأعلى"، إمّا:
   - (أ) اقلب ترتيب الأجيال في تخطيط العُقَد (الجذر `y` الأكبر = الأسفل، الأبناء `y` أقل)، أو
   - (ب) أبقِ المنطق كما هو وطبّق التصميم بصريًا فقط (الجذر أعلى) مع نفس الميداليات والأغصان.
   > الأنسب جماليًا (أ): الجذر في الأسفل (جذع)، الأحدث في الأعلى (أوراق). يتطلّب تعديل دالة
   > حساب `position.y` في باك-إند/خدمة بناء الشجرة أو في `useTreeExpansion`.

---

## الشاشات / المكوّنات

### 1) الحاوية والخلفية (Index.tsx → `.tree-bg`)
- خلفية: `radial-gradient(120% 90% at 50% 108%, #F6E7C4 0%, #FBF4E6 46%, #FCF7EC 100%)`
  (فجر دافئ، أغمق قليلًا أسفل الجذع). الوضع الليلي: استخدم متغيّرات `night-*` الموجودة.
- **وهج شمس** خلف الجذع: طبقة `div` سفلية ممركّزة
  `radial-gradient(circle, rgba(201,168,76,.30), transparent 72%)`، نبض خفيف (`nsGlow 7s`).
- **كوكبة خافتة** أعلى الصفحة (نقاط `#C9A84C`, `opacity:.3`) — استمرارية الهوية.
- **ذرّات لقاح/ضوء**: 4–6 نقاط صغيرة `radial-gradient(#E8D69F,transparent)` تطفو صاعدة
  (`nsRise`, مدد 9–13s، تأخيرات مختلفة).
- خلفية React Flow: أبقِ `<Background variant=Dots>` بنقاط `#C9A84C opacity .12` أو أزِلها.

### 2) الميدالية (PersonNode.tsx) — بدل البطاقة المستطيلة
بنية كل عُقدة: **دائرة أفاتار + لوحة اسم صغيرة أسفلها**، متمركزة عموديًا (`flex-col items-center`).

**الدائرة (الأفاتار):**
- دائرة كاملة `border-radius:50%`، الحجم حسب الجيل (انظر الأحجام).
- خلفية `linear-gradient(160deg,#FFFBF2,#F0DDB4)`، حدّ ملوّن حسب الحالة (أدناه)،
  ظل `0 14px 30px rgba(90,63,40,.32)` + إضاءة داخلية `inset 0 2px 6px rgba(255,255,255,.7)`.
- المحتوى: صورة الشخص إن وُجدت (`GenderAvatar` دائري)، وإلا **أول حرف من الاسم** بخط `Amiri`.

**لوحة الاسم:** خلفية `rgba(255,255,255,.78)` + `backdrop-blur`، حدّ `rgba(139,105,20,.2)`،
`border-radius:11px`, الاسم `font-amiri font-bold #3D2B1F`، والسنوات `monospace #9a8a6a` (إن وُجدت).

**التمييز حسب الحالة (life_status):**
| الحالة | لون الحدّ | تفاصيل |
|--------|-----------|--------|
| الجذر (الجدّ الأكبر) | `#8B6914` (3px) | شارة «الجدّ الأكبر» ذهبية أسفل الدائرة، أكبر حجمًا |
| حيّ (`living`) | أخضر `#6E9D49` (2px) | خلفية مائلة للأخضر `#EAF4DF`، **نقطة خضراء نابضة** `#5BAE52` أعلى يمين (`nsLivePulse`) |
| متوفى (`deceased`) | ذهبي `#C9A84C`/`#B08A2E` | الافتراضي الدافئ |
| غير معروف | `#C9A84C` خفيف | أبيض هادئ |

**Hover:** `translateY(-4px)` بسلاسة (`transition .25s cubic-bezier(.2,.8,.2,1)`) + تعميق الظل.

**زر التوسيع (الأبناء):** أبقِ المنطق الحالي (`data-expand-btn="true"`)، لكن صمّمه كـ **بُرعم**:
دائرة صغيرة `gradient gold→gold-light`, حدّ أبيض, يعرض عدد الأبناء؛ عند الفتح يدور ويصبح `−`.
ضعه أسفل الدائرة على الغصن. (هذا يحافظ على `handleNodeClick` كما هو.)

**أحجام الدوائر حسب الجيل:** جذر `96px` · جيل1 `80px` · جيل2 `66px` · جيل3 (أوراق) `56px`.
حجم حرف Amiri يتناسب: `42 / 34 / 28 / 24px`.

### 3) عناصر الشاشة (Chrome) — أبقِ وظائفها، حدّث المظهر
كلها بطاقات `rgba(255,255,255,.8)` + `backdrop-blur(10px)` + حدّ `rgba(139,105,20,.2)` +
ظل `0 4-6px ... rgba(90,63,40,.1)`، تدخل بـ `nsFadeUp` بتأخير بسيط:
- **أعلى يمين:** زر «لوحة التحكم» (`Link href=/dashboard`) + بطاقة الشعار «نَسَب» (حرف ن في مربّع
  ذهبي) مع اسم القبيلة وعدد الأفراد (`{nodes.length} شخص`).
- **أعلى الوسط:** شريط عنوان «شجرة النسب الحيّة» مع أيقونة ورقة خضراء (`border-radius:99px`).
- **أسفل يسار:** أزرار التحكم (تكبير/تصغير/توسيط الجذر) — اربطها بـ `useReactFlow` (`zoomIn`,
  `zoomOut`, `setCenter`/`handleHome` الموجودة) + `ThemeToggle`.
- **أسفل يمين:** «البحث وصلة القرابة» (`Link`)، و«فتح الشجرة كاملة» (الزر الأساسي الذهبي مع
  لمعان + يربط `handleToggleExpandAll` الموجود)، وشارة «طلبات الموافقة» للمشرفين (`pendingCount`).

---

## الحركة (Animations) — أضِف الـ keyframes إلى app.css
```css
@keyframes nsDraw     { from{stroke-dashoffset:1400;} to{stroke-dashoffset:0;} }
@keyframes nsPop      { 0%{opacity:0;transform:translate(-50%,-50%) scale(.3);} 62%{transform:translate(-50%,-50%) scale(1.12);} 100%{opacity:1;transform:translate(-50%,-50%) scale(1);} }
@keyframes nsSway     { 0%,100%{transform:rotate(-6deg);} 50%{transform:rotate(7deg);} }
@keyframes nsSwayB    { 0%,100%{transform:rotate(5deg);}  50%{transform:rotate(-7deg);} }
@keyframes nsRise     { 0%{transform:translateY(20px);opacity:0;} 12%{opacity:.9;} 100%{transform:translateY(-180px);opacity:0;} }
@keyframes nsLivePulse{ 0%{transform:scale(1);opacity:.6;} 70%,100%{transform:scale(2.4);opacity:0;} }
@keyframes nsGlow     { 0%,100%{opacity:.5;} 50%{opacity:.9;} }
@keyframes nsFadeUp   { from{opacity:0;transform:translateY(14px);} to{opacity:1;transform:translateY(0);} }
```
- **رسم الأغصان (`nsDraw`):** على مسار كل حافة عضوية ضع `stroke-dasharray` كبيرًا (≈ طول المسار،
  أو ثابت 1400) وحرّك `dashoffset→0` (1.1–1.5s) بتأخير متدرّج حسب الجيل (الجذع أولًا ثم الأعلى).
  > في React Flow طبّقها على `<BaseEdge>` عبر `style` أو `pathLength`.
- **ظهور العُقَد (`nsPop`):** كل ميدالية تظهر بالتتابع. ملاحظة: العُقدة في React Flow تُموضَع بـ
  `transform: translate(x,y)` من المكتبة — **لا تستخدم translate في keyframe العُقدة**؛ بدلًا
  ضع `nsPop` على عنصر داخلي (wrapper) واستخدم `scale/opacity` فقط لتفادي تعارض المواضع.
- **تمايل الأوراق (`nsSway`/`nsSwayB`):** على مجموعات الأوراق الزخرفية حول الأطراف، `transform-origin`
  عند نقطة اتصال الورقة، مدد 5–6s، تأخيرات مختلفة.
- **الأحياء:** نقطة خضراء + حلقة `nsLivePulse 2.6s` بتأخيرات مختلفة لكل شخص.
- احترم `@media (prefers-reduced-motion: reduce)` (ألغِ اللانهائي ورسم الأغصان).

## الأوراق الزخرفية (Foliage)
مجموعات `<ellipse>` صغيرة (rx≈11–15) بتدرّجَي ورق: أخضر `leafG (#7fae5a→#4f7d36)` وذهبي
`leafGold (#E0C063→#B9912F)`، موزّعة قرب أطراف الأغصان العليا وتتمايل. (زينة بحتة — يمكن
وضعها في طبقة SVG ثابتة فوق لوحة React Flow أو ضمن عُقَد الأوراق.)

---

## رموز التصميم (Tokens) — من app.css `@theme`
| الاسم | القيمة | الاستخدام |
|------|--------|-----------|
| `--color-gold` | `#8B6914` | حدّ الجذر، الأزرار، التمييز |
| `--color-gold-light` | `#C9A84C` | حدود الميداليات، النقاط، الكوكبة |
| `--color-gold-soft` | `#E8D69F` | اللقاح/الضوء |
| `--color-brown-dark` | `#3D2B1F` | الأسماء، النصوص |
| `--font-naskh` | `'Amiri'` | الأسماء + الحروف داخل الدوائر |
| `--font-arabic` | `'Tajawal'` | واجهة عامة |

قيم إضافية مستخدمة في التصميم:
- لحاء الجذع/الأغصان: تدرّج `#5a3f28 → #8a6233` (`bark`)، أرفع `#7d5832 → #a87a3e` (`barkSoft`).
- ورق أخضر: `#7fae5a → #4f7d36` · ورق ذهبي: `#E0C063 → #B9912F`.
- نقطة حيّ: `#5BAE52` · حدّ ميدالية حيّ: `#6E9D49` · خلفية حيّ: `#EAF4DF`.
- خلفية الصفحة: تدرّج فجر `#F6E7C4 / #FBF4E6 / #FCF7EC`.
- ظل ميدالية: `0 14px 30px rgba(90,63,40,.32)` (جذر) ، `0 7-10px ... rgba(90,63,40,.2)` (أصغر).
- نصف قطر لوحات الشاشة: `12–16px` · شريط العنوان `99px`.

## بيانات نموذجية في التصميم (للتوضيح فقط)
قبيلة «آل سالم»: الجذر **سالم** (1780–1859) → **صقر**، **راشد** (جيل1) → **مطر/فهد**،
**ماجد/بدر** (جيل2) → **نواف، تركي، سعود** (جيل3، أحياء). استبدلها ببيانات `PersonNodeData` الفعلية.
> حقول `PersonNodeData` المتوفّرة: `id, name_ar, short_name_ar, gender, title, photo,
> children_count, is_expanded, birth_year, death_year, life_status`.

## الأصول (Assets)
- **لا صور خارجية** — كل العناصر SVG + CSS. الأيقونات خطّية (stroke 1.5) — استخدم `@/Components/UI/Icons`.
- **الخطوط:** Amiri + Tajawal (متوفّرة في المشروع).

## نقاط الحفاظ على الوظائف (Preserve)
- `handleNodeClick` (زر التوسيع vs فتح ملف الشخص), `handleToggleExpandAll`, `handleHome`,
  `useTreeExpansion`, الصلاحيات (`canEdit/canModerate`), حالة الشجرة الفارغة (CTA «إضافة الجدّ الأكبر»).
- ابقِ React Flow كمحرّك (تكبير/تحريك/توسيط) — التغيير في **مظهر العُقَد والحواف والخلفية** فقط.

## الملفات (Files)
- `Tree - الشجرة الحية.dc.html` — المرجع البصري الكامل (افتحه في المتصفّح).
