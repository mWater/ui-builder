import * as React from 'react';
import LeafBlock from '../LeafBlock';
import { BlockDef, ContextVar } from '../blocks';
import { ActionDef } from '../actions';
import { Expr } from 'mwater-expressions';
import { DesignCtx, InstanceCtx } from '../../contexts';
export interface ImageBlockDef extends BlockDef {
    type: "image";
    /** URL of image */
    url?: string;
    /** Localized version of the urls that override above for images that vary with locale */
    localizedUrls?: {
        [locale: string]: string;
    };
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
    validate(designCtx: DesignCtx): string | null;
    getContextVarExprs(contextVar: ContextVar, ctx: DesignCtx | InstanceCtx): Expr[];
    renderImage(locale: string, handleClick?: () => void): JSX.Element;
    renderDesign(props: DesignCtx): JSX.Element;
    renderInstance(instanceCtx: InstanceCtx): React.ReactElement<any>;
    renderEditor(props: DesignCtx): JSX.Element;
}
