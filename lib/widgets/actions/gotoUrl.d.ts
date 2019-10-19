/// <reference types="react" />
import { ActionDef, Action, RenderActionEditorProps } from '../actions';
export interface GotoUrlActionDef extends ActionDef {
    type: "gotoUrl";
    url?: string;
    /** True to open in new tab */
    newTab?: boolean;
}
export declare class GotoUrlAction extends Action<GotoUrlActionDef> {
    performAction(): Promise<void>;
    validate(): "URL required" | null;
    renderEditor(props: RenderActionEditorProps): JSX.Element;
}
