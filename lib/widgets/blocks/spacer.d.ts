import * as React from 'react';
import LeafBlock from '../LeafBlock';
import { BlockDef } from '../blocks';
import { DesignCtx, InstanceCtx } from '../../contexts';
export interface SpacerBlockDef extends BlockDef {
    type: "spacer";
    /** Width in ems (null/undefined is auto) */
    width?: number | null;
    /** Height in ems */
    height?: number | null;
}
/** Creates a fixed size spacer to separate blocks */
export declare class SpacerBlock extends LeafBlock<SpacerBlockDef> {
    validate(): null;
    renderDesign(props: DesignCtx): JSX.Element;
    renderInstance(props: InstanceCtx): React.ReactElement<any>;
    renderEditor(props: DesignCtx): JSX.Element;
}
