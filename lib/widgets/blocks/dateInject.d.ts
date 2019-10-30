/// <reference types="react" />
import { Block, BlockDef, ContextVar, ChildBlock } from '../blocks';
import { DesignCtx, InstanceCtx } from '../../contexts';
/** Block which allows selecting a single date and injects it as a context variable */
export interface DateInjectBlockDef extends BlockDef {
    type: "dateInject";
    /** Block which is in the passed the row */
    content: BlockDef | null;
}
export declare class DateInjectBlock extends Block<DateInjectBlockDef> {
    getChildren(contextVars: ContextVar[]): ChildBlock[];
    createContextVar(): ContextVar;
    validate(options: DesignCtx): "Content required" | null;
    processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef;
    renderDesign(designCtx: DesignCtx): JSX.Element;
    renderInstance(instanceCtx: InstanceCtx): JSX.Element;
    renderEditor(designCtx: DesignCtx): JSX.Element;
}
