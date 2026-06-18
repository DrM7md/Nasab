import { BaseEdge, getBezierPath, type EdgeProps } from '@xyflow/react';

/**
 * OrganicEdge — غصن عضوي منحنٍ (Bézier) بسماكة متدرّجة حسب الجيل
 * وتدرّج لحاء (#bark)، يُرسَم تدريجيًا عند الظهور (nsBranchDraw).
 */
const WIDTH_BY_GEN = [30, 18, 11, 7];

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
        curvature: 0.4,
    });

    const gen = (data?.generation as number | undefined) ?? 0;
    const width = WIDTH_BY_GEN[Math.min(gen, WIDTH_BY_GEN.length - 1)];

    return (
        <BaseEdge
            path={path}
            style={{
                stroke: 'url(#bark)',
                strokeWidth: width,
                strokeLinecap: 'round',
                strokeDasharray: 2200,
                animation: 'nsBranchDraw 1.2s ease-out both',
            }}
        />
    );
}
