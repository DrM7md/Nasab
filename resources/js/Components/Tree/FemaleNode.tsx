import Medallion from '@/Components/Tree/Medallion';
import type { PersonNodeData } from '@/types';
import { NodeProps } from '@xyflow/react';
import { memo } from 'react';

/** FemaleNode — ميدالية الأنثى في الشجرة الحيّة. */
function FemaleNodeComponent({ data, selected }: NodeProps & { data: PersonNodeData }) {
    return <Medallion data={data} selected={!!selected} gender="female" />;
}

export default memo(FemaleNodeComponent);
