<?php

namespace App\Models;

use App\Traits\BelongsToTribe;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Marriage extends Model
{
    use HasFactory, BelongsToTribe;

    protected $fillable = [
        'tribe_id',
        'husband_id', 'wife_id',
        'marriage_order', 'marriage_year', 'divorce_year',
        'is_current', 'status',
    ];

    protected $casts = [
        'marriage_year' => 'integer',
        'divorce_year'  => 'integer',
        'is_current'    => 'boolean',
    ];

    public function husband(): BelongsTo
    {
        return $this->belongsTo(Person::class, 'husband_id');
    }

    public function wife(): BelongsTo
    {
        return $this->belongsTo(Person::class, 'wife_id');
    }
}
