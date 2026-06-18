<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePendingEditRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        return $user !== null && $user->canEdit();
    }

    public function rules(): array
    {
        $tribe = currentTribe();
        $tribeId = $tribe?->id ?? 0;

        return [
            'edit_type' => ['required', Rule::in(['add_person', 'edit_person', 'delete'])],
            'target_id' => [
                'nullable',
                'integer',
                Rule::exists('persons', 'id')->where('tribe_id', $tribeId),
                Rule::requiredIf(fn () => in_array(
                    $this->input('edit_type'),
                    ['edit_person', 'delete'],
                    true
                )),
            ],

            // proposed_data ليست ضرورية لطلب الحذف
            'proposed_data'               => ['required_unless:edit_type,delete', 'nullable', 'array'],
            'proposed_data.name_ar'       => ['required_if:edit_type,add_person', 'nullable', 'string', 'max:255'],
            'proposed_data.name_en'       => ['nullable', 'string', 'max:255'],
            'proposed_data.short_name_ar' => ['required_if:edit_type,add_person', 'nullable', 'string', 'max:100'],
            'proposed_data.gender'        => ['required_if:edit_type,add_person', 'nullable', Rule::in(['male', 'female'])],
            'proposed_data.title'         => ['nullable', 'string', 'max:50'],
            'proposed_data.birth_year'    => ['nullable', 'integer', 'min:1000', 'max:2200'],
            'proposed_data.death_year'    => ['nullable', 'integer', 'min:1000', 'max:2200', 'gte:proposed_data.birth_year'],
            'proposed_data.life_status'   => ['nullable', Rule::in(['living', 'deceased', 'unknown'])],
            'proposed_data.birth_place'   => ['nullable', 'string', 'max:255'],
            'proposed_data.death_place'   => ['nullable', 'string', 'max:255'],
            'proposed_data.bio_ar'        => ['nullable', 'string', 'max:5000'],

            'proposed_data.father_id' => [
                'nullable',
                'integer',
                Rule::exists('persons', 'id')->where('tribe_id', $tribeId)->where('gender', 'male'),
            ],
            'proposed_data.mother_id' => [
                'nullable',
                'integer',
                Rule::exists('persons', 'id')->where('tribe_id', $tribeId)->where('gender', 'female'),
            ],

            // قائمة الأزواج/الزوجات (يدعم المتعدد للذكر)
            'proposed_data.spouse_ids'   => ['nullable', 'array'],
            'proposed_data.spouse_ids.*' => [
                'integer',
                Rule::exists('persons', 'id')
                    ->where('tribe_id', $tribeId)
                    ->where('gender', $this->oppositeGender()),
            ],

            // صورة الشخص (اختيارية) — يحفظها الـ controller ويضع المسار في proposed_data
            'photo' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'],
        ];
    }

    protected function oppositeGender(): string
    {
        return $this->input('proposed_data.gender') === 'female' ? 'male' : 'female';
    }

    public function messages(): array
    {
        return [
            'proposed_data.name_ar.required_if'       => 'الاسم الكامل بالعربية مطلوب.',
            'proposed_data.short_name_ar.required_if' => 'الاسم المختصر مطلوب.',
            'proposed_data.gender.required_if'        => 'الجنس مطلوب.',
            'proposed_data.death_year.gte'            => 'سنة الوفاة يجب أن تكون بعد سنة الميلاد.',
            'proposed_data.father_id.exists'          => 'الأب المحدد غير موجود أو ليس ذكراً.',
            'proposed_data.mother_id.exists'          => 'الأم المحددة غير موجودة أو ليست أنثى.',
            'proposed_data.spouse_ids.*.exists'       => 'أحد الأزواج/الزوجات غير موجود أو من نفس الجنس.',
        ];
    }
}
