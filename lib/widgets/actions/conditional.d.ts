/// <reference types="react" />
import { ActionDef, Action, RenderActionEditorProps } from "../actions";
import { DesignCtx, InstanceCtx } from "../../contexts";
import { ContextVarExpr } from "../../ContextVarExpr";
export interface ConditionalActionDef extends ActionDef {
    type: "conditional";
    /** Condition to test */
    ifExpr?: ContextVarExpr;
    /** Actions to perform if true */
    thenAction: ActionDef | null;
    /** Actions to perform if false */
    elseAction: ActionDef | null;
}
/** Action that does one of two things depending on an expression */
export declare class ConditionalAction extends Action<ConditionalActionDef> {
    validate(designCtx: DesignCtx): string | null;
    renderEditor(props: RenderActionEditorProps): JSX.Element;
    performAction(instanceCtx: InstanceCtx): Promise<void>;
}
