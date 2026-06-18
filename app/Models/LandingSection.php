<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LandingSection extends Model
{
    use HasFactory;

    public const TYPES = ['hero', 'about', 'quote', 'features', 'text', 'cta'];

    protected $fillable = [
        'type', 'title', 'subtitle', 'body', 'icon',
        'extra', 'sort_order', 'is_visible',
    ];

    protected $casts = [
        'extra'      => 'array',
        'is_visible' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function scopeVisible(Builder $q): Builder
    {
        return $q->where('is_visible', true);
    }

    public function scopeOrdered(Builder $q): Builder
    {
        return $q->orderBy('sort_order')->orderBy('id');
    }
}
