<?php

namespace App\Http\Controllers;

use App\Models\Person;
use App\Models\Tribe;
use App\Services\TreeBuilder;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class TreeController extends Controller
{
    /**
     * عرض صفحة الشجرة التفاعلية.
     * الحمولة الأولية: الجذر + أبناؤه المباشرون.
     */
    public function index(Tribe $tribe): Response
    {
        $builder = new TreeBuilder($tribe);

        return Inertia::render('Tree/Index', [
            'initialTree' => $builder->initial(),
        ]);
    }

    /**
     * AJAX — يُرجع أبناء شخص معين لتوسيعه في الشجرة.
     */
    public function expand(Tribe $tribe, Person $person): JsonResponse
    {
        abort_unless($person->tribe_id === $tribe->id, 404);

        $builder = new TreeBuilder($tribe);

        return response()->json($builder->expand($person));
    }

    /**
     * AJAX — يُرجع الشجرة كاملة (كل الأشخاص + كل العلاقات).
     */
    public function full(Tribe $tribe): JsonResponse
    {
        $builder = new TreeBuilder($tribe);

        return response()->json($builder->full());
    }
}
