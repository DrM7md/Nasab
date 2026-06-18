import { getBezierPath, type EdgeProps } from '@xyflow/react';

/**
 * OrganicEdge — غصن عضوي منحنٍ (Bézier) بسماكة متدرّجة حسب الجيل
 * وتدرّج لحاء (#bark). يُرسَم تدريجيًا عبر pathLength مطبَّع (1) — فلا فراغ
 * في الأغصان الطويلة مهما طالت (يُصلح «انقطاع» الغصن عند توسيع الشجرة).
 */
const WIDTH_BY_GEN = [15, 10, 7, 5];

export default function OrganicEdge({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
}: EdgeProps) {
    const [path] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        curvature: 0.35,
    });

    const gen = (data?.generation as number | undefined) ?? 0;
    const width = WIDTH_BY_GEN[Math.min(gen, WIDTH_BY_GEN.length - 1)];

    return (
        <path
            className="react-flow__edge-path"
            d={path}
            fill="none"
            pathLength={1}
            style={{
                stroke: 'url(#bark)',
                strokeWidth: width,
                strokeLinecap: 'round',
                strokeDasharray: 1,
                animation: 'nsBranchDraw 1.1s ease-out both',
            }}
        />
    );
}
