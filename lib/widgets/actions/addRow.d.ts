/// <reference types="react" />
import { ActionDef, Action, RenderActionEditorProps } from '../actions';
import { Expr } from 'mwater-expressions';
import { ContextVar } from '../blocks';
import { ContextVarExpr } from '../columnValues';
import { InstanceCtx, DesignCtx } from '../../contexts';
export interface AddRowActionDef extends ActionDef {
    type: "addRow";
    table: string | null;
    /** Expressions to generate column values */
    columnValues: {
        [columnId: string]: ContextVarExpr;
    };
}
export declare class AddRowAction extends Action<AddRowActionDef> {
    performAction(instanceCtx: InstanceCtx): Promise<void>;
    validate(designCtx: DesignCtx): string | null;
    validateColumnValue(designCtx: DesignCtx, columnId: string): string | null;
    /** Get any context variables expressions that this action needs */
    getContextVarExprs(contextVar: ContextVar): Expr[];
    renderEditor(props: RenderActionEditorProps): JSX.Element;
}
