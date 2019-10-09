import * as React from 'react';
import CompoundBlock from '../CompoundBlock';
import { BlockDef, RenderDesignProps, RenderEditorProps, RenderInstanceProps, ContextVar, ChildBlock } from '../blocks';
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
    renderDesign(props: RenderDesignProps): JSX.Element;
    renderInstance(props: RenderInstanceProps): JSX.Element;
    renderEditor(props: RenderEditorProps): JSX.Element;
    getLabel(): string;
}
