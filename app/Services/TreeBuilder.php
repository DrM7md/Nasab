<?php

namespace App\Services;

use App\Models\Person;
use App\Models\Tribe;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * TreeBuilder
 *
 * يبني بيانات الشجرة المناسبة لـ React Flow:
 *  - ابتدائياً: الشخص الجذر + أبناؤه المباشرون (مستوى واحد)
 *  - عند expand: أبناء شخص معين (تُضاف إلى الشجرة في الواجهة)
 *
 * نحسب `children_count` لكل شخص عبر استعلام مجمّع واحد لتفادي N+1.
 */
class TreeBuilder
{
    public function __construct(protected Tribe $tribe) {}

    /** مدة الـ cache (ساعة). */
    protected const CACHE_TTL = 3600;

    /**
     * يُبطل كل كاش الشجرة لقبيلة معينة.
     * نستخدم نمط "cache versioning": نُرقّم كل المفاتيح بإصدار،
     * ولإبطال الكل نرفع الإصدار — المفاتيح القديمة تُهمل وتنتهي بانتهاء TTL.
     *
     * يعمل مع أي cache driver (database, file, redis...) بدون الحاجة لـ tags.
     */
    public static function invalidate(int $tribeId): void
    {
        Cache::forever("tree:v:{$tribeId}", now()->timestamp);
    }

    protected function version(): int
    {
        return (int) Cache::rememberForever(
            "tree:v:{$this->tribe->id}",
            fn () => now()->timestamp,
        );
    }

    /**
     * يبني الحمولة الابتدائية: الجذر + أبناؤه المباشرون.
     *
     * @return array{nodes: array, edges: array, root_person_id: int|null}
     */
    public function initial(?int $rootId = null): array
    {
        $rootId ??= $this->tribe->root_person_id;

        if (! $rootId) {
            return ['nodes' => [], 'edges' => [], 'root_person_id' => null];
        }

        return $this->cacheRemember(
            "tree:initial:{$this->tribe->id}:{$rootId}:v{$this->version()}",
            fn () => $this->buildInitial($rootId),
        );
    }

    protected function buildInitial(int $rootId): array
    {
        $root = Person::where('tribe_id', $this->tribe->id)
            ->where('id', $rootId)
            ->first();

        if (! $root) {
            return ['nodes' => [], 'edges' => [], 'root_person_id' => null];
        }

        $childrenIds = $this->directChildrenIds($root);
        $children = Person::whereIn('id', $childrenIds)
            ->where('tribe_id', $this->tribe->id)
            ->orderBy('birth_year')
            ->orderBy('id')
            ->get();

        $allPersons = collect([$root])->concat($children);
        $counts = $this->childrenCounts($allPersons->pluck('id')->all());

        $nodes = $allPersons->map(fn ($p) => $this->toNode($p, $counts[$p->id] ?? 0))->all();

        $edges = $children->map(fn ($child) => $this->toEdge($root, $child))->all();

        return [
            'nodes'          => $nodes,
            'edges'          => $edges,
            'root_person_id' => $rootId,
        ];
    }

    /**
     * يُرجع كامل الشجرة: كل الأشخاص + كل علاقات parent_child للقبيلة.
     * يُستخدم لـ "فتح الشجرة كاملة".
     *
     * @return array{nodes: array, edges: array, root_person_id: int|null}
     */
    public function full(): array
    {
        return $this->cacheRemember(
            "tree:full:{$this->tribe->id}:v{$this->version()}",
            fn () => $this->buildFull(),
        );
    }

    protected function buildFull(): array
    {
        $persons = Person::where('tribe_id', $this->tribe->id)
            ->where('status', 'approved')
            ->orderBy('birth_year')
            ->orderBy('id')
            ->get();

        if ($persons->isEmpty()) {
            return ['nodes' => [], 'edges' => [], 'root_person_id' => $this->tribe->root_person_id];
        }

        $counts = $this->childrenCounts($persons->pluck('id')->all());

        $nodes = $persons->map(function ($p) use ($counts) {
            $node = $this->toNode($p, $counts[$p->id] ?? 0);
            $node['data']['is_expanded'] = ($counts[$p->id] ?? 0) > 0;
            return $node;
        })->all();

        // كل علاقات parent_child تتحوّل لـ edges
        $relations = DB::table('parent_child')
            ->where('tribe_id', $this->tribe->id)
            ->where('status', 'approved')
            ->get(['father_id', 'mother_id', 'child_id']);

        $personIds = $persons->pluck('id')->flip();
        $edges = [];

        foreach ($relations as $rel) {
            // نُفضّل father كحافة رئيسية. لو لا أب: mother.
            $parentId = $rel->father_id ?? $rel->mother_id;
            if ($parentId && isset($personIds[$parentId]) && isset($personIds[$rel->child_id])) {
                $edges[] = [
                    'id'     => "e-{$parentId}-{$rel->child_id}",
                    'source' => (string) $parentId,
                    'target' => (string) $rel->child_id,
                    'type'   => 'smoothstep',
                ];
            }
        }

        return [
            'nodes'          => $nodes,
            'edges'          => $edges,
            'root_person_id' => $this->tribe->root_person_id,
        ];
    }

