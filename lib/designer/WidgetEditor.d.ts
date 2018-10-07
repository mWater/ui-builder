import * as React from "react";
import { WidgetDef } from "../widgets/widgets";
import { ContextVar } from "../widgets/blocks";
import { Schema, DataSource } from "mwater-expressions";
interface WidgetEditorProps {
    widgetDef: WidgetDef;
    schema: Schema;
    dataSource: DataSource;
    onWidgetDefChange(widgetDef: WidgetDef): void;
}
/** Edits the overall properties of a widget */
export declare class WidgetEditor extends React.Component<WidgetEditorProps> {
    handleContextVarsChange: (contextVars: ContextVar[]) => void;
    render(): JSX.Element;
}
export {};
