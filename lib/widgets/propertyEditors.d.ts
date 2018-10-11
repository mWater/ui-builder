import * as React from "react";
import { ContextVar } from "./blocks";
import { ActionDef } from "./actions";
import { WidgetLibrary } from "../designer/widgetLibrary";
import { ActionLibrary } from "./ActionLibrary";
import { LocalizedString, Schema, DataSource, Expr } from "mwater-expressions";
import { OrderBy } from "../database/Database";
export declare class LabeledProperty extends React.Component<{
    label: string;
    help?: string;
}> {
    render(): JSX.Element;
}
/** Creates a property editor for a property */
export declare class PropertyEditor<T, K extends keyof T> extends React.Component<{
    obj: T;
    onChange: (obj: T) => void;
    property: K;
    children: (value: T[K], onChange: (value: T[K]) => void) => React.ReactElement<any>;
}> {
    handleChange: (value: T[K]) => void;
    render(): React.ReactElement<any>;
}
export declare class LocalizedTextPropertyEditor extends React.Component<{
    value: LocalizedString | null;
    onChange: (value: LocalizedString | null) => void;
    locale: string;
    placeholder?: string;
    multiline?: boolean;
    allowCR?: boolean;
}> {
    handleChange: (e: any) => void;
    render(): JSX.Element;
}
interface Option {
    label: string;
    value: any;
}
export declare class DropdownPropertyEditor extends React.Component<{
    obj: object;
    onChange: (obj: object) => void;
    property: string;
    options: Option[];
    nullLabel?: string;
}> {
    handleChange: (value: any) => void;
    render(): JSX.Element;
}
/** Allows selecting a context variable */
export declare class ContextVarPropertyEditor extends React.Component<{
    value: string | null;
    onChange: (value: string) => void;
    contextVars: ContextVar[];
    types?: string[];
    table?: string;
}> {
    render(): JSX.Element;
}
/** Edits an action definition, allowing selection of action */
export declare class ActionDefEditor extends React.Component<{
    value: ActionDef | null;
    onChange: (actionDef: ActionDef | null) => void;
    locale: string;
    contextVars: ContextVar[];
    actionLibrary: ActionLibrary;
    widgetLibrary: WidgetLibrary;
}> {
    handleChangeAction: (type: string | null) => void;
    render(): JSX.Element;
}
/** Edits an array of order by expressions */
export declare class OrderByArrayEditor extends React.Component<{
    value?: OrderBy[];
    onChange: (value: OrderBy[]) => void;
    table: string;
    schema: Schema;
    dataSource: DataSource;
    contextVars: ContextVar[];
}> {
    handleAddOrderByExpr: () => void;
    render(): JSX.Element;
}
export declare class OrderByEditor extends React.Component<{
    value: OrderBy;
    onChange: (value: OrderBy) => void;
    table: string;
    schema: Schema;
    dataSource: DataSource;
    contextVars: ContextVar[];
}> {
    handleExprChange: (expr: Expr) => void;
    handleDirToggle: () => void;
    render(): JSX.Element;
}
/** Edits a d3 format */
export declare class FormatEditor extends React.Component<{
    value: string | null;
    onChange: (value: string) => void;
}> {
    render(): JSX.Element;
}
export {};
