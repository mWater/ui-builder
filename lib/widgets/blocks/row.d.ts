/// <reference types="react" />
import { Block, BlockDef, ContextVar, ChildBlock } from '../blocks';
import { Expr } from 'mwater-expressions';
import { DesignCtx, InstanceCtx } from '../../contexts';
import { ContextVarExpr } from '../../ContextVarExpr';
/** Block which creates a new row context variable */
export interface RowBlockDef extends BlockDef {
    type: "row";
    /** Table that the row is from */
    table?: string;
    /** Name of the row context variable */
    name?: string | null;
    /** Mode to use to get the one row. Either by specifying a filter or by specifying an id. Default "filter" */
    mode?: "filter" | "id";
    /** For mode = "filter": Filter which filters table down to one row. Boolean expression */
    filter?: Expr;
    /** For mode = "id": context var expression to get the id to use */
    idContextVarExpr?: ContextVarExpr;
    /** Block which is in the row */
    content: BlockDef | null;
}
export declare class RowBlock extends Block<RowBlockDef> {
    getChildren(contextVars: ContextVar[]): ChildBlock[];
    createContextVar(): ContextVar | null;
    getContextVarExprs(contextVar: ContextVar, ctx: DesignCtx | InstanceCtx): Expr[];
    validate(options: DesignCtx): string | null;
    processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef;
    renderDesign(props: DesignCtx): JSX.Element;
    renderInstance(props: InstanceCtx): JSX.Element;
    renderEditor(props: DesignCtx): JSX.Element;
}