    /**
     * يُرجع أبناء شخص معين كـ nodes + edges جديدة.
     *
     * @return array{nodes: array, edges: array}
     */
    public function expand(Person $person): array
    {
        return $this->cacheRemember(
            "tree:expand:{$this->tribe->id}:{$person->id}:v{$this->version()}",
            fn () => $this->buildExpand($person),
        );
    }

    protected function buildExpand(Person $person): array
    {
        $childrenIds = $this->directChildrenIds($person);
        $children = Person::whereIn('id', $childrenIds)
            ->where('tribe_id', $this->tribe->id)
            ->orderBy('birth_year')
            ->orderBy('id')
            ->get();

        $counts = $this->childrenCounts($children->pluck('id')->all());

        return [
            'nodes' => $children->map(fn ($c) => $this->toNode($c, $counts[$c->id] ?? 0))->all(),
            'edges' => $children->map(fn ($c) => $this->toEdge($person, $c))->all(),
        ];
    }

    protected function cacheRemember(string $key, callable $callback): array
    {
        return Cache::remember($key, self::CACHE_TTL, $callback);
    }

    /**
     * IDs أبناء شخص معين بناءً على جنسه.
     * الذكر → father_id، الأنثى → mother_id.
     *
     * @return array<int>
     */
    protected function directChildrenIds(Person $person): array
    {
        $column = $person->gender === 'female' ? 'mother_id' : 'father_id';

        return DB::table('parent_child')
            ->where('tribe_id', $this->tribe->id)
            ->where($column, $person->id)
            ->where('status', 'approved')
            ->pluck('child_id')
            ->all();
    }

    /**
     * عدد أبناء كل شخص في مجموعة IDs (واحد query).
     *
     * @param  array<int>  $personIds
     * @return array<int,int>  [person_id => count]
     */
    protected function childrenCounts(array $personIds): array
    {
        if (empty($personIds)) {
            return [];
        }

        // نعدّ الأبناء حيث father_id أو mother_id في المجموعة
        $fatherCounts = DB::table('parent_child')
            ->where('tribe_id', $this->tribe->id)
            ->where('status', 'approved')
            ->whereIn('father_id', $personIds)
            ->selectRaw('father_id as person_id, COUNT(*) as c')
            ->groupBy('father_id')
            ->pluck('c', 'person_id');

        $motherCounts = DB::table('parent_child')
            ->where('tribe_id', $this->tribe->id)
            ->where('status', 'approved')
            ->whereIn('mother_id', $personIds)
            ->selectRaw('mother_id as person_id, COUNT(*) as c')
            ->groupBy('mother_id')
            ->pluck('c', 'person_id');

        return collect($personIds)
            ->mapWithKeys(fn ($id) => [
                $id => ($fatherCounts[$id] ?? 0) + ($motherCounts[$id] ?? 0),
            ])
            ->all();
    }

    /**
     * تحويل Person لـ React Flow node.
     */
    protected function toNode(Person $person, int $childrenCount): array
    {
        return [
            'id'       => (string) $person->id,
            'type'     => $person->gender === 'female' ? 'femaleNode' : 'personNode',
            'position' => ['x' => 0, 'y' => 0], // المخطط الحقيقي يُحسب في الواجهة بـ dagre
            'data'     => [
                'id'             => $person->id,
                'name_ar'        => $person->name_ar,
                'short_name_ar'  => $person->short_name_ar,
                'gender'         => $person->gender,
                'title'          => $person->title,
                'photo'          => $person->photo ? asset('storage/' . $person->photo) : null,
                'birth_year'     => $person->birth_year,
                'death_year'     => $person->death_year,
                'life_status'    => $person->life_status,
                'children_count' => $childrenCount,
                'is_expanded'    => false,
            ],
        ];
    }

    /**
     * تحويل علاقة والد → ابن لـ React Flow edge.
     */
    protected function toEdge(Person $parent, Person $child): array
    {
        return [
            'id'     => "e-{$parent->id}-{$child->id}",
            'source' => (string) $parent->id,
            'target' => (string) $child->id,
            'type'   => 'smoothstep',
        ];
    }
}
