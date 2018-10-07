/// <reference types="react" />
import CompoundBlock from '../CompoundBlock';
import { BlockDef, RenderDesignProps, RenderInstanceProps, ContextVar, ChildBlock } from '../blocks';
export interface VerticalBlockDef extends BlockDef {
    type: "vertical";
    items: BlockDef[];
}
export declare class VerticalBlock extends CompoundBlock<VerticalBlockDef> {
    readonly id: string;
    getChildren(contextVars: ContextVar[]): ChildBlock[];
    validate(): null;
    processChildren(action: (self: BlockDef) => BlockDef | null): BlockDef;
    canonicalize(): BlockDef | null;
    renderChildDesign(props: RenderDesignProps, childBlockDef: BlockDef): JSX.Element;
    renderDesign(props: RenderDesignProps): JSX.Element;
    renderInstance(props: RenderInstanceProps): JSX.Element;
}
