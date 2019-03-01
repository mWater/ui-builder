/// <reference types="react" />
import { ActionDef, Action, PerformActionOptions, RenderActionEditorProps, ValidateActionOptions } from '../actions';
import { Expr } from 'mwater-expressions';
import { ContextVar } from '../blocks';
import { ContextVarExpr } from '../columnValues';
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
    validate(options: ValidateActionOptions): string | null;
    validateColumnValue(options: ValidateActionOptions, columnId: string): string | null;
    /** Get any context variables expressions that this action needs */
    getContextVarExprs(contextVar: ContextVar): Expr[];
    renderEditor(props: RenderActionEditorProps): JSX.Element;
}
