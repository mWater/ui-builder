/// <reference types="react" />
import { ActionDef, Action, RenderActionEditorProps } from "../actions";
import { EmbeddedExpr } from "../../embeddedExprs";
import { DesignCtx, InstanceCtx } from "../../contexts";
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
    renderEditor(props: RenderActionEditorProps): JSX.Element;
    performAction(instanceCtx: InstanceCtx): Promise<void>;
}
