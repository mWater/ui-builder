import * as React from 'react';
import LeafBlock from '../LeafBlock';
import { BlockDef, RenderDesignProps, RenderInstanceProps } from '../blocks';
export interface SpacerBlockDef extends BlockDef {
    type: "spacer";
}
export declare class SpacerBlock extends LeafBlock<SpacerBlockDef> {
    validate(): null;
    renderDesign(props: RenderDesignProps): JSX.Element;
    renderInstance(props: RenderInstanceProps): React.ReactElement<any>;
}
