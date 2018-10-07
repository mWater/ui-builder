import * as React from 'react';
import { ContextVar } from './blocks';
import { Database } from '../database/Database';
import { WidgetLibrary } from '../designer/widgetLibrary';
import { PageStack } from '../PageStack';
import { Schema } from 'mwater-expressions';
export interface ActionDef {
    type: string;
    [index: string]: any;
}
export interface RenderActionEditorProps {
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
    /** Gets the value of a context variable */
    getContextVarValue(contextVarId: string): any;
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
}
