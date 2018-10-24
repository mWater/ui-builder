import * as React from 'react';
import { ContextVar } from './blocks';
import { Database } from '../database/Database';
import { WidgetLibrary } from '../designer/widgetLibrary';
import { PageStack } from '../PageStack';
import { Schema, Expr, DataSource } from 'mwater-expressions';
export interface ActionDef {
    type: string;
    [index: string]: any;
}
export interface RenderActionEditorProps {
    schema: Schema;
    dataSource: DataSource;
    /** Context variables for the action */
    contextVars: ContextVar[];
    /** locale of the editor (e.g. "en") */
    locale: string;
    /** Action being edited */
    actionDef: ActionDef;
    /** Widget library that lists all available widgets */
    widgetLibrary: WidgetLibrary;
    onChange(actionDef: ActionDef): void;
}
export interface PerformActionOptions {
    /** locale to display (e.g. "en") */
    locale: string;
    database: Database;
    pageStack: PageStack;
    /** Context variables for the action */
    contextVars: ContextVar[];
    /** Values of context variables */
    contextVarValues: {
        [contextVarId: string]: any;
    };
    /**
     * Gets the value of an expression based off of a context variable
     * @param contextVarId id of context variable
     * @param expr expression to get value of
     */
    getContextVarExprValue(contextVarId: string, expr: Expr): any;
}
export interface ValidateActionOptions {
    schema: Schema;
    contextVars: ContextVar[];
    /** Widget library that lists all available widgets */
    widgetLibrary: WidgetLibrary;
}
/** Actions are how blocks interact with things outside of themselves */
export declare abstract class Action<T extends ActionDef> {
    actionDef: T;
    constructor(actionDef: T);
    /** Determine if action is valid. null means valid, string is error message */
    abstract validate(options: ValidateActionOptions): string | null;
    /** Perform the action, returning a promise that fulfills when complete */
    abstract performAction(options: PerformActionOptions): Promise<void>;
    /** Render an optional property editor for the action. This may use bootstrap */
    renderEditor(props: RenderActionEditorProps): React.ReactElement<any> | null;
    /** Get any context variables expressions that this action needs */
    getContextVarExprs(contextVar: ContextVar, widgetLibrary: WidgetLibrary): Expr[];
}
