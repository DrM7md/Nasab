<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Feedback — اقتراح تطويري أو بلاغ خلل يُرسله المستخدم إلى المدير العام.
 *
 * ليست مرتبطة بقبيلة (global) — يديرها super_admin فقط. حقل tribe_id للسياق.
 */
class Feedback extends Model
{
    use HasFactory;

    protected $table = 'feedback';

    protected $fillable = [
        'tribe_id', 'user_id',
        'type', 'message', 'screenshot', 'page_url',
        'status', 'admin_note', 'resolved_at',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function tribe(): BelongsTo
    {
        return $this->belongsTo(Tribe::class);
    }

    public function scopeNew(Builder $query): Builder
    {
        return $query->where('status', 'new');
    }
}
