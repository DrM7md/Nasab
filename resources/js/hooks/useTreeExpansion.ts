import type { PersonNodeData } from '@/types';
import { type Edge, type Node } from '@xyflow/react';
import { useCallback, useState } from 'react';
import { layoutTree } from '@/lib/treeLayout';

type PersonNode = Node<PersonNodeData>;

interface ExpandResponse {
    nodes: PersonNode[];
    edges: Edge[];
}

/**
 * useTreeExpansion
 *
 * يدير حالة الشجرة (nodes + edges) وتوسيع/طي الأبناء.
 *  - expand(personId, url): يجلب الأبناء من الـ backend ويدمجهم
 *  - collapse(personId): يحذف الأبناء (وذريتهم) من الشجرة
 *  - كل عملية تُعيد حساب الـ layout عبر dagre
 */
export function useTreeExpansion(
    initialNodes: PersonNode[],
    initialEdges: Edge[],
) {
    const [state, setState] = useState(() => layoutTree(initialNodes, initialEdges));
    const [loading, setLoading] = useState<Set<number>>(new Set());

    const expand = useCallback(
        async (personId: number, fetchUrl: string) => {
            // تجنب الطلب المكرر
            if (loading.has(personId)) return;

            // لو موسَّع أصلاً، اطوِه
            const currentNode = state.nodes.find((n) => n.data.id === personId);
            if (currentNode?.data.is_expanded) {
                collapse(personId);
                return;
            }

            setLoading((prev) => new Set(prev).add(personId));

            try {
                const res = await fetch(fetchUrl, {
                    headers: { Accept: 'application/json' },
                    credentials: 'same-origin',
                });

                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                const { nodes: newNodes, edges: newEdges } = (await res.json()) as ExpandResponse;

                setState((prev) => {
                    // تجنب تكرار nodes
                    const existingIds = new Set(prev.nodes.map((n) => n.id));
                    const mergedNodes = [
                        ...prev.nodes.map((n) =>
                            n.data.id === personId
                                ? { ...n, data: { ...n.data, is_expanded: true } }
                                : n,
                        ),
                        ...newNodes.filter((n) => !existingIds.has(n.id)),
                    ];

                    const existingEdgeIds = new Set(prev.edges.map((e) => e.id));
                    const mergedEdges = [
                        ...prev.edges,
                        ...newEdges.filter((e) => !existingEdgeIds.has(e.id)),
                    ];

                    return layoutTree(mergedNodes, mergedEdges);
                });
            } catch (err) {
                console.error('Tree expansion failed:', err);
            } finally {
                setLoading((prev) => {
                    const next = new Set(prev);
                    next.delete(personId);
                    return next;
                });
            }
        },
        [loading, state.nodes],
    );

    const collapse = useCallback((personId: number) => {
        setState((prev) => {
            // اجمع كل ذرية هذا الشخص (BFS على الـ edges الحالية)
            const descendantIds = new Set<string>();
            const queue = [String(personId)];

            while (queue.length) {
                const current = queue.shift()!;
                const children = prev.edges.filter((e) => e.source === current);
                for (const c of children) {
                    if (!descendantIds.has(c.target)) {
                        descendantIds.add(c.target);
                        queue.push(c.target);
                    }
                }
            }

            // احذف nodes الذرية و edges المرتبطة
            const remainingNodes = prev.nodes
                .filter((n) => !descendantIds.has(n.id))
                .map((n) =>
                    n.data.id === personId
                        ? { ...n, data: { ...n.data, is_expanded: false } }
                        : n,
                );

            const remainingEdges = prev.edges.filter(
                (e) => !descendantIds.has(e.target) && !descendantIds.has(e.source),
            );

            return layoutTree(remainingNodes, remainingEdges);
        });
    }, []);

    const setNodes = useCallback((updater: (prev: PersonNode[]) => PersonNode[]) => {
        setState((prev) => ({ ...prev, nodes: updater(prev.nodes) }));
    }, []);

    const setEdges = useCallback((updater: (prev: Edge[]) => Edge[]) => {
        setState((prev) => ({ ...prev, edges: updater(prev.edges) }));
    }, []);

    /**
     * يستبدل كامل الشجرة بـ nodes/edges جديدة (مع إعادة الـ layout).
     * يُستخدم في "فتح الشجرة كاملة" أو "طي الشجرة لحالتها الأصلية".
     */
    const replaceTree = useCallback(
        (newNodes: PersonNode[], newEdges: Edge[]) => {
            setState(layoutTree(newNodes, newEdges));
        },
        [],
    );

    return {
        nodes: state.nodes,
        edges: state.edges,
        expand,
        collapse,
        loading,
        setNodes,
        setEdges,
        replaceTree,
    };
}
