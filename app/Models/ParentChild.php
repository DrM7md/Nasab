<?php

namespace App\Models;

use App\Traits\BelongsToTribe;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ParentChild extends Model
{
    use HasFactory, BelongsToTribe;

    protected $table = 'parent_child';

    protected $fillable = [
        'tribe_id',
        'father_id', 'mother_id', 'child_id',
        'status',
    ];

    public function father(): BelongsTo
    {
        return $this->belongsTo(Person::class, 'father_id');
    }

    public function mother(): BelongsTo
    {
        return $this->belongsTo(Person::class, 'mother_id');
    }

    public function child(): BelongsTo
    {
        return $this->belongsTo(Person::class, 'child_id');
    }
}
