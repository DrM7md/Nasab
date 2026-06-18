<?php

namespace App\Http\Controllers;

use App\Models\Person;
use App\Models\Tribe;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SearchController extends Controller
{
    /**
     * صفحة البحث الرئيسية (تبويبات: بحث فردي / صلة قرابة).
     */
    public function index(Tribe $tribe): Response
    {
        return Inertia::render('Search/Index', []);
    }

    /**
     * AJAX — autocomplete: يُرجع أول 8 نتائج.
     * يبحث في name_ar و short_name_ar.
     */
    public function suggest(Tribe $tribe, Request $request): JsonResponse
    {
        $query = trim((string) $request->query('q', ''));

        if (mb_strlen($query) < 2) {
            return response()->json(['results' => []]);
        }

        $results = Person::where('tribe_id', $tribe->id)
            ->where('status', 'approved')
            ->where(function ($q) use ($query) {
                $q->where('name_ar', 'like', "%{$query}%")
                  ->orWhere('short_name_ar', 'like', "%{$query}%");
            })
            ->orderByRaw("CASE WHEN short_name_ar LIKE ? THEN 0 ELSE 1 END", ["{$query}%"])
            ->orderBy('birth_year')
            ->limit(8)
            ->get([
                'id', 'name_ar', 'short_name_ar', 'gender',
                'title', 'birth_year', 'death_year', 'photo',
            ]);

        return response()->json(['results' => $results]);
    }
}
