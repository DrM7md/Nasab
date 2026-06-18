<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable([
    'tribe_id', 'requested_tribe_id',
    'name', 'email', 'password',
    'phone', 'national_id', 'nationality', 'id_card_photo',
    'role', 'linked_person_id', 'is_active',
    'join_intent', 'requested_package_id', 'claim_reason', 'last_active_at',
])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    public const ROLE_SUPER_ADMIN  = 'super_admin';
    public const ROLE_TRIBE_ADMIN  = 'tribe_admin';
    public const ROLE_MODERATOR    = 'moderator';
    public const ROLE_MEMBER       = 'member';
    public const ROLE_VIEWER       = 'viewer';

    public const INTENT_MEMBER      = 'member';
    public const INTENT_FOUND_TRIBE = 'found_tribe';
    public const INTENT_CLAIM_ADMIN = 'claim_admin';

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'is_active'         => 'boolean',
            'last_active_at'    => 'datetime',
        ];
    }

    /* ═══════════════════════════════════════════════
       العلاقات
       ═══════════════════════════════════════════════ */

    public function tribe(): BelongsTo
    {
        return $this->belongsTo(Tribe::class);
    }

    public function requestedTribe(): BelongsTo
    {
        return $this->belongsTo(Tribe::class, 'requested_tribe_id');
    }

    public function requestedPackage(): BelongsTo
    {
        return $this->belongsTo(Package::class, 'requested_package_id');
    }

    public function linkedPerson(): BelongsTo
    {
        return $this->belongsTo(Person::class, 'linked_person_id');
    }

    /**
     * هل هذا المستخدم ينتظر اعتماد الانضمام لقبيلة؟
     */
    public function isPendingJoin(): bool
    {
        return $this->tribe_id === null && $this->requested_tribe_id !== null;
    }

    /* ═══════════════════════════════════════════════
       فحص الأدوار والصلاحيات
       ═══════════════════════════════════════════════ */

    public function hasRole(string|array $roles): bool
    {
        return in_array($this->role, (array) $roles, true);
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === self::ROLE_SUPER_ADMIN;
    }

    public function isTribeAdmin(): bool
    {
        return $this->role === self::ROLE_TRIBE_ADMIN;
    }

    public function canModerate(): bool
    {
        return $this->hasRole([
            self::ROLE_SUPER_ADMIN,
            self::ROLE_TRIBE_ADMIN,
            self::ROLE_MODERATOR,
        ]);
    }

    public function canEdit(): bool
    {
        return $this->hasRole([
            self::ROLE_SUPER_ADMIN,
            self::ROLE_TRIBE_ADMIN,
            self::ROLE_MODERATOR,
            self::ROLE_MEMBER,
        ]);
    }
}
