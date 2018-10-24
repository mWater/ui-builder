import * as React from "react";
import { ContextVar } from "./blocks";
import { ActionDef } from "./actions";
import { WidgetLibrary } from "../designer/widgetLibrary";
import { ActionLibrary } from "./ActionLibrary";
import { LocalizedString, Schema, DataSource, Expr, Table } from "mwater-expressions";
import { OrderBy } from "../database/Database";
import * as PropTypes from 'prop-types';
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
    filter?: (contextVar: ContextVar) => boolean;
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
    schema: Schema;
    dataSource: DataSource;
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
export declare class NumberFormatEditor extends React.Component<{
    value: string | null;
    onChange: (value: string) => void;
}> {
    render(): JSX.Element;
}
/** Edits a moment.js date format */
export declare class DateFormatEditor extends React.Component<{
    value: string | null;
    onChange: (value: string) => void;
}> {
    render(): JSX.Element;
}
/** Edits a moment.js datetime format */
export declare class DatetimeFormatEditor extends React.Component<{
    value: string | null;
    onChange: (value: string) => void;
}> {
    render(): JSX.Element;
}
interface TableSelectContext {
    tableSelectElementFactory: (options: {
        schema: Schema;
        value: string | null;
        onChange: (tableId: string) => void;
    }) => React.ReactElement<any>;
}
/** Allow selecting a table */
export declare class TableSelect extends React.Component<{
    schema: Schema;
    locale: string;
    value: string | null;
    onChange: (tableId: string) => void;
}> {
    static contextTypes: {
        tableSelectElementFactory: PropTypes.Requireable<(...args: any[]) => any>;
    };
    context: TableSelectContext;
    handleTableChange: (table: Table) => void;
    getOptionLabel: (table: Table) => string;
    getOptionValue: (table: Table) => string;
    render(): React.ReactElement<any>;
}
export {};
