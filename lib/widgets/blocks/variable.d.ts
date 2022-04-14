/// <reference types="react" />
import { Block, BlockDef, ContextVar, ChildBlock } from "../blocks";
import { Expr, Schema } from "mwater-expressions";
import { DesignCtx, InstanceCtx } from "../../contexts";
import { ContextVarExpr } from "../../ContextVarExpr";
/** Block which evaluates and expression and creates context variable with a literal value */
export interface VariableBlockDef extends BlockDef {
    type: "variable";
    /** Name of the new context variable */
    name?: string | null;
    /** Expression to evaluate */
    contextVarExpr?: ContextVarExpr;
    /** Block which is in the rowset */
    content: BlockDef | null;
}
export declare class VariableBlock extends Block<VariableBlockDef> {
    getContextVarExprs(contextVar: ContextVar, ctx: DesignCtx | InstanceCtx): Expr[];
    getChildren(contextVars: ContextVar[], schema: Schema): ChildBlock[];
    createContextVar(contextVars: ContextVar[], schema: Schema): ContextVar | null;
    validate(ctx: DesignCtx): string | null;
    processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef;
    renderDesign(ctx: DesignCtx): JSX.Element;
    renderInstance(ctx: InstanceCtx): JSX.Element;
    renderEditor(props: DesignCtx): JSX.Element;
}
