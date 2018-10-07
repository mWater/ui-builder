/// <reference types="react" />
import CompoundBlock from '../CompoundBlock';
import { BlockDef, RenderDesignProps, RenderInstanceProps, ContextVar, ChildBlock } from '../blocks';
export interface CollapsibleBlockDef extends BlockDef {
    type: "collapsible";
    label: BlockDef | null;
    content: BlockDef | null;
}
export declare class CollapsibleBlock extends CompoundBlock<CollapsibleBlockDef> {
    getChildren(contextVars: ContextVar[]): ChildBlock[];
    validate(): null;
    processChildren(action: (self: BlockDef) => BlockDef | null): BlockDef;
    renderDesign(props: RenderDesignProps): JSX.Element;
    renderInstance(props: RenderInstanceProps): JSX.Element;
}
