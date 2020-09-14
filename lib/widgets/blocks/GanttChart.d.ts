import * as React from 'react';
import { BlockDef } from '../blocks';
import { DesignCtx, InstanceCtx } from '../../contexts';
import LeafBlock from '../LeafBlock';
/** Gantt chart */
export interface GanttChartBlockDef extends BlockDef {
    type: "ganttChart";
}
export declare class GanttChartBlock extends LeafBlock<GanttChartBlockDef> {
    validate(): null;
    renderDesign(props: DesignCtx): JSX.Element;
    renderInstance(instanceCtx: InstanceCtx): React.ReactElement<any>;
    renderEditor(props: DesignCtx): JSX.Element;
}
