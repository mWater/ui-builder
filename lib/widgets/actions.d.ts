import * as React from 'react';
import { ContextVar } from './blocks';
import { Expr } from 'mwater-expressions';
import { DesignCtx, InstanceCtx } from '../contexts';
/** Action definition. Something that can be performed */
export interface ActionDef {
    type: string;
    [index: string]: any;
}
export interface RenderActionEditorProps extends DesignCtx {
    onChange(actionDef: ActionDef): void;
}
/** Actions are how blocks interact with things outside of themselves */
export declare abstract class Action<T extends ActionDef> {
    actionDef: T;
    constructor(actionDef: T);
    /** Determine if action is valid. null means valid, string is error message */
    abstract validate(designCtx: DesignCtx): string | null;
    /** Perform the action, returning a promise that fulfills when complete */
    abstract performAction(instanceCtx: InstanceCtx): Promise<void>;
    /** Render an optional property editor for the action. This may use bootstrap */
    renderEditor(props: RenderActionEditorProps): React.ReactElement<any> | null;
    /** Get any context variables expressions that this action needs */
    getContextVarExprs(contextVar: ContextVar): Expr[];
}
