import dagre from '@dagrejs/dagre';
import type { Edge, Node } from '@xyflow/react';
import type { PersonNodeData } from '@/types';

/**
 * treeLayout
 *
 * يحسب مواضع nodes بـ dagre لشجرة هرمية متوازنة (جذر فوق، أبناء للأسفل):
 *  - rankdir: TB — من الأعلى للأسفل (شكل الشجرة الكلاسيكي)
 *  - بدون align — يترك dagre يوازِن (الأب يتمركز فوق أبنائه)
 *  - ranker: tight-tree — يعطي شجرة مدمجة أنيقة
 *  - ثم نعكس المحور X ليتناسب مع RTL (الأكبر سناً يميناً)
 */

const NODE_WIDTH = 200;
const NODE_HEIGHT = 130;

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
        // لا نضع align حتى يتمركز كل أب فوق أبنائه طبيعياً
        ranker: 'tight-tree',     // شجرة مدمجة ومتوازنة
        ranksep: 110,             // مسافة رأسية أكبر بين المستويات (أنفاس بصرية)
        nodesep: 60,              // مسافة أفقية بين الأخوة
        edgesep: 30,
        marginx: 80,
        marginy: 60,
    });

    nodes.forEach((node) => {
        g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    });

    edges.forEach((edge) => {
        g.setEdge(edge.source, edge.target);
    });

    dagre.layout(g);

    // نحسب أقصى X لعكس المحور (RTL: الأكبر يميناً)
    let maxX = 0;
    nodes.forEach((node) => {
        const dn = g.node(node.id);
        if (dn && dn.x > maxX) maxX = dn.x;
    });

    const laidOutNodes = nodes.map((node) => {
        const { x, y } = g.node(node.id);
        return {
            ...node,
            position: {
                // عكس المحور: maxX - x → يجعل أول طفل في DAG يظهر أقصى اليمين
                x: maxX - x - NODE_WIDTH / 2,
                y: y - NODE_HEIGHT / 2,
            },
        };
    });

    return { nodes: laidOutNodes, edges };
}
