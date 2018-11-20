/// <reference types="react" />
import { ActionDef, Action, PerformActionOptions, RenderActionEditorProps, ValidateActionOptions } from '../actions';
export interface RemoveRowActionDef extends ActionDef {
    type: "removeRow";
    /** Context variable (row) to remove */
    contextVarId: string | null;
}
/** Remove a single row specified by a context variable */
export declare class RemoveRowAction extends Action<RemoveRowActionDef> {
    performAction(options: PerformActionOptions): Promise<void>;
    validate(options: ValidateActionOptions): "Context variable required" | null;
    renderEditor(props: RenderActionEditorProps): JSX.Element;
}
