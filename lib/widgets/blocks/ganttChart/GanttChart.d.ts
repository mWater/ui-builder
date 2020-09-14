/// <reference types="react" />
import { BlockDef, ContextVar } from '../../blocks';
import { DesignCtx, InstanceCtx } from '../../../contexts';
import LeafBlock from '../../LeafBlock';
import { Expr } from 'mwater-expressions';
import { ActionDef } from '../../actions';
/** Gantt chart */
export interface GanttChartBlockDef extends BlockDef {
    type: "ganttChart";
    /** Id of context variable of rowset for table to use */
    rowsetContextVarId: string | null;
    /** Filter which rows are included */
    filter: Expr;
    /** Allows overriding start date of chart */
    startDate: string | null;
    /** Allows overriding end date of chart */
    endDate: string | null;
    /** Expression which gives start date of rows */
    rowStartDateExpr: Expr;
    /** Expression which gives end date of rows */
    rowEndDateExpr: Expr;
    /** Expression which gives label of rows */
    rowLabelExpr: Expr;
    /** Column that determines order of the rows. Should be number column to be re-orderable */
    rowOrderColumn: string | null;
    /** Column that is parent row. Should be id type if present */
    rowParentColumn: string | null;
    /** Action to perform when row is clicked */
    rowClickAction?: ActionDef | null;
    /** Action to perform when row is added */
    addRowAction?: ActionDef | null;
    /** Color of bars. Defaults to #68cdee */
    barColor: string | null;
}
export declare class GanttChartBlock extends LeafBlock<GanttChartBlockDef> {
    validate(designCtx: DesignCtx): string | null;
    getContextVarExprs(contextVar: ContextVar, ctx: DesignCtx | InstanceCtx): Expr[];
    /** Create the context variable used */
    createRowContextVar(rowsetCV: ContextVar): ContextVar;
    /** Create context variables that add row action receives */
    createAddRowOrderContextVar(rowsetCV: ContextVar): ContextVar;
    /** Create context variables that add row action receives */
    createAddRowParentContextVar(rowsetCV: ContextVar): ContextVar;
    renderDesign(ctx: DesignCtx): JSX.Element;
    renderInstance(ctx: InstanceCtx): JSX.Element;
    renderEditor(props: DesignCtx): JSX.Element;
}
