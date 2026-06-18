<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFeedbackRequest extends FormRequest
{
    public function authorize(): bool
    {
        // أي مستخدم مسجّل يستطيع الإرسال
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'type'       => ['required', Rule::in(['idea', 'bug'])],
            'message'    => ['required', 'string', 'min:5', 'max:5000'],
            'page_url'   => ['nullable', 'string', 'max:1000'],
            'screenshot' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'type.required'    => 'يرجى اختيار نوع الرسالة.',
            'message.required' => 'يرجى كتابة الرسالة.',
            'message.min'      => 'الرسالة قصيرة جداً.',
            'screenshot.image' => 'الملف المرفق يجب أن يكون صورة.',
            'screenshot.max'   => 'حجم الصورة يجب ألا يتجاوز 5 ميجابايت.',
        ];
    }
}
