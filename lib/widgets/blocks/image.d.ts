import * as React from 'react';
import LeafBlock from '../LeafBlock';
import { BlockDef, RenderDesignProps, RenderInstanceProps, RenderEditorProps, ValidateBlockOptions } from '../blocks';
export interface ImageBlockDef extends BlockDef {
    type: "image";
    url?: string;
}
export declare class ImageBlock extends LeafBlock<ImageBlockDef> {
    validate(options: ValidateBlockOptions): "URL required" | null;
    renderImage(): JSX.Element;
    renderDesign(props: RenderDesignProps): JSX.Element;
    renderInstance(props: RenderInstanceProps): React.ReactElement<any>;
    renderEditor(props: RenderEditorProps): JSX.Element;
}
