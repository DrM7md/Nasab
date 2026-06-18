import Medallion from '@/Components/Tree/Medallion';
import type { PersonNodeData } from '@/types';
import { NodeProps } from '@xyflow/react';
import { memo } from 'react';

/** PersonNode — ميدالية الذكر في الشجرة الحيّة. */
function PersonNodeComponent({ data, selected }: NodeProps & { data: PersonNodeData }) {
    return <Medallion data={data} selected={!!selected} gender="male" />;
}

export default memo(PersonNodeComponent);
