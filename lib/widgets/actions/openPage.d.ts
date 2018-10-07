import * as React from 'react';
import { ActionDef, Action, PerformActionOptions, RenderActionEditorProps, ValidateActionOptions } from '../actions';
/** Direct reference to another context variable */
interface ContextVarRef {
    type: "ref";
    /** Context variable whose value should be used */
    contextVarId: string;
}
/** Action which opens a page */
export interface OpenPageActionDef extends ActionDef {
    type: "openPage";
    pageType: "normal" | "modal";
    /** id of the widget that will be displayed in the page */
    widgetId: string | null;
    /** Values of context variables that widget inside page needs */
    contextVarValues: {
        [contextVarId: string]: ContextVarRef;
    };
}
export declare class OpenPageAction extends Action<OpenPageActionDef> {
    validate(options: ValidateActionOptions): "Widget required" | "Invalid widget" | "Invalid context variable" | null;
    performAction(options: PerformActionOptions): Promise<void>;
    /** Render an optional property editor for the action. This may use bootstrap */
    renderEditor(props: RenderActionEditorProps): React.ReactElement<any> | null;
}
export {};
