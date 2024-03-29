import { LocalizedString } from "mwater-expressions";
import { BaseCtx } from "../contexts";
import { EmbeddedExpr } from "../embeddedExprs";
import { BlockDef, ContextVar } from "./blocks";
/** Widget is named and has a single block with a set of context variables specific to this widget */
export interface WidgetDef {
    /** Unique id (globally) */
    id: string;
    /** Name of the widget */
    name: string;
    /** Description of the widget */
    description: string;
    /** Optional grouping of this widget */
    group?: string;
    /** True if widget is deprecated */
    deprecated?: boolean;
    /** Block that it displays */
    blockDef: BlockDef | null;
    /** Context variables that act as arguments that will be passed to inner block */
    contextVars: ContextVar[];
    /** Preview values of context variables. Used only in designer for preview */
    contextVarPreviewValues: {
        [contextVarId: string]: any;
    };
    /** Context variables that are created for this widget and are not passed in. */
    privateContextVars?: ContextVar[];
    /** Values of private context variables */
    privateContextVarValues?: {
        [contextVarId: string]: any;
    };
    /** True to virtualize database in preview. Default true */
    virtualizeDatabaseInPreview?: boolean;
    /** Size of margins when displaying widget in page. Default is "normal" */
    pageMargins?: "normal" | "none";
    /** Title of the page (unless overridden by opening page) */
    title?: LocalizedString | null;
    /** Expression embedded in the text string. Referenced by {0}, {1}, etc. */
    titleEmbeddedExprs?: EmbeddedExpr[];
}
export declare type LookupWidget = (id: string) => WidgetDef | null;
/** Validate a widget, optionally also validating all children */
export declare function validateWidget(widgetDef: WidgetDef, ctx: BaseCtx, includeChildren: boolean): string | null;
