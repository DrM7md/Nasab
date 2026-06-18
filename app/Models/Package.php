<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Package extends Model
{
    use HasFactory;

    /**
     * القدرات القابلة للتفعيل — مفتاح => تسمية عربية.
     * data_export قابلة للفرض برمجيًا؛ والبقية حاليًا إعلامية/تشغيلية.
     */
    public const CAPABILITIES = [
        'data_export'        => 'تصدير بيانات الشجرة (CSV)',
        'custom_certificate' => 'وثيقة نسب قابلة للطباعة',
        'custom_subdomain'   => 'نطاق فرعي مخصّص',
        'priority_support'   => 'دعم بأولوية',
        'account_manager'    => 'مدير حساب مخصّص',
    ];

    protected $fillable = [
        'name_ar', 'slug', 'description_ar',
        'price_monthly', 'price_yearly', 'currency',
        'features', 'capabilities', 'max_persons', 'max_members',
        'color', 'is_featured', 'is_active', 'sort_order',
    ];

    protected $casts = [
        'features'      => 'array',
        'capabilities'  => 'array',
        'price_monthly' => 'decimal:2',
        'price_yearly'  => 'decimal:2',
        'is_featured'   => 'boolean',
        'is_active'     => 'boolean',
    ];

    public function hasCapability(string $key): bool
    {
        return in_array($key, $this->capabilities ?? [], true);
    }

    public function tribes(): HasMany
    {
        return $this->hasMany(Tribe::class);
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order')->orderBy('price_monthly');
    }
}
