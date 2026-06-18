import Modal from '@/Components/UI/Modal';
import QuickCreatePersonModal from '@/Components/Person/QuickCreatePersonModal';
import SharedSmartMotherPicker, { type MotherMode as SharedMotherMode } from '@/Components/Person/SmartMotherPicker';
import PersonSearchBox, { type PersonSuggestion } from '@/Components/Search/PersonSearchBox';
import type { Gender, LifeStatus } from '@/types';
import { useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

interface ParentInfo {
    id: number;
    short_name_ar: string;
    gender: Gender;
    /** سلسلة نسب الوالد الكاملة لاستخدامها في التعبئة التلقائية للاسم الكامل */
    lineage?: string;
    /** زوجات الوالد (لو كان ذكراً) — تُستخدم في الاختيار الذكي للأم */
    wives?: PersonSuggestion[];
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    tribeSlug: string;
    /**
     * الوالد المعروف مسبقاً (يُرسل من صفحة الشخص عند الضغط على "أضف ابن").
     * إن كان ذكراً → father_id، إن كان أنثى → mother_id.
     */
    knownParent?: ParentInfo;
}

/** وضع اختيار الأم */
type MotherMode = 'auto' | 'pick_wife' | 'search_other' | 'none';

export default function AddPersonModal({ isOpen, onClose, tribeSlug, knownParent }: Props) {
    const [otherParent, setOtherParent] = useState<PersonSuggestion | null>(null);
    const [spouses, setSpouses] = useState<PersonSuggestion[]>([]);
    const [showSpouseSearch, setShowSpouseSearch] = useState(false);
    /** اسم الزوجة الجديدة قيد الإنشاء (يُفتح modal لو !== null) */
    const [createSpouseInitialName, setCreateSpouseInitialName] = useState<string | null>(null);
    /** اسم الأم الجديدة قيد الإنشاء (نفس آلية الزوج/الزوجة) */
    const [createMotherInitialName, setCreateMotherInitialName] = useState<string | null>(null);
    /** هل المستخدم عدّل name_ar يدوياً؟ — لو نعم نتوقف عن التعبئة التلقائية */
    const [nameTouched, setNameTouched] = useState(false);
    const photoRef = useRef<HTMLInputElement>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    /** وضع اختيار الأم — يعتمد على عدد زوجات الأب */
    const [motherMode, setMotherMode] = useState<MotherMode>('auto');

    const { data, setData, post, processing, errors, reset } = useForm<{
        edit_type: string;
        photo: File | null;
        proposed_data: {
            name_ar: string;
            short_name_ar: string;
            gender: Gender;
            title: string;
            birth_year: string;
            death_year: string;
            life_status: LifeStatus;
            birth_place: string;
            bio_ar: string;
            father_id: number | null;
            mother_id: number | null;
            spouse_ids: number[];
        };
    }>({
        edit_type: 'add_person',
        photo: null,
        proposed_data: {
            name_ar: '',
            short_name_ar: '',
            gender: 'male',
            title: '',
            birth_year: '',
            death_year: '',
            life_status: 'unknown',
            birth_place: '',
            bio_ar: '',
            father_id: knownParent?.gender === 'male' ? knownParent.id : null,
            mother_id: null,
            spouse_ids: [],
        },
    });

    // حدّث الـ parent + الوضع الذكي للأم عند فتح المودال
    useEffect(() => {
        if (isOpen) {
            const wives = knownParent?.wives ?? [];
            const fatherIsKnown = knownParent?.gender === 'male';

            // الاختيار الذكي للأم:
            //   - 0 زوجات → بحث عام (search_other)
            //   - 1 زوجة → تُختار تلقائياً (auto)
            //   - 2+ زوجات → اختيار من القائمة (pick_wife) — أول زوجة مُحدَّدة افتراضياً
            let initialMotherMode: MotherMode;
            let initialMotherId: number | null = null;
            if (!fatherIsKnown) {
                initialMotherMode = 'none';
            } else if (wives.length === 0) {
                initialMotherMode = 'search_other';
            } else if (wives.length === 1) {
                initialMotherMode = 'auto';
                initialMotherId = wives[0].id;
            } else {
                initialMotherMode = 'pick_wife';
                initialMotherId = wives[0].id;
            }

            setMotherMode(initialMotherMode);
            setData('proposed_data', {
                ...data.proposed_data,
                father_id: fatherIsKnown ? knownParent.id : null,
                mother_id: knownParent?.gender === 'female' ? knownParent.id : initialMotherId,
                spouse_ids: [],
            });
            setData('photo', null);
            setOtherParent(null);
            setSpouses([]);
            setShowSpouseSearch(false);
            setNameTouched(false);
            setPhotoPreview(null);
            if (photoRef.current) photoRef.current.value = '';
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, knownParent]);

    const handlePhotoChange = (file: File | null) => {
        setData('photo', file);
        if (photoPreview) URL.revokeObjectURL(photoPreview);
        setPhotoPreview(file ? URL.createObjectURL(file) : null);
    };

    // التعبئة التلقائية: name_ar = short_name + بن|بنت + lineage الوالد
    const buildAutoName = (
        shortName: string,
        gender: Gender,
        parentLineage?: string,
    ): string => {
        const trimmed = shortName.trim();
        if (!trimmed || !parentLineage) return trimmed;
        const connector = gender === 'female' ? 'بنت' : 'بن';
        return `${trimmed} ${connector} ${parentLineage}`;
    };

    useEffect(() => {
        if (nameTouched) return;
        const auto = buildAutoName(
            data.proposed_data.short_name_ar,
            data.proposed_data.gender,
            knownParent?.lineage,
        );
        if (auto !== data.proposed_data.name_ar) {
            setData('proposed_data', { ...data.proposed_data, name_ar: auto });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        data.proposed_data.short_name_ar,
        data.proposed_data.gender,
        knownParent?.lineage,
        nameTouched,
    ]);

    const updateField = <K extends keyof typeof data.proposed_data>(
        key: K,
        value: (typeof data.proposed_data)[K],
    ) => {
        setData('proposed_data', { ...data.proposed_data, [key]: value });
    };

    /** الحالة تُشتقّ تلقائياً: وفاة → متوفى، ميلاد فقط → حيّ، فارغان → غير معروف */
    const deriveLifeStatus = (birth: string, death: string): LifeStatus => {
        if (death) return 'deceased';
        if (birth) return 'living';
        return 'unknown';
    };

    const updateBirthYear = (val: string) => {
        setData('proposed_data', {
            ...data.proposed_data,
            birth_year: val,
            life_status: deriveLifeStatus(val, data.proposed_data.death_year),
        });
    };

    const updateDeathYear = (val: string) => {
        setData('proposed_data', {
            ...data.proposed_data,
            death_year: val,
            life_status: deriveLifeStatus(data.proposed_data.birth_year, val),
        });
    };

    const handleOtherParentSelect = (p: PersonSuggestion | null) => {
        setOtherParent(p);
        if (!p) {
            // مسح الطرف الآخر
            if (knownParent?.gender === 'male') updateField('mother_id', null);
            else updateField('father_id', null);
            return;
        }
        if (p.gender === 'male') {
            updateField('father_id', p.id);
        } else {
            updateField('mother_id', p.id);
        }
    };

    /* ═════════ إدارة الأزواج/الزوجات (متعدد) ═════════ */
    const addSpouse = (p: PersonSuggestion | null) => {
        if (!p) return;
        if (spouses.some((s) => s.id === p.id)) {
            setShowSpouseSearch(false);
            return;
        }
        const next = [...spouses, p];
        setSpouses(next);
        updateField('spouse_ids', next.map((s) => s.id));
        setShowSpouseSearch(false);
    };

    const removeSpouse = (id: number) => {
        const next = spouses.filter((s) => s.id !== id);
        setSpouses(next);
        updateField('spouse_ids', next.map((s) => s.id));
    };

    /* ═════════ تبديل وضع اختيار الأم ═════════ */
    const switchMotherMode = (mode: MotherMode) => {
        setMotherMode(mode);
        const wives = knownParent?.wives ?? [];
        if (mode === 'auto' && wives.length === 1) {
            updateField('mother_id', wives[0].id);
        } else if (mode === 'pick_wife' && wives.length > 0) {
            updateField('mother_id', wives[0].id);
        } else if (mode === 'search_other' || mode === 'none') {
            updateField('mother_id', null);
            setOtherParent(null);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/tribes/${tribeSlug}/pending-edits`, {
            preserveScroll: true,
            forceFormData: true, // مطلوب لرفع الصورة (multipart)
            onSuccess: () => {
                reset();
                if (photoPreview) URL.revokeObjectURL(photoPreview);
                setPhotoPreview(null);
                onClose();
            },
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={knownParent ? `إضافة ابن/ابنة لـ ${knownParent.short_name_ar}` : 'إضافة شخص جديد'}
            size="lg"
            footer={
                <>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 bg-white text-brown-mid border border-gold/20 rounded-xl font-medium hover:bg-beige transition-colors"
                    >
                        إلغاء
                    </button>
                    <button
                        type="button"
                        onClick={submit}
                        disabled={processing}
                        className="px-5 py-2.5 bg-gradient-to-r from-gold to-gold-light text-white rounded-xl font-bold shadow-md hover:shadow-lg disabled:opacity-50 transition-all"
                    >
                        {processing ? 'جاري الإرسال...' : 'تقديم للمراجعة'}
                    </button>
                </>
            }
        >
            <form onSubmit={submit} className="space-y-4" encType="multipart/form-data">
                <div className="bg-gold-soft/30 border border-gold/20 rounded-xl p-3 text-xs text-brown-mid leading-relaxed">
                    💡 سيُرسل طلبك للمراجعة من قبل المشرفين، ولن يُضاف الشخص فعلياً إلا بعد الاعتماد.
                </div>

                {/* الصورة الشخصية (اختيارية) */}
                <Field label="الصورة الشخصية (اختياري)" error={errors.photo} hint="JPG / PNG / WEBP — حتى 5 ميجا">
                    <input
                        ref={photoRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={(e) => handlePhotoChange(e.target.files?.[0] ?? null)}
                        className="hidden"
                    />

                    {photoPreview ? (
                        <div className="flex items-center gap-3">
                            <img
                                src={photoPreview}
                                alt="معاينة"
                                className="w-24 h-24 object-cover rounded-full border-2 border-gold/30"
                            />
                            <div className="flex flex-col gap-2">
                                <button
                                    type="button"
                                    onClick={() => photoRef.current?.click()}
                                    className="px-3 py-1.5 bg-white border border-gold/30 text-brown-dark rounded-lg text-xs font-medium hover:bg-gold-soft"
                                >
                                    🔄 تغيير
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handlePhotoChange(null)}
                                    className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-medium hover:bg-rose-100"
                                >
                                    ✕ إزالة
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => photoRef.current?.click()}
                            className="w-full flex flex-col items-center justify-center gap-2 py-5 rounded-xl border-2 border-dashed border-gold/30 bg-beige/50 hover:bg-beige text-brown-mid transition-colors"
                        >
                            <span className="text-2xl">📷</span>
                            <span className="text-sm">اضغط لرفع صورة شخصية</span>
                        </button>
                    )}
                </Field>

                {/* الاسم المختصر أولاً — يُعبّئ الاسم الكامل تلقائياً */}
                <Field label="الاسم المختصر" required error={errors['proposed_data.short_name_ar']}>
                    <input
                        type="text"
                        value={data.proposed_data.short_name_ar}
                        onChange={(e) => updateField('short_name_ar', e.target.value)}
                        className="form-input"
                    />
                </Field>

                <Field
                    label="الاسم الكامل"
                    required
                    error={errors['proposed_data.name_ar']}
                    hint={knownParent?.lineage ? 'يُعبَّأ تلقائياً من الاسم المختصر — يمكنك تعديله' : undefined}
                >
                    <input
                        type="text"
                        value={data.proposed_data.name_ar}
                        onChange={(e) => {
                            setNameTouched(true);
                            updateField('name_ar', e.target.value);
                        }}
                        className="form-input"
                    />
                </Field>

                {/* الجنس */}
                <Field label="الجنس" required error={errors['proposed_data.gender']}>
                    <div className="flex gap-3">
                        <GenderOption
                            active={data.proposed_data.gender === 'male'}
                            onClick={() => updateField('gender', 'male')}
                            label="ذكر"
                            emoji="👳🏽‍♂️"
                        />
                        <GenderOption
                            active={data.proposed_data.gender === 'female'}
                            onClick={() => updateField('gender', 'female')}
                            label="أنثى"
                            emoji="🧕"
                        />
                    </div>
                </Field>

                {/* اللقب */}
                <Field label="اللقب (اختياري)" error={errors['proposed_data.title']}>
                    <input
                        type="text"
                        value={data.proposed_data.title}
                        onChange={(e) => updateField('title', e.target.value)}
                        className="form-input"
                    />
                </Field>

                {/* التواريخ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="سنة الميلاد" error={errors['proposed_data.birth_year']}>
                        <input
                            type="number"
                            value={data.proposed_data.birth_year}
                            onChange={(e) => updateBirthYear(e.target.value)}
                            min="1000"
                            max="2200"
                            className="form-input"
                        />
                    </Field>

                    <Field
                        label="سنة الوفاة"
                        error={errors['proposed_data.death_year']}
                        hint="اتركها فارغة إن لم تكن معروفة"
                    >
                        <input
                            type="number"
                            value={data.proposed_data.death_year}
                            onChange={(e) => updateDeathYear(e.target.value)}
                            min="1000"
                            max="2200"
                            className="form-input"
                        />
                    </Field>
                </div>

                {/* الحالة — تُشتقّ من السنوات تلقائياً، ويمكن تعديلها يدوياً */}
                <Field
                    label="الحالة"
                    error={errors['proposed_data.life_status']}
                    hint="تُحدَّد تلقائياً من السنوات — يمكنك تغييرها يدوياً للأجداد القدامى"
                >
                    <div className="grid grid-cols-3 gap-2">
                        <LifeStatusOption
                            active={data.proposed_data.life_status === 'living'}
                            onClick={() => updateField('life_status', 'living')}
                            label="حيّ"
                            color="emerald"
                        />
                        <LifeStatusOption
                            active={data.proposed_data.life_status === 'deceased'}
                            onClick={() => updateField('life_status', 'deceased')}
                            label="متوفى"
                            color="brown"
                        />
                        <LifeStatusOption
                            active={data.proposed_data.life_status === 'unknown'}
                            onClick={() => updateField('life_status', 'unknown')}
                            label="غير معروف"
                            color="neutral"
                        />
                    </div>
                </Field>

                <Field label="مكان الميلاد (اختياري)" error={errors['proposed_data.birth_place']}>
                    <input
                        type="text"
                        value={data.proposed_data.birth_place}
                        onChange={(e) => updateField('birth_place', e.target.value)}
                        className="form-input"
                    />
                </Field>

                {/* الأم — اختيار ذكي (يعتمد على عدد زوجات الأب) */}
                {knownParent?.gender === 'male' && (
                    <SharedSmartMotherPicker
                        wives={knownParent.wives ?? []}
                        mode={motherMode as SharedMotherMode}
                        switchMode={(m) => switchMotherMode(m as MotherMode)}
                        selectedMotherId={data.proposed_data.mother_id}
                        onPickWife={(id) => updateField('mother_id', id)}
                        otherParent={otherParent}
                        onSearchSelect={handleOtherParentSelect}
                        tribeSlug={tribeSlug}
                        error={errors['proposed_data.mother_id']}
                        onCreateNew={(name) => setCreateMotherInitialName(name)}
                    />
                )}

                {/* الأب — لو الوالد المعروف أنثى */}
                {knownParent?.gender === 'female' && (
                    <Field
                        label="الأب (اختياري)"
                        error={errors['proposed_data.father_id']}
                    >
                        <PersonSearchBox
                            tribeSlug={tribeSlug}
                            placeholder="ابحث عن أب هذا الشخص..."
                            selected={otherParent}
                            onSelect={handleOtherParentSelect}
                            onClear={() => handleOtherParentSelect(null)}
                        />
                    </Field>
                )}

                {/* الأزواج/الزوجات (متعدد) */}
                <Field
                    label={
                        data.proposed_data.gender === 'female'
                            ? 'الزوج (اختياري)'
                            : 'الزوجات (اختياري)'
                    }
                    error={errors['proposed_data.spouse_ids']}
                    hint={
                        data.proposed_data.gender === 'male'
                            ? 'يمكن إضافة أكثر من زوجة — سيُنشأ سجل زواج لكل واحدة'
                            : 'سيُنشأ سجل زواج تلقائياً'
                    }
                >
                    <div className="space-y-2">
                        {/* الأزواج المختارون كـ chips */}
                        {spouses.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {spouses.map((s, i) => (
                                    <SpouseChip
                                        key={s.id}
                                        spouse={s}
                                        order={i + 1}
                                        showOrder={data.proposed_data.gender === 'male' && spouses.length > 1}
                                        onRemove={() => removeSpouse(s.id)}
                                    />
                                ))}
                            </div>
                        )}

                        {/* بحث لإضافة جديد */}
                        {showSpouseSearch ? (
                            <PersonSearchBox
                                tribeSlug={tribeSlug}
                                placeholder={
                                    data.proposed_data.gender === 'female'
                                        ? 'ابحث عن الزوج...'
                                        : 'ابحث عن زوجة...'
                                }
                                selected={null}
                                onSelect={addSpouse}
                                onClear={() => setShowSpouseSearch(false)}
                                onCreateNew={(name) => setCreateSpouseInitialName(name)}
                                createLabel={
                                    data.proposed_data.gender === 'female'
                                        ? 'إنشاء زوج جديد'
                                        : 'إنشاء زوجة جديدة'
                                }
                            />
                        ) : (
                            // الذكر يدعم متعدد، الأنثى زوج واحد فقط
                            (data.proposed_data.gender === 'male' || spouses.length === 0) && (
                                <button
                                    type="button"
                                    onClick={() => setShowSpouseSearch(true)}
                                    className="w-full text-center py-2.5 rounded-xl border-2 border-dashed border-gold/30 text-brown-mid hover:bg-beige hover:text-brown-dark text-sm transition-colors"
                                >
                                    {spouses.length === 0
                                        ? (data.proposed_data.gender === 'female' ? '➕ اختر الزوج' : '➕ اختر زوجة')
                                        : '➕ إضافة زوجة أخرى'}
                                </button>
                            )
                        )}
                    </div>
                </Field>

                <Field label="نبذة تعريفية (اختياري)" error={errors['proposed_data.bio_ar']}>
                    <textarea
                        value={data.proposed_data.bio_ar}
                        onChange={(e) => updateField('bio_ar', e.target.value)}
                        rows={3}
                        className="form-input resize-none"
                    />
                </Field>
            </form>

            <style>{`
                .form-input {
                    width: 100%;
                    padding: 0.625rem 1rem;
                    border: 2px solid rgba(139, 105, 20, 0.2);
                    border-radius: 0.75rem;
                    background: white;
                    color: #3D2B1F;
                    transition: border-color 150ms, box-shadow 150ms;
                }
                .form-input:focus {
                    outline: none;
                    border-color: #8B6914;
                    box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.15);
                }
                .form-input::placeholder {
                    color: rgba(160, 128, 112, 0.6);
                }
            `}</style>

            {/* QuickCreate: زوج/زوجة جديد(ة) */}
            {createSpouseInitialName !== null && (
                <QuickCreatePersonModal
                    isOpen={true}
                    onClose={() => setCreateSpouseInitialName(null)}
                    tribeSlug={tribeSlug}
                    initialName={createSpouseInitialName}
                    fixedGender={data.proposed_data.gender === 'female' ? 'male' : 'female'}
                    title={data.proposed_data.gender === 'female' ? 'إنشاء زوج جديد' : 'إنشاء زوجة جديدة'}
                    onCreated={(p) => {
                        addSpouse(p);
                        setCreateSpouseInitialName(null);
                    }}
                />
            )}

            {/* QuickCreate: أم جديدة (للوالد المعروف) */}
            {createMotherInitialName !== null && (
                <QuickCreatePersonModal
                    isOpen={true}
                    onClose={() => setCreateMotherInitialName(null)}
                    tribeSlug={tribeSlug}
                    initialName={createMotherInitialName}
                    fixedGender="female"
                    title="إنشاء أم جديدة"
                    onCreated={(p) => {
                        setOtherParent(p);
                        updateField('mother_id', p.id);
                        setCreateMotherInitialName(null);
                    }}
                />
            )}
        </Modal>
    );
}

function Field({
    label,
    required,
    error,
    hint,
    children,
}: {
    readonly label: string;
    readonly required?: boolean;
    readonly error?: string;
    readonly hint?: string;
    readonly children: React.ReactNode;
}) {
    return (
        <label className="block">
            <span className="block text-brown-dark text-sm font-medium mb-1.5">
                {label}
                {required && <span className="text-rose-500 mr-1">*</span>}
            </span>
            {children}
            {hint && !error && (
                <span className="block text-brown-light text-[11px] mt-1">{hint}</span>
            )}
            {error && <span className="block text-rose-500 text-xs mt-1">{error}</span>}
        </label>
    );
}

function GenderOption({
    active,
    onClick,
    label,
    emoji,
}: {
    readonly active: boolean;
    readonly onClick: () => void;
    readonly label: string;
    readonly emoji: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`
                flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 font-medium transition-all
                ${active
                    ? 'bg-gold-soft border-gold text-brown-dark shadow-sm'
                    : 'bg-white border-gold/20 text-brown-mid hover:border-gold/40'
                }
            `}
        >
            <span className="text-xl">{emoji}</span>
            <span>{label}</span>
        </button>
    );
}

function LifeStatusOption({
    active,
    onClick,
    label,
    color,
}: {
    readonly active: boolean;
    readonly onClick: () => void;
    readonly label: string;
    readonly color: 'emerald' | 'brown' | 'neutral';
}) {
    const activeStyles: Record<typeof color, string> = {
        emerald: 'bg-emerald-50 border-emerald-400 text-emerald-700 shadow-sm',
        brown:   'bg-brown-dark/5 border-brown-mid text-brown-dark shadow-sm',
        neutral: 'bg-beige border-brown-light/40 text-brown-dark shadow-sm',
    };
    const dot: Record<typeof color, string> = {
        emerald: 'bg-emerald-500',
        brown:   'bg-brown-mid',
        neutral: 'bg-brown-light/40',
    };
    return (
        <button
            type="button"
            onClick={onClick}
            className={`
                flex items-center justify-center gap-2 py-2 rounded-xl border-2 text-sm font-medium transition-all
                ${active
                    ? activeStyles[color]
                    : 'bg-white border-gold/20 text-brown-mid hover:border-gold/40'
                }
            `}
        >
            <span className={`w-2 h-2 rounded-full ${dot[color]}`} />
            <span>{label}</span>
        </button>
    );
}

/* ═══════════════════════════════════════════════
   SpouseChip — chip للزوج/الزوجة المختار
   ═══════════════════════════════════════════════ */
function SpouseChip({
    spouse,
    order,
    showOrder,
    onRemove,
}: {
    readonly spouse: PersonSuggestion;
    readonly order: number;
    readonly showOrder: boolean;
    readonly onRemove: () => void;
}) {
    const orderLabels: Record<number, string> = {
        1: 'الأولى',
        2: 'الثانية',
        3: 'الثالثة',
        4: 'الرابعة',
    };

    return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-sm">
            {showOrder && (
                <span className="text-[10px] bg-rose-200 px-1.5 py-0.5 rounded font-bold">
                    {orderLabels[order] ?? order}
                </span>
            )}
            <span className="font-medium">{spouse.short_name_ar}</span>
            <button
                type="button"
                onClick={onRemove}
                className="w-5 h-5 rounded-full hover:bg-rose-200 flex items-center justify-center text-rose-700 text-xs"
                aria-label="إزالة"
            >
                ✕
            </button>
        </div>
    );
}

/* ═══════════════════════════════════════════════
   SmartMotherPicker — اختيار ذكي للأم
   ═══════════════════════════════════════════════ */
function SmartMotherPicker({
    wives,
    mode,
    switchMode,
    selectedMotherId,
    onPickWife,
    otherParent,
    onSearchSelect,
    tribeSlug,
    error,
}: {
    readonly wives: PersonSuggestion[];
    readonly mode: MotherMode;
    readonly switchMode: (m: MotherMode) => void;
    readonly selectedMotherId: number | null;
    readonly onPickWife: (id: number | null) => void;
    readonly otherParent: PersonSuggestion | null;
    readonly onSearchSelect: (p: PersonSuggestion | null) => void;
    readonly tribeSlug: string;
    readonly error?: string;
}) {
    // الحالة 1: زوجة وحيدة → عرضها تلقائياً مع زر تغيير
    if (mode === 'auto' && wives.length === 1) {
        const w = wives[0];
        return (
            <Field label="الأم" hint="تم تحديد الزوجة الوحيدة للأب تلقائياً" error={error}>
                <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200">
                    <span className="text-rose-900 font-medium">🧕 {w.short_name_ar}</span>
                    <button
                        type="button"
                        onClick={() => switchMode('search_other')}
                        className="text-xs text-brown-mid hover:text-brown-dark underline underline-offset-2"
                    >
                        تغيير
                    </button>
                </div>
            </Field>
        );
    }

    // الحالة 2: عدة زوجات → اختيار من القائمة
    if (mode === 'pick_wife' && wives.length > 1) {
        return (
            <Field
                label="الأم"
                hint="اختر من زوجات الأب، أو اختر «أخرى» لأي حالة خاصة (تبني...)"
                error={error}
            >
                <div className="space-y-2">
                    {wives.map((w) => (
                        <button
                            key={w.id}
                            type="button"
                            onClick={() => onPickWife(w.id)}
                            className={`
                                w-full text-right px-4 py-2.5 rounded-xl border-2 transition-all flex items-center gap-2
                                ${selectedMotherId === w.id
                                    ? 'bg-rose-50 border-rose-400 text-rose-900 font-medium'
                                    : 'bg-white border-gold/20 text-brown-mid hover:border-gold/40'
                                }
                            `}
                        >
                            <span>🧕</span>
                            <span>{w.short_name_ar}</span>
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={() => switchMode('search_other')}
                        className="w-full text-center py-2 rounded-xl border border-dashed border-gold/30 text-brown-mid hover:bg-beige text-sm transition-colors"
                    >
                        ✏️ أخرى... (تبني / غير مذكورة / من خارج هذا الأب)
                    </button>
                </div>
            </Field>
        );
    }

    // الحالة 3: بحث عام (لو لا زوجات أو اختار "أخرى")
    return (
        <Field
            label="الأم (اختياري)"
            hint={
                wives.length > 0
                    ? 'اتركها فارغة لو غير مذكورة، أو ابحث عن أم من خارج زوجات هذا الأب'
                    : 'لا توجد زوجات مسجّلة لهذا الأب — يمكنك البحث عن أي أم'
            }
            error={error}
        >
            <div className="space-y-2">
                <PersonSearchBox
                    tribeSlug={tribeSlug}
                    placeholder="ابحث عن أم هذا الشخص..."
                    selected={otherParent}
                    onSelect={onSearchSelect}
                    onClear={() => onSearchSelect(null)}
                />
                {wives.length > 0 && (
                    <button
                        type="button"
                        onClick={() => switchMode(wives.length === 1 ? 'auto' : 'pick_wife')}
                        className="text-xs text-gold hover:text-gold-light underline underline-offset-2"
                    >
                        ← العودة لاختيار من زوجات الأب
                    </button>
                )}
            </div>
        </Field>
    );
}
