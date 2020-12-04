import * as React from "react";
import { WidgetDef } from "../widgets/widgets";
import { ContextVar } from "../widgets/blocks";
import { DesignCtx } from "../contexts";
interface WidgetEditorProps {
    designCtx: DesignCtx;
    widgetDef: WidgetDef;
    onWidgetDefChange(widgetDef: WidgetDef): void;
}
/** Edits the overall properties of a widget */
export declare class WidgetEditor extends React.Component<WidgetEditorProps> {
    handleContextVarsChange: (contextVars: ContextVar[]) => void;
    handleContextVarPreviewValues: (contextVarPreviewValues: {
        [contextVarId: string]: any;
    }) => void;
    handlePrivateContextVarValuesChange: (privateContextVarValues: {
        [contextVarId: string]: any;
    }) => void;
    render(): JSX.Element;
}
export {};
/** Individual item of a context variable list */
