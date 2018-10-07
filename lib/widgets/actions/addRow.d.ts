/// <reference types="react" />
import { ActionDef, Action, PerformActionOptions, RenderActionEditorProps, ValidateActionOptions } from '../actions';
import { Expr } from 'mwater-expressions';
import { ContextVar } from '../blocks';
interface ContextVarExpr {
    /** Optional context variable which expression is based on. Can be null for literal expression */
    contextVarId: string | null;
    /** Expression to generate column values */
    expr: Expr;
}
export interface AddRowActionDef extends ActionDef {
    type: "addRow";
    table: string | null;
    /** Expressions to generate column values */
    columnValues: {
        [columnId: string]: ContextVarExpr;
    };
}
export declare class AddRowAction extends Action<AddRowActionDef> {
    performAction(options: PerformActionOptions): Promise<void>;
    validate(options: ValidateActionOptions): null;
    /** Get any context variables expressions that this action needs */
    getContextVarExprs(contextVar: ContextVar): Expr[];
    renderEditor(props: RenderActionEditorProps): JSX.Element;
}
export {};
