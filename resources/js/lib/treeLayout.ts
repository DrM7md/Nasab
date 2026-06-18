import dagre from '@dagrejs/dagre';
import type { Edge, Node } from '@xyflow/react';
import type { PersonNodeData } from '@/types';

/**
 * treeLayout — شجرة حيّة تنمو لأعلى (الجذع/الجدّ الأكبر في الأسفل).
 *
 *  - dagre TB ثم نقلب المحور Y (الجذر = أكبر y = الأسفل، الأحدث = أعلى).
 *  - نعكس المحور X ليتناسب مع RTL.
 *  - نحسب «الجيل» لكل عُقدة (0 = الجذر) ونمرّره للعُقَد والحواف
 *    (تستخدمه الميدالية للحجم، والحافة العضوية لسماكة الغصن).
 */

const NODE_WIDTH = 200;
const NODE_HEIGHT = 160;

export function layoutTree<T extends PersonNodeData>(
    nodes: Node<T>[],
    edges: Edge[],
): { nodes: Node<T>[]; edges: Edge[] } {
    if (nodes.length === 0) {
        return { nodes: [], edges };
    }

    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({
        rankdir: 'TB',
        ranker: 'tight-tree',
        ranksep: 150,             // مسافة رأسية أكبر — أنفاس بين الأجيال
        nodesep: 70,
        edgesep: 30,
        marginx: 90,
        marginy: 80,
    });

    nodes.forEach((node) => {
        g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    });
    edges.forEach((edge) => {
        g.setEdge(edge.source, edge.target);
    });

    dagre.layout(g);

    // حدود المحاور + قائمة صفوف y لحساب الجيل
    let maxX = 0;
    let maxY = 0;
    nodes.forEach((node) => {
        const dn = g.node(node.id);
        if (!dn) return;
        if (dn.x > maxX) maxX = dn.x;
        if (dn.y > maxY) maxY = dn.y;
    });

    const rows = [...new Set(nodes.map((n) => Math.round(g.node(n.id).y)))].sort((a, b) => a - b);
    const genOf = (y: number) => rows.indexOf(Math.round(y)); // 0 = الجذر (أعلى dagre / أسفل الشاشة)

    const genById: Record<string, number> = {};

    const laidOutNodes = nodes.map((node) => {
        const { x, y } = g.node(node.id);
        const generation = genOf(y);
        genById[node.id] = generation;
        return {
            ...node,
            position: {
                x: maxX - x - NODE_WIDTH / 2,   // RTL
                y: maxY - y - NODE_HEIGHT / 2,  // قلب Y: الجذر للأسفل
            },
            data: { ...node.data, generation },
        };
    });

    const laidOutEdges = edges.map((edge) => ({
        ...edge,
        type: 'organic',
        data: { ...(edge.data ?? {}), generation: genById[edge.source] ?? 0 },
    }));

    return { nodes: laidOutNodes, edges: laidOutEdges };
}
