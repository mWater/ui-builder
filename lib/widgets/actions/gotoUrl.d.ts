/// <reference types="react" />
import { ActionDef, Action, PerformActionOptions, RenderActionEditorProps, ValidateActionOptions } from '../actions';
export interface GotoUrlActionDef extends ActionDef {
    type: "gotoUrl";
    url?: string;
    /** True to open in new tab */
    newTab?: boolean;
}
export declare class GotoUrlAction extends Action<GotoUrlActionDef> {
    performAction(options: PerformActionOptions): Promise<void>;
    validate(options: ValidateActionOptions): "URL required" | null;
    renderEditor(props: RenderActionEditorProps): JSX.Element;
}