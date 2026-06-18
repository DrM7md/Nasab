import QuickCreatePersonModal from '@/Components/Person/QuickCreatePersonModal';
import PersonSearchBox, { type PersonSuggestion } from '@/Components/Search/PersonSearchBox';
import SmartMotherPicker, { type MotherMode } from '@/Components/Person/SmartMotherPicker';
import SpouseChip from '@/Components/Person/SpouseChip';
import Modal from '@/Components/UI/Modal';
import type { Gender, LifeStatus } from '@/types';
import { useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

interface PersonData {
    id: number;
    name_ar: string;
    short_name_ar: string;
    gender: Gender;
    title?: string | null;
    birth_year?: number | null;
    death_year?: number | null;
    life_status?: LifeStatus;
    birth_place?: string | null;
    death_place?: string | null;
    bio_ar?: string | null;
    photo?: string | null;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    tribeSlug: string;
    person: PersonData;
    /** الأزواج/الزوجات الحاليون (للعرض المُسبَق في القائمة) */
    currentSpouses?: PersonSuggestion[];
    /** معرّف الأم الحالية (لتحديدها مسبقاً) */
    currentMotherId?: number | null;
    /** زوجات الأب (للاختيار الذكي للأم) */
    fatherWives?: PersonSuggestion[];
    /** هل الشخص له أب (لإظهار حقل الأم)؟ */
    hasFather?: boolean;
}

/**
 * EditPersonModal — تعديل بيانات شخص موجود.
 * يُقدّم طلب edit_person — يُطبَّق فوراً للمشرفين، أو ينتظر اعتماد للأعضاء.
 */
export default function EditPersonModal({
    isOpen,
    onClose,
    tribeSlug,
    person,
    currentSpouses = [],
    currentMotherId = null,
    fatherWives = [],
    hasFather = false,
}: Props) {
    const photoRef = useRef<HTMLInputElement>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    /* ═════════ حالة الزواج ═════════ */
    const [spouses, setSpouses] = useState<PersonSuggestion[]>(currentSpouses);
    const [showSpouseSearch, setShowSpouseSearch] = useState(false);

    /* ═════════ حالة اختيار الأم ═════════ */
    const [motherMode, setMotherMode] = useState<MotherMode>('none');
    const [otherMother, setOtherMother] = useState<PersonSuggestion | null>(null);

    /* ═════════ Quick-create modals ═════════ */
    const [createSpouseInitialName, setCreateSpouseInitialName] = useState<string | null>(null);
    const [createMotherInitialName, setCreateMotherInitialName] = useState<string | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm<{
        edit_type: string;
        target_id: number;
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
            death_place: string;
            bio_ar: string;
            mother_id: number | null;
            spouse_ids: number[];
        };
    }>({
        edit_type: 'edit_person',
        target_id: person.id,
        photo: null,
        proposed_data: {
            name_ar: person.name_ar ?? '',
            short_name_ar: person.short_name_ar ?? '',
            gender: person.gender,
            title: person.title ?? '',
            birth_year: person.birth_year ? String(person.birth_year) : '',
            death_year: person.death_year ? String(person.death_year) : '',
            life_status: person.life_status ?? 'unknown',
            birth_place: person.birth_place ?? '',
            death_place: person.death_place ?? '',
            bio_ar: person.bio_ar ?? '',
            mother_id: currentMotherId,
            spouse_ids: currentSpouses.map((s) => s.id),
        },
    });

    // Reset عند فتح المودال أو تغيير الشخص
    useEffect(() => {
        if (!isOpen) return;

        setData({
            edit_type: 'edit_person',
            target_id: person.id,
            photo: null,
            proposed_data: {
                name_ar: person.name_ar ?? '',
                short_name_ar: person.short_name_ar ?? '',
                gender: person.gender,
                title: person.title ?? '',
                birth_year: person.birth_year ? String(person.birth_year) : '',
                death_year: person.death_year ? String(person.death_year) : '',
                life_status: person.life_status ?? 'unknown',
                birth_place: person.birth_place ?? '',
                death_place: person.death_place ?? '',
                bio_ar: person.bio_ar ?? '',
                mother_id: currentMotherId,
                spouse_ids: currentSpouses.map((s) => s.id),
            },
        });

        // الزواج
        setSpouses(currentSpouses);
        setShowSpouseSearch(false);

        // الأم — وضع ذكي
        let initialMode: MotherMode;
        let initialOther: PersonSuggestion | null = null;

        if (!hasFather) {
            initialMode = 'none';
        } else if (fatherWives.length === 0) {
            initialMode = 'search_other';
        } else if (
            currentMotherId !== null
            && !fatherWives.some((w) => w.id === currentMotherId)
        ) {
            // الأم الحالية ليست من زوجات الأب → بحث "أخرى"
            initialMode = 'search_other';
            const matchedOther = currentSpouses.find((s) => s.id === currentMotherId);
            initialOther = matchedOther ?? null;
        } else if (fatherWives.length === 1) {
            initialMode = 'auto';
        } else {
            initialMode = 'pick_wife';
        }
        setMotherMode(initialMode);
        setOtherMother(initialOther);

        if (photoPreview) URL.revokeObjectURL(photoPreview);
        setPhotoPreview(null);
        if (photoRef.current) photoRef.current.value = '';
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, person.id]);

    const handlePhotoChange = (file: File | null) => {
        setData('photo', file);
        if (photoPreview) URL.revokeObjectURL(photoPreview);
        setPhotoPreview(file ? URL.createObjectURL(file) : null);
    };

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

    /* ═════════ إدارة الزواج ═════════ */
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

    /* ═════════ إدارة الأم ═════════ */
    const switchMotherMode = (mode: MotherMode) => {
        setMotherMode(mode);
        if (mode === 'auto' && fatherWives.length === 1) {
            updateField('mother_id', fatherWives[0].id);
        } else if (mode === 'pick_wife' && fatherWives.length > 0) {
            const stillValid = fatherWives.some((w) => w.id === data.proposed_data.mother_id);
            updateField('mother_id', stillValid ? data.proposed_data.mother_id : fatherWives[0].id);
        } else if (mode === 'search_other' || mode === 'none') {
            updateField('mother_id', null);
            setOtherMother(null);
        }
    };

    const handleMotherSearchSelect = (p: PersonSuggestion | null) => {
        setOtherMother(p);
        updateField('mother_id', p?.id ?? null);
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
            title={`تعديل بيانات — ${person.short_name_ar}`}
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
                        {processing ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                    </button>
                </>
            }
        >
            <form onSubmit={submit} className="space-y-4" encType="multipart/form-data">
                {/* الصورة الشخصية */}
                <Field label="الصورة الشخصية" error={errors.photo} hint="JPG / PNG / WEBP — حتى 5 ميجا">
                    <input
                        ref={photoRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={(e) => handlePhotoChange(e.target.files?.[0] ?? null)}
                        className="hidden"
                    />

                    {(() => {
                        const displayed = photoPreview ?? person.photo;
                        if (displayed) {
                            return (
                                <div className="flex items-center gap-3">
                                    <img
                                        src={displayed}
                                        alt={person.short_name_ar}
                                        className="w-24 h-24 object-cover rounded-full border-2 border-gold/30"
                                    />
                                    <div className="flex flex-col gap-2">
                                        <button
                                            type="button"
                                            onClick={() => photoRef.current?.click()}
                                            className="px-3 py-1.5 bg-white border border-gold/30 text-brown-dark rounded-lg text-xs font-medium hover:bg-gold-soft"
                                        >
                                            🔄 استبدال
                                        </button>
                                        {photoPreview && (
                                            <button
                                                type="button"
                                                onClick={() => handlePhotoChange(null)}
                                                className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-medium hover:bg-rose-100"
                                            >
                                                ✕ إلغاء التغيير
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        }
                        return (
                            <button
                                type="button"
                                onClick={() => photoRef.current?.click()}
                                className="w-full flex flex-col items-center justify-center gap-2 py-5 rounded-xl border-2 border-dashed border-gold/30 bg-beige/50 hover:bg-beige text-brown-mid transition-colors"
                            >
                                <span className="text-2xl">📷</span>
                                <span className="text-sm">اضغط لرفع صورة شخصية</span>
                            </button>
                        );
                    })()}
                </Field>

                <Field label="الاسم المختصر" required error={errors['proposed_data.short_name_ar']}>
                    <input
                        type="text"
                        value={data.proposed_data.short_name_ar}
                        onChange={(e) => updateField('short_name_ar', e.target.value)}
                        className="form-input"
                    />
                </Field>

                <Field label="الاسم الكامل" required error={errors['proposed_data.name_ar']}>
                    <input
                        type="text"
                        value={data.proposed_data.name_ar}
                        onChange={(e) => updateField('name_ar', e.target.value)}
                        className="form-input"
                    />
                </Field>

                <Field label="الجنس" required error={errors['proposed_data.gender']}>
                    <div className="flex gap-3">
                        <GenderOption
                            active={data.proposed_data.gender === 'male'}
                            onClick={() => updateField('gender', 'male')}
                            label="ذكر"
                        />
                        <GenderOption
                            active={data.proposed_data.gender === 'female'}
                            onClick={() => updateField('gender', 'female')}
                            label="أنثى"
                        />
                    </div>
                </Field>

                <Field label="اللقب (اختياري)" error={errors['proposed_data.title']}>
                    <input
                        type="text"
                        value={data.proposed_data.title}
                        onChange={(e) => updateField('title', e.target.value)}
                        className="form-input"
                    />
                </Field>

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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="مكان الميلاد" error={errors['proposed_data.birth_place']}>
                        <input
                            type="text"
                            value={data.proposed_data.birth_place}
                            onChange={(e) => updateField('birth_place', e.target.value)}
                            className="form-input"
                        />
                    </Field>

                    <Field label="مكان الوفاة" error={errors['proposed_data.death_place']}>
                        <input
                            type="text"
                            value={data.proposed_data.death_place}
                            onChange={(e) => updateField('death_place', e.target.value)}
                            className="form-input"
                        />
                    </Field>
                </div>

                <Field label="نبذة تعريفية" error={errors['proposed_data.bio_ar']}>
                    <textarea
                        value={data.proposed_data.bio_ar}
                        onChange={(e) => updateField('bio_ar', e.target.value)}
                        rows={3}
                        className="form-input resize-none"
                    />
                </Field>

                {/* ═════════ الأم — اختيار ذكي (يظهر لو للشخص أب) ═════════ */}
                {hasFather && (
                    <SmartMotherPicker
                        label="الأم"
                        wives={fatherWives}
                        mode={motherMode}
                        switchMode={switchMotherMode}
                        selectedMotherId={data.proposed_data.mother_id}
                        onPickWife={(id) => updateField('mother_id', id)}
                        otherParent={otherMother}
                        onSearchSelect={handleMotherSearchSelect}
                        tribeSlug={tribeSlug}
                        error={errors['proposed_data.mother_id']}
                        onCreateNew={(name) => setCreateMotherInitialName(name)}
                    />
                )}

                {/* ═════════ الأزواج/الزوجات (متعدد للذكر) ═════════ */}
                <Field
                    label={data.proposed_data.gender === 'female' ? 'الزوج' : 'الزوجات'}
                    error={errors['proposed_data.spouse_ids']}
                    hint={
                        data.proposed_data.gender === 'male'
                            ? 'يمكن إضافة عدة زوجات. إزالة chip تحذف سجل الزواج عند الحفظ.'
                            : 'إزالة chip تحذف سجل الزواج عند الحفظ.'
                    }
                >
                    <div className="space-y-2">
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

            {/* QuickCreate: أم جديدة */}
            {createMotherInitialName !== null && (
                <QuickCreatePersonModal
                    isOpen={true}
                    onClose={() => setCreateMotherInitialName(null)}
                    tribeSlug={tribeSlug}
                    initialName={createMotherInitialName}
                    fixedGender="female"
                    title="إنشاء أم جديدة"
                    onCreated={(p) => {
                        setOtherMother(p);
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
}: {
    readonly active: boolean;
    readonly onClick: () => void;
    readonly label: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`
                flex-1 py-2.5 rounded-xl border-2 font-medium transition-all
                ${active
                    ? 'bg-gold-soft border-gold text-brown-dark shadow-sm'
                    : 'bg-white border-gold/20 text-brown-mid hover:border-gold/40'
                }
            `}
        >
            {label}
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
