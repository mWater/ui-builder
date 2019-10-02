import * as React from 'react';
import LeafBlock from '../LeafBlock';
import { BlockDef, RenderDesignProps, RenderInstanceProps, RenderEditorProps } from '../blocks';
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
    renderDesign(props: RenderDesignProps): JSX.Element;
    renderInstance(props: RenderInstanceProps): React.ReactElement<any>;
    renderEditor(props: RenderEditorProps): JSX.Element;
}
