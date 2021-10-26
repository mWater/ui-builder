/// <reference types="react" />
import { ActionDef, Action, RenderActionEditorProps } from "../actions";
import { DesignCtx, InstanceCtx } from "../../contexts";
export interface RefreshDataActionDef extends ActionDef {
    type: "refreshData";
}
/** Refreshes all data-driven widgets */
export declare class RefreshDataAction extends Action<RefreshDataActionDef> {
    validate(designCtx: DesignCtx): null;
    renderEditor(props: RenderActionEditorProps): JSX.Element;
    performAction(instanceCtx: InstanceCtx): Promise<void>;
}
