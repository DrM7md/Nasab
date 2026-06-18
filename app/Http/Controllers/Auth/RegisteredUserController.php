<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\Tribe;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * صفحة التسجيل — نمرّر القبائل والباقات.
     */
    public function create(): Response
    {
        $tribes = Tribe::where('is_active', true)
            ->orderBy('name_ar')
            ->get(['id', 'name_ar', 'slug'])
            ->map(fn ($t) => ['id' => $t->id, 'name_ar' => $t->name_ar, 'slug' => $t->slug]);

        $packages = Package::where('is_active', true)
            ->ordered()
            ->get()
            ->map(fn (Package $p) => [
                'id'            => $p->id,
                'name_ar'       => $p->name_ar,
                'description_ar' => $p->description_ar,
                'price_monthly' => (float) $p->price_monthly,
                'price_yearly'  => (float) $p->price_yearly,
                'currency'      => $p->currency,
                'features'      => $p->features ?? [],
                'max_persons'   => $p->max_persons,
                'max_members'   => $p->max_members,
                'color'         => $p->color,
                'is_featured'   => $p->is_featured,
            ]);

        return Inertia::render('Auth/Register', [
            'tribes'   => $tribes,
            'packages' => $packages,
        ]);
    }

    /**
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'email'       => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:' . User::class],
            'phone'       => 'required|string|max:30',
            'national_id' => ['required', 'string', 'max:50', 'unique:' . User::class . ',national_id'],
            'nationality' => 'required|string|max:60',
            'password'    => ['required', 'confirmed', 'string', 'min:4'],
            'id_card_photo' => ['required', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'],

            // مسار التسجيل
            'join_intent' => ['required', Rule::in(['member', 'found_tribe', 'claim_admin'])],

            // عضو أو مطالبة → قبيلة موجودة مفعّلة
            'requested_tribe_id' => [
                'required_if:join_intent,member,claim_admin',
                'nullable', 'integer',
                Rule::exists('tribes', 'id')->where('is_active', true),
            ],

            // تأسيس → اسم قبيلة جديد غير موجود
            'new_tribe_name_ar' => [
                'required_if:join_intent,found_tribe',
                'nullable', 'string', 'max:255',
                Rule::unique('tribes', 'name_ar'),
            ],
            'new_tribe_description' => ['nullable', 'string', 'max:2000'],

            // باقة → مطلوبة لمن يريد أن يكون مديرًا
            'requested_package_id' => [
                'required_if:join_intent,found_tribe,claim_admin',
                'nullable', 'integer',
                Rule::exists('packages', 'id')->where('is_active', true),
            ],

            // سبب المطالبة
            'claim_reason' => ['required_if:join_intent,claim_admin', 'nullable', 'string', 'max:1000'],
        ], [
            'name.required'        => 'الاسم مطلوب.',
            'email.required'       => 'البريد الإلكتروني مطلوب.',
            'email.unique'         => 'هذا البريد مسجّل مسبقاً.',
            'phone.required'       => 'رقم الهاتف مطلوب.',
            'national_id.required' => 'الرقم الشخصي مطلوب.',
            'national_id.unique'   => 'الرقم الشخصي مستخدم مسبقاً.',
            'nationality.required' => 'الجنسية مطلوبة.',
            'password.required'    => 'كلمة المرور مطلوبة.',
            'password.confirmed'   => 'تأكيد كلمة المرور غير مطابق.',
            'requested_tribe_id.required_if'   => 'الرجاء اختيار قبيلة.',
            'requested_tribe_id.exists'        => 'القبيلة المختارة غير موجودة.',
            'new_tribe_name_ar.required_if'    => 'اكتب اسم القبيلة الجديدة.',
            'new_tribe_name_ar.unique'         => 'هذه القبيلة موجودة بالفعل — اختر مسار «قبيلتي موجودة» للمطالبة بإدارتها.',
            'requested_package_id.required_if' => 'الرجاء اختيار باقة.',
            'claim_reason.required_if'         => 'يرجى توضيح سبب طلب الإدارة.',
            'id_card_photo.required'           => 'صورة البطاقة الشخصية مطلوبة.',
            'id_card_photo.image'              => 'الملف يجب أن يكون صورة.',
            'id_card_photo.max'                => 'حجم الصورة يجب ألا يتجاوز 5 ميجا.',
        ]);

        $path = $request->file('id_card_photo')->store('id-cards', 'public');

        $intent = $validated['join_intent'];
        $tribeId = null;
        $packageId = null;
        $claimReason = null;

        if ($intent === User::INTENT_MEMBER) {
            $tribeId = $validated['requested_tribe_id'];
        } elseif ($intent === User::INTENT_FOUND_TRIBE) {
            $newTribe = Tribe::create([
                'name_ar'        => trim($validated['new_tribe_name_ar']),
                'slug'           => $this->uniqueSlug($validated['new_tribe_name_ar']),
                'description_ar' => $validated['new_tribe_description'] ?? null,
                'theme_color'    => '#8B6914',
                'is_active'      => false,           // تنتظر اعتماد المدير العام
            ]);
            $tribeId = $newTribe->id;
            $packageId = $validated['requested_package_id'];
        } else { // claim_admin
            $tribeId = $validated['requested_tribe_id'];
            $packageId = $validated['requested_package_id'];
            $claimReason = $validated['claim_reason'];
        }

        $user = User::create([
            'name'                 => $validated['name'],
            'email'                => $validated['email'],
            'phone'                => $validated['phone'],
            'national_id'          => $validated['national_id'],
            'nationality'          => $validated['nationality'],
            'password'             => Hash::make($validated['password']),
            'id_card_photo'        => $path,
            'tribe_id'             => null,
            'requested_tribe_id'   => $tribeId,
            'join_intent'          => $intent,
            'requested_package_id' => $packageId,
            'claim_reason'         => $claimReason,
            'role'                 => User::ROLE_VIEWER,
            'is_active'            => true,
            'last_active_at'       => now(),
        ]);

        event(new Registered($user));
        Auth::login($user);

        $message = match ($intent) {
            User::INTENT_FOUND_TRIBE => 'تم تقديم طلب تأسيس قبيلتك مع الباقة المختارة. سيراجعه المدير العام ويعتمده.',
            User::INTENT_CLAIM_ADMIN => 'تم تقديم طلبك لإدارة القبيلة. سيراجعه المدير العام ويتحقّق من حالة المدير الحالي.',
            default                  => 'تم إرسال طلب انضمامك للقبيلة. سيراجعه المشرفون قريباً.',
        };

        return redirect(route('dashboard', absolute: false))->with('info', $message);
    }

    /**
     * يُولّد slug فريد للقبيلة.
     */
    protected function uniqueSlug(string $name): string
    {
        $base = Str::slug($name);
        if ($base === '') {
            $base = 'tribe-' . Str::lower(Str::random(5));
        }

        $slug = $base;
        $counter = 1;
        while (Tribe::where('slug', $slug)->exists()) {
            $slug = $base . '-' . (++$counter);
        }

        return $slug;
    }
}
