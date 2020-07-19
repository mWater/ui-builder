import * as React from 'react';
import { Block, BlockDef, ContextVar, ChildBlock } from '../blocks';
import { DesignCtx, InstanceCtx } from '../../contexts';
export interface HorizontalBlockDef extends BlockDef {
    type: "horizontal";
    items: BlockDef[];
    /** How to align child blocks. Default is "justify" */
    align?: "justify" | "right" | "left" | "center";
    /** How to vertically align child blocks. Default is top */
    verticalAlign?: "top" | "middle" | "bottom";
}
export declare class HorizontalBlock extends Block<HorizontalBlockDef> {
    get id(): string;
    getChildren(contextVars: ContextVar[]): ChildBlock[];
    validate(): null;
    canonicalize(): BlockDef | null;
    processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef;
    renderBlock(children: React.ReactNode[]): JSX.Element;
    renderDesign(props: DesignCtx): JSX.Element;
    renderInstance(props: InstanceCtx): JSX.Element;
    renderEditor(props: DesignCtx): JSX.Element;
    getLabel(): string;
}
