<?php

namespace App\Models;

use App\Traits\BelongsToTribe;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;

class Person extends Model
{
    use HasFactory, BelongsToTribe;

    protected $table = 'persons';

    public const LIFE_LIVING   = 'living';
    public const LIFE_DECEASED = 'deceased';
    public const LIFE_UNKNOWN  = 'unknown';

    protected $fillable = [
        'tribe_id',
        'name_ar', 'name_en', 'short_name_ar',
        'gender', 'title',
        'birth_year', 'death_year', 'life_status',
        'birth_place', 'death_place',
        'photo', 'bio_ar', 'bio_en',
        'status', 'added_by', 'approved_by',
    ];

    protected $casts = [
        'birth_year' => 'integer',
        'death_year' => 'integer',
    ];

    protected static function booted(): void
    {
        // إذا أُدخلت سنة وفاة فالشخص بالضرورة متوفى — death_year هو المرجع
        static::saving(function (Person $person) {
            if ($person->death_year !== null) {
                $person->life_status = self::LIFE_DECEASED;
            }
        });
    }

    /* ═══════════════════════════════════════════════
       علاقة النسب (parent_child)
       ═══════════════════════════════════════════════ */

    /** السجل في parent_child الذي فيه هذا الشخص child */
    public function parentRelation(): HasOne
    {
        return $this->hasOne(ParentChild::class, 'child_id');
    }

    /** الأب */
    public function father(): HasOneThrough
    {
        return $this->hasOneThrough(
            Person::class,
            ParentChild::class,
            'child_id',
            'id',
            'id',
            'father_id'
        );
    }

    /** الأم */
    public function mother(): HasOneThrough
    {
        return $this->hasOneThrough(
            Person::class,
            ParentChild::class,
            'child_id',
            'id',
            'id',
            'mother_id'
        );
    }

    /** الأبناء من خلال parent_child (أباً أو أماً) */
    public function childrenAsFather(): HasMany
    {
        return $this->hasMany(ParentChild::class, 'father_id');
    }

    public function childrenAsMother(): HasMany
    {
        return $this->hasMany(ParentChild::class, 'mother_id');
    }

    /** جميع الأبناء (حسب الجنس: كأب للذكر، كأم للأنثى) */
    public function children(): HasMany
    {
        $column = $this->gender === 'female' ? 'mother_id' : 'father_id';
        return $this->hasMany(ParentChild::class, $column);
    }

    /* ═══════════════════════════════════════════════
       الزيجات
       ═══════════════════════════════════════════════ */

    public function marriagesAsHusband(): HasMany
    {
        return $this->hasMany(Marriage::class, 'husband_id');
    }

    public function marriagesAsWife(): HasMany
    {
        return $this->hasMany(Marriage::class, 'wife_id');
    }

    /** كل الزيجات (حسب الجنس) */
    public function marriages(): HasMany
    {
        return $this->gender === 'female'
            ? $this->marriagesAsWife()
            : $this->marriagesAsHusband();
    }

    /* ═══════════════════════════════════════════════
       علاقات المستخدمين (من أضاف/من اعتمد)
       ═══════════════════════════════════════════════ */

    public function addedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'added_by');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /* ═══════════════════════════════════════════════
       Scopes
       ═══════════════════════════════════════════════ */

    public function scopeApproved(Builder $query): Builder
    {
        return $query->where('status', 'approved');
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', 'pending');
    }

    public function scopeMale(Builder $query): Builder
    {
        return $query->where('gender', 'male');
    }

    public function scopeFemale(Builder $query): Builder
    {
        return $query->where('gender', 'female');
    }

    /* ═══════════════════════════════════════════════
       الإخوة
       ═══════════════════════════════════════════════ */

    /**
     * الإخوة من نفس الأب (قد يختلفون في الأم) — مستبعَداً نفس الشخص.
     * يُرجع Collection<int, Person>.
     */
    public function siblings()
    {
        $fatherRelation = $this->parentRelation;
        if (! $fatherRelation || ! $fatherRelation->father_id) {
            return collect();
        }

        return self::whereHas('parentRelation', function ($q) use ($fatherRelation) {
            $q->where('father_id', $fatherRelation->father_id);
        })
            ->where('id', '!=', $this->id)
            ->orderBy('birth_year')
            ->get();
    }

    /**
     * الإخوة الأشقاء (نفس الأب والأم) — مستبعَداً نفس الشخص.
     */
    public function fullSiblings()
    {
        $fatherRelation = $this->parentRelation;
        if (! $fatherRelation || ! $fatherRelation->father_id || ! $fatherRelation->mother_id) {
            return collect();
        }

        return self::whereHas('parentRelation', function ($q) use ($fatherRelation) {
            $q->where('father_id', $fatherRelation->father_id)
              ->where('mother_id', $fatherRelation->mother_id);
        })
            ->where('id', '!=', $this->id)
            ->orderBy('birth_year')
            ->get();
    }

    /* ═══════════════════════════════════════════════
       مساعدات
       ═══════════════════════════════════════════════ */

    public function isMale(): bool
    {
        return $this->gender === 'male';
    }

    public function isFemale(): bool
    {
        return $this->gender === 'female';
    }

    public function isAlive(): bool
    {
        return $this->life_status === self::LIFE_LIVING;
    }

    public function isDeceased(): bool
    {
        return $this->life_status === self::LIFE_DECEASED;
    }

    /** رابط النسب: "بن" أو "بنت" بناءً على جنس هذا الشخص */
    public function connector(): string
    {
        return $this->isFemale() ? 'بنت' : 'بن';
    }
}
