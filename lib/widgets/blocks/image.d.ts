import * as React from 'react';
import LeafBlock from '../LeafBlock';
import { BlockDef, RenderDesignProps, RenderInstanceProps, RenderEditorProps, ValidateBlockOptions, ContextVar } from '../blocks';
import { ActionDef } from '../actions';
import { WidgetLibrary } from '../../designer/widgetLibrary';
import { ActionLibrary } from '../ActionLibrary';
import { Expr } from 'mwater-expressions';
export interface ImageBlockDef extends BlockDef {
    type: "image";
    /** URL of image */
    url?: string;
    /** Action to perform when image is clicked */
    clickActionDef: ActionDef | null;
    /** Size mode:
     * normal: displays image with maximum width of 100%
     * fullwidth: stretches to 100%
     * banner: stretches to 100% and includes reverse page margin to fill completely
     */
    sizeMode?: "normal" | "fullwidth" | "banner";
}
/** Simple static image block */
export declare class ImageBlock extends LeafBlock<ImageBlockDef> {
    validate(options: ValidateBlockOptions): string | null;
    getContextVarExprs(contextVar: ContextVar, widgetLibrary: WidgetLibrary, actionLibrary: ActionLibrary): Expr[];
    renderImage(handleClick?: () => void): JSX.Element;
    renderDesign(props: RenderDesignProps): JSX.Element;
    renderInstance(props: RenderInstanceProps): React.ReactElement<any>;
    renderEditor(props: RenderEditorProps): JSX.Element;
}
