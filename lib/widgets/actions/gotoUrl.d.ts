/// <reference types="react" />
import { ActionDef, Action, RenderActionEditorProps } from '../actions';
import { EmbeddedExpr } from '../../embeddedExprs';
import { DesignCtx, InstanceCtx } from '../../contexts';
import { ContextVar } from '../blocks';
import { Expr } from 'mwater-expressions';
export interface GotoUrlActionDef extends ActionDef {
    type: "gotoUrl";
    url?: string | null;
    /** True to open in new tab */
    newTab?: boolean;
    /** Expression embedded in the url string. Referenced by {0}, {1}, etc. */
    urlEmbeddedExprs?: EmbeddedExpr[];
}
/** Opens a URL optionally in a new tab */
export declare class GotoUrlAction extends Action<GotoUrlActionDef> {
    validate(designCtx: DesignCtx): string | null;
    /** Get any context variables expressions that this action needs */
    getContextVarExprs(contextVar: ContextVar): Expr[];
    renderEditor(props: RenderActionEditorProps): JSX.Element;
    performAction(instanceCtx: InstanceCtx): Promise<void>;
}
