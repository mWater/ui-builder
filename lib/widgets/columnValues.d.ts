import { Expr, Schema, DataSource } from "mwater-expressions";
import React from "react";
import { ContextVar } from "./blocks";
/** Expression based on a context variable */
export interface ContextVarExpr {
    /** Context variable which expression is based on. Null for literal-only */
    contextVarId: string | null;
    /** Expression to generate column values */
    expr: Expr;
}
export interface ColumnValues {
    [columnId: string]: ContextVarExpr;
}
/** Allows editing list of column values for add */
export declare class ColumnValuesEditor extends React.Component<{
    value: ColumnValues;
    onChange: (value: ColumnValues) => void;
    schema: Schema;
    dataSource: DataSource;
    table: string;
    contextVars: ContextVar[];
    locale: string;
}> {
    handleContextVarChange: (columnId: string, contextVarId: string) => void;
    handleExprChange: (columnId: string, expr: Expr) => void;
    handleRemove: (columnId: string) => void;
    handleAdd: (option?: {
        label: string;
        value: string;
    } | undefined) => void;
    renderColumn(columnId: string): JSX.Element | null;
    render(): JSX.Element;
}
