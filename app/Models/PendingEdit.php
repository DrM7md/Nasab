<?php

namespace App\Models;

use App\Traits\BelongsToTribe;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PendingEdit extends Model
{
    use HasFactory, BelongsToTribe;

    protected $fillable = [
        'tribe_id',
        'edit_type', 'target_id', 'proposed_data',
        'requested_by', 'status',
        'reviewer_id', 'reviewer_note', 'reviewed_at',
    ];

    protected $casts = [
        'proposed_data' => 'array',
        'reviewed_at'   => 'datetime',
    ];

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', 'pending');
    }
}
