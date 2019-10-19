/// <reference types="react" />
import CompoundBlock from '../CompoundBlock';
import { BlockDef, ContextVar, ChildBlock } from '../blocks';
import { DesignCtx, InstanceCtx } from '../../contexts';
/** Block that can be printed by a print button at top right */
export interface PrintBlockDef extends BlockDef {
    type: "print";
    content: BlockDef | null;
}
export declare class PrintBlock extends CompoundBlock<PrintBlockDef> {
    getChildren(contextVars: ContextVar[]): ChildBlock[];
    validate(): null;
    processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef;
    renderDesign(props: DesignCtx): JSX.Element;
    renderInstance(props: InstanceCtx): JSX.Element;
}
