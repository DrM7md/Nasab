<?php

namespace App\Traits;

use App\Models\Tribe;
use App\Support\TenantManager;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Trait BelongsToTribe
 *
 * يُستخدم في أي Model مرتبط بقبيلة (Person, Marriage, ParentChild, PendingEdit...).
 * يوفر:
 *  - علاقة tribe()
 *  - Scope whereTribe() للحصر بقبيلة معينة
 *  - Global scope يُطبَّق تلقائياً على القبيلة الحالية (اختياري)
 *  - ملء tribe_id تلقائياً عند الإنشاء
 */
trait BelongsToTribe
{
    protected static function bootBelongsToTribe(): void
    {
        // ملء tribe_id تلقائياً من الـ TenantManager عند الإنشاء
        static::creating(function ($model) {
            if (empty($model->tribe_id) && $tribeId = app(TenantManager::class)->id()) {
                $model->tribe_id = $tribeId;
            }
        });
    }

    public function tribe(): BelongsTo
    {
        return $this->belongsTo(Tribe::class);
    }

    public function scopeWhereTribe(Builder $query, int|Tribe|null $tribe = null): Builder
    {
        $id = match (true) {
            $tribe instanceof Tribe => $tribe->id,
            is_int($tribe)          => $tribe,
            default                 => app(TenantManager::class)->id(),
        };

        return $id ? $query->where($this->getTable() . '.tribe_id', $id) : $query;
    }
}
