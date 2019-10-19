import * as React from 'react';
import CompoundBlock from '../CompoundBlock';
import { BlockDef, ContextVar, ChildBlock } from '../blocks';
import { DesignCtx, InstanceCtx } from '../../contexts';
export interface HorizontalBlockDef extends BlockDef {
    type: "horizontal";
    items: BlockDef[];
    /** How to align child blocks */
    align: "justify" | "right" | "left" | "center";
}
export declare class HorizontalBlock extends CompoundBlock<HorizontalBlockDef> {
    readonly id: string;
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
