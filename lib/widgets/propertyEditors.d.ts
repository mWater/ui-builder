import * as React from "react";
import { ContextVar } from "./blocks";
import { ActionDef } from "./actions";
import { LocalizedString, Schema, DataSource, Expr, Table, EnumValue, AggrStatus, LiteralType } from "mwater-expressions";
import { OrderBy } from "../database/Database";
import * as PropTypes from 'prop-types';
import { EmbeddedExpr } from "../embeddedExprs";
import { DesignCtx } from "../contexts";
/** Labeled group */
export declare const LabeledProperty: React.FC<{
    label: string;
    help?: string;
    hint?: string;
}>;
/** Creates a property editor for a property */
export declare class PropertyEditor<T, K extends keyof T> extends React.Component<{
    obj: T;
    onChange: (obj: any) => void;
    property: K;
    children: (value: T[K], onChange: (value: T[K]) => void) => React.ReactElement<any>;
}> {
    handleChange: (value: T[K]) => void;
    render(): React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>;
}
export declare class LocalizedTextPropertyEditor extends React.Component<{
    value?: LocalizedString | null;
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
    value?: string | null;
    onChange: (value: string) => void;
    contextVars: ContextVar[];
    types?: string[];
    table?: string;
    /** Makes null say something other than "Select..." */
    nullLabel?: string;
    filter?: (contextVar: ContextVar) => boolean;
}> {
    render(): JSX.Element;
}
/** Edits both a context variable selection and a related expression */
export declare const ContextVarExprPropertyEditor: (props: {
    schema: Schema;
    dataSource: DataSource;
    contextVars: ContextVar[];
    contextVarId: string | null;
    expr: Expr;
    onChange: (contextVarId: string | null, expr: Expr) => void;
    aggrStatuses?: AggrStatus[] | undefined;
    types?: LiteralType[] | undefined;
    enumValues?: {
        id: string;
        name: LocalizedString;
    }[] | undefined;
    idTable?: string | undefined;
}) => JSX.Element;
/** Edits an action definition, allowing selection of action */
export declare class ActionDefEditor extends React.Component<{
    value?: ActionDef | null;
    onChange: (actionDef: ActionDef | null) => void;
    designCtx: DesignCtx;
}> {
    handleChangeAction: (type: string | null) => void;
    render(): JSX.Element;
}
/** Edits an array of order by expressions */
export declare class OrderByArrayEditor extends React.Component<{
    value?: OrderBy[] | null;
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
    value?: string | null;
    onChange: (tableId: string) => void;
}> {
    static contextTypes: {
        tableSelectElementFactory: PropTypes.Requireable<(...args: any[]) => any>;
    };
    context: TableSelectContext;
    handleTableChange: (table: Table) => void;
    getOptionLabel: (table: Table) => string;
    getOptionValue: (table: Table) => string;
    render(): JSX.Element;
}
/** Edits an array of enum values */
export declare const EnumArrayEditor: (props: {
    value?: string[] | null | undefined;
    onChange: (value: string[] | null) => void;
    enumValues: EnumValue[];
    locale?: string | undefined;
    placeholder?: string | undefined;
}) => JSX.Element;
/** Edits embedded expressions. */
export declare const EmbeddedExprsEditor: (props: {
    value?: EmbeddedExpr[] | null | undefined;
    onChange: (value: EmbeddedExpr[]) => void;
    schema: Schema;
    dataSource: DataSource;
    contextVars: ContextVar[];
}) => JSX.Element;
/** Allows editing of an embedded expression */
export declare const EmbeddedExprEditor: (props: {
    value: EmbeddedExpr;
    onChange: (embeddedExpr: EmbeddedExpr) => void;
    schema: Schema;
    dataSource: DataSource;
    contextVars: ContextVar[];
    index: number;
}) => JSX.Element;
export {};
