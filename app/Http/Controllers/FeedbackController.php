<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFeedbackRequest;
use App\Models\Feedback;
use Illuminate\Http\RedirectResponse;

class FeedbackController extends Controller
{
    /**
     * استقبال اقتراح تطويري أو بلاغ خلل من المستخدم — يصل إلى المدير العام.
     */
    public function store(StoreFeedbackRequest $request): RedirectResponse
    {
        $data = $request->safe()->only(['type', 'message', 'page_url']);

        $data['user_id']  = $request->user()->id;
        $data['tribe_id'] = currentTribe()?->id;

        if ($request->hasFile('screenshot')) {
            $data['screenshot'] = $request->file('screenshot')->store('feedback', 'public');
        }

        Feedback::create($data);

        return back()->with('success', 'تم إرسال رسالتك إلى المدير العام، شكراً لك! 🌟');
    }
}
