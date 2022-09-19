import { DesignCtx } from "../../..";
import { ActionDef } from "../../actions";
/** Action that is available as a prop */
export interface CodedAction {
    /** Name of the action. Will be exposed as prop */
    name: string;
    /** Expression to evaluate */
    actionDef: ActionDef | null;
}
/** Edits coded actions. */
export declare const CodedActionsEditor: (props: {
    value?: CodedAction[] | null | undefined;
    onChange: (value: CodedAction[]) => void;
    designCtx: DesignCtx;
}) => JSX.Element;
/** Allows editing of an coded action */
export declare const CodedActionEditor: (props: {
    value: CodedAction;
    onChange: (codedExpr: CodedAction) => void;
    designCtx: DesignCtx;
}) => JSX.Element;
