/// <reference types="react" />
import { ActionDef, Action, RenderActionEditorProps } from '../actions';
import { InstanceCtx, DesignCtx } from '../../contexts';
export interface RemoveRowActionDef extends ActionDef {
    type: "removeRow";
    /** Context variable (row) to remove */
    contextVarId: string | null;
}
/** Remove a single row specified by a context variable */
export declare class RemoveRowAction extends Action<RemoveRowActionDef> {
    performAction(instanceCtx: InstanceCtx): Promise<void>;
    validate(designCtx: DesignCtx): "Context variable required" | null;
    renderEditor(props: RenderActionEditorProps): JSX.Element;
}
