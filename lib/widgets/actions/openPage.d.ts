import * as React from 'react';
import { ActionDef, Action, RenderActionEditorProps } from '../actions';
import { LocalizedString, Expr } from 'mwater-expressions';
import { EmbeddedExpr } from '../../embeddedExprs';
import { ContextVar } from '../blocks';
import { DesignCtx, InstanceCtx } from '../../contexts';
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
    /** Title of page to open */
    title?: LocalizedString | null;
    /** Expression embedded in the text string. Referenced by {0}, {1}, etc. */
    titleEmbeddedExprs?: EmbeddedExpr[];
    /** id of the widget that will be displayed in the page */
    widgetId: string | null;
    /** Values of context variables that widget inside page needs */
    contextVarValues: {
        [contextVarId: string]: ContextVarRef;
    };
    /** True to replace current page */
    replacePage?: boolean;
}
export declare class OpenPageAction extends Action<OpenPageActionDef> {
    validate(designCtx: DesignCtx): string | null;
    /** Get any context variables expressions that this action needs */
    getContextVarExprs(contextVar: ContextVar): Expr[];
    performAction(instanceCtx: InstanceCtx): Promise<void>;
    /** Render an optional property editor for the action. This may use bootstrap */
    renderEditor(props: RenderActionEditorProps): React.ReactElement<any> | null;
}
export {};
