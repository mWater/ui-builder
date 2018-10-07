import { ActionDef, Action } from "./actions";
/** Library of actions */
export declare class ActionLibrary {
    /** Creates an action from an action def */
    createAction(actionDef: ActionDef): Action<ActionDef>;
    /** Create a new action def with defaults set of the specified type */
    createNewActionDef(type: string): ActionDef;
    /** Get a list of all known action types */
    getActionTypes(): Array<{
        type: string;
        name: string;
    }>;
}
