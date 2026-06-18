<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Package extends Model
{
    use HasFactory;

    protected $fillable = [
        'name_ar', 'slug', 'description_ar',
        'price_monthly', 'price_yearly', 'currency',
        'features', 'max_persons', 'max_members',
        'color', 'is_featured', 'is_active', 'sort_order',
    ];

    protected $casts = [
        'features'      => 'array',
        'price_monthly' => 'decimal:2',
        'price_yearly'  => 'decimal:2',
        'is_featured'   => 'boolean',
        'is_active'     => 'boolean',
    ];

    public function tribes(): HasMany
    {
        return $this->hasMany(Tribe::class);
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order')->orderBy('price_monthly');
    }
}
