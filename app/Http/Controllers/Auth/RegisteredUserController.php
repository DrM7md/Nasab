<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Tribe;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * صفحة التسجيل — نمرّر قائمة القبائل لاختيار واحدة.
     */
    public function create(): Response
    {
        $tribes = Tribe::where('is_active', true)
            ->orderBy('name_ar')
            ->get(['id', 'name_ar', 'slug'])
            ->map(fn ($t) => [
                'id' => $t->id,
                'name_ar' => $t->name_ar,
                'slug' => $t->slug,
            ]);

        return Inertia::render('Auth/Register', [
            'tribes' => $tribes,
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

            // إما اختيار قبيلة موجودة أو اقتراح قبيلة جديدة
            'requested_tribe_id' => [
                'required_without:new_tribe_name_ar',
                'nullable',
                'integer',
                Rule::exists('tribes', 'id')->where('is_active', true),
            ],
            'new_tribe_name_ar' => [
                'required_without:requested_tribe_id',
                'nullable',
                'string',
                'max:255',
            ],
            'new_tribe_description' => ['nullable', 'string', 'max:2000'],
        ], [
            'name.required'               => 'الاسم مطلوب.',
            'email.required'              => 'البريد الإلكتروني مطلوب.',
            'email.unique'                => 'هذا البريد مسجّل مسبقاً.',
            'phone.required'              => 'رقم الهاتف مطلوب.',
            'national_id.required'        => 'الرقم الشخصي مطلوب.',
            'national_id.unique'          => 'الرقم الشخصي مستخدم مسبقاً.',
            'nationality.required'        => 'الجنسية مطلوبة.',
            'password.required'           => 'كلمة المرور مطلوبة.',
            'password.confirmed'          => 'تأكيد كلمة المرور غير مطابق.',
            'requested_tribe_id.required_without' => 'الرجاء اختيار قبيلة أو اقتراح قبيلة جديدة.',
            'requested_tribe_id.exists'   => 'القبيلة المختارة غير موجودة.',
            'new_tribe_name_ar.required_without' => 'اكتب اسم القبيلة المقترحة.',
            'id_card_photo.required'      => 'صورة البطاقة الشخصية مطلوبة.',
            'id_card_photo.image'         => 'الملف يجب أن يكون صورة.',
            'id_card_photo.max'           => 'حجم الصورة يجب ألا يتجاوز 5 ميجا.',
        ]);

        // رفع البطاقة
        $path = $request->file('id_card_photo')->store('id-cards', 'public');

        // تحديد القبيلة:
        //   1) إن اختار من القائمة → نستخدمها
        //   2) إن اقترح اسماً جديداً:
        //      - لو موجودة بنفس الاسم → نربطه بها
        //      - وإلا ننشئها بحالة معطّلة (تنتظر اعتماد المدير العام)
        $tribeId = $validated['requested_tribe_id'] ?? null;
        $createdNewTribe = false;

        if (! $tribeId && ! empty($validated['new_tribe_name_ar'])) {
            $proposedName = trim($validated['new_tribe_name_ar']);

            $existing = Tribe::where('name_ar', $proposedName)->first();
            if ($existing) {
                $tribeId = $existing->id;
            } else {
                $newTribe = Tribe::create([
                    'name_ar'           => $proposedName,
                    'slug'              => $this->uniqueSlug($proposedName),
                    'description_ar'    => $validated['new_tribe_description'] ?? null,
                    'theme_color'       => '#8B6914',
                    'is_active'         => false, // تنتظر مراجعة المدير العام
                    'subscription_plan' => 'free',
                ]);
                $tribeId = $newTribe->id;
                $createdNewTribe = true;
            }
        }

        $user = User::create([
            'name'               => $validated['name'],
            'email'              => $validated['email'],
            'phone'              => $validated['phone'],
            'national_id'        => $validated['national_id'],
            'nationality'        => $validated['nationality'],
            'password'           => Hash::make($validated['password']),
            'requested_tribe_id' => $tribeId,
            'id_card_photo'      => $path,
            'tribe_id'           => null,
            'role'               => User::ROLE_VIEWER,
            'is_active'          => true,
        ]);

        event(new Registered($user));
        Auth::login($user);

        $message = $createdNewTribe
            ? 'تم تقديم اقتراحك بإنشاء قبيلة جديدة. سيراجع المدير العام الطلب أولاً ثم يُعتمد انضمامك.'
            : 'تم إرسال طلب انضمامك للقبيلة. سيراجعه المشرفون قريباً.';

        return redirect(route('dashboard', absolute: false))->with('info', $message);
    }

    /**
     * يُولّد slug فريد للقبيلة بإضافة بادئة عشوائية لو الأساس مأخوذ.
     */
    protected function uniqueSlug(string $name): string
    {
        $base = Str::slug($name);
        if ($base === '') {
            $base = 'tribe';
        }

        $slug = $base;
        $counter = 1;
        while (Tribe::where('slug', $slug)->exists()) {
            $slug = $base . '-' . $counter;
            $counter++;
        }

        return $slug;
    }
}
