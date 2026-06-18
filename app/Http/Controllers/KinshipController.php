<?php

namespace App\Http\Controllers;

use App\Models\Person;
use App\Models\Tribe;
use App\Services\KinshipFinder;
use App\Services\LineageChain;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KinshipController extends Controller
{
    public function __construct(
        protected KinshipFinder $finder,
        protected LineageChain $lineage,
    ) {}

    /**
     * يُرجع صلة القرابة بين شخصين في JSON.
     * Query params: a (person_id)، b (person_id)
     */
    public function find(Tribe $tribe, Request $request): JsonResponse
    {
        $request->validate([
            'a' => 'required|integer|exists:persons,id',
            'b' => 'required|integer|exists:persons,id',
        ]);

        $a = Person::where('tribe_id', $tribe->id)->findOrFail($request->integer('a'));
        $b = Person::where('tribe_id', $tribe->id)->findOrFail($request->integer('b'));

        $result = $this->finder->find($a, $b);

        return response()->json([
            'person_a' => [
                'id'            => $a->id,
                'short_name_ar' => $a->short_name_ar,
                'gender'        => $a->gender,
                'title'         => $a->title,
                'photo'         => $a->photo,
                'lineage'       => $this->lineage->formatChain($this->lineage->getAncestorChain($a)),
            ],
            'person_b' => [
                'id'            => $b->id,
                'short_name_ar' => $b->short_name_ar,
                'gender'        => $b->gender,
                'title'         => $b->title,
                'photo'         => $b->photo,
                'lineage'       => $this->lineage->formatChain($this->lineage->getAncestorChain($b)),
            ],
            'relation_label'  => $result['relation_label'],
            'depth_a'         => $result['depth_a'],
            'depth_b'         => $result['depth_b'],
            'common_ancestor' => $result['common_ancestor'] ? [
                'id'            => $result['common_ancestor']->id,
                'short_name_ar' => $result['common_ancestor']->short_name_ar,
                'title'         => $result['common_ancestor']->title,
            ] : null,
        ]);
    }
}
