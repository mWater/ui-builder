/// <reference types="react" />
import { ActionDef, Action, RenderActionEditorProps } from '../actions';
import { InstanceCtx, DesignCtx } from '../../contexts';
import { ContextVarExpr } from '../../ContextVarExpr';
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
    renderEditor(props: RenderActionEditorProps): JSX.Element;
}
