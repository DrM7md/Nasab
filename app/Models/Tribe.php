<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tribe extends Model
{
    use HasFactory;

    protected $fillable = [
        'name_ar', 'name_en', 'slug',
        'logo', 'cover_image', 'theme_color',
        'root_person_id',
        'description_ar', 'description_en',
        'is_active', 'subscription_plan', 'package_id',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /* ═══════════════════════════════════════════════
       العلاقات
       ═══════════════════════════════════════════════ */

    public function rootPerson(): BelongsTo
    {
        return $this->belongsTo(Person::class, 'root_person_id');
    }

    public function persons(): HasMany
    {
        return $this->hasMany(Person::class);
    }

    public function marriages(): HasMany
    {
        return $this->hasMany(Marriage::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function pendingEdits(): HasMany
    {
        return $this->hasMany(PendingEdit::class);
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }

    /* ═══════════════════════════════════════════════
       مساعدات
       ═══════════════════════════════════════════════ */

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /* ═══════════════════════════════════════════════
       حدود الباقة وقدراتها
       ═══════════════════════════════════════════════ */

    public function personLimit(): ?int
    {
        return $this->package?->max_persons;
    }

    public function memberLimit(): ?int
    {
        return $this->package?->max_members;
    }

    public function personCount(): int
    {
        return $this->persons()->where('status', 'approved')->count();
    }

    public function memberCount(): int
    {
        return $this->users()->count();
    }

    public function canAddPerson(): bool
    {
        $limit = $this->personLimit();
        return $limit === null || $this->personCount() < $limit;
    }

    public function canAddMember(): bool
    {
        $limit = $this->memberLimit();
        return $limit === null || $this->memberCount() < $limit;
    }

    public function hasCapability(string $key): bool
    {
        return (bool) $this->package?->hasCapability($key);
    }
}
