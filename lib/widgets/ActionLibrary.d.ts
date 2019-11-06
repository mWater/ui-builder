import { ActionDef, Action } from "./actions";
/** Library of actions */
export declare class ActionLibrary {
    customActions: {
        type: string;
        name: string;
        /** Creates a default action definition */
        actionDefFactory: (type: string) => ActionDef;
        /** Creates an action */
        actionFactory: (actionDef: ActionDef) => Action<ActionDef>;
    }[];
    constructor();
    registerCustomAction(type: string, name: string, actionDefFactory: (type: string) => ActionDef, actionFactory: (actionDef: ActionDef) => Action<ActionDef>): void;
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
