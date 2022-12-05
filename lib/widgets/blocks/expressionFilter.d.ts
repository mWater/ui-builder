/// <reference types="react" />
import LeafBlock from "../LeafBlock";
import { BlockDef, Filter } from "../blocks";
import { Expr } from "mwater-expressions";
import { DesignCtx, InstanceCtx } from "../../contexts";
export interface ExpressionFilterBlockDef extends BlockDef {
    type: "expressionFilter";
    /** Id of context variable of rowset to filter */
    rowsetContextVarId: string | null;
    /** Default filter to apply. Boolean expression */
    defaultFilterExpr: Expr;
}
/** Filter by a customizable expression
 */
export declare class ExpressionFilterBlock extends LeafBlock<ExpressionFilterBlockDef> {
    validate(options: DesignCtx): string | null;
    getInitialFilters(contextVarId: string, instanceCtx: InstanceCtx): Promise<Filter[]>;
    renderDesign(props: DesignCtx): JSX.Element;
    renderInstance(ctx: InstanceCtx): JSX.Element;
    renderEditor(ctx: DesignCtx): JSX.Element;
}
