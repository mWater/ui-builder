/// <reference types="react" />
import { Block, BlockDef, ContextVar, ChildBlock } from "../blocks";
import { Expr } from "mwater-expressions";
import { DesignCtx, InstanceCtx } from "../../contexts";
/** Block which creates a new rowset context variable */
export interface RowsetBlockDef extends BlockDef {
    type: "rowset";
    /** Table that the rowset if from */
    table?: string;
    /** Name of the rowset context variable */
    name?: string | null;
    /** Filter which applies to rows in the rowset */
    filter: Expr;
    /** Block which is in the rowset */
    content: BlockDef | null;
}
export declare class RowsetBlock extends Block<RowsetBlockDef> {
    getChildren(contextVars: ContextVar[]): ChildBlock[];
    createContextVar(): ContextVar | null;
    validate(options: DesignCtx): string | null;
    processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef;
    renderDesign(props: DesignCtx): JSX.Element;
    renderInstance(props: InstanceCtx): JSX.Element;
    renderEditor(props: DesignCtx): JSX.Element;
}
