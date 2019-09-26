/// <reference types="react" />
import { WidgetLibrary } from "./widgetLibrary";
import { WidgetDef } from "../widgets/widgets";
/** Tab which lists existing tabs and offers a button to create a new tab */
export declare const NewTab: (props: {
    widgetLibrary: WidgetLibrary;
    onAddWidget: (widgetDef: WidgetDef) => void;
    onOpenWidget: (widgetId: string) => void;
    onRemoveWidget: (widgetId: string) => void;
    onDuplicateWidget: (widgetDef: WidgetDef) => void;
    /** Validates a widget returning error if any */
    validateWidget: (widgetDef: WidgetDef) => string | null;
}) => JSX.Element;
