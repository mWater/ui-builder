import { Expr, Schema, DataSource } from "mwater-expressions";
import React from "react";
import { ContextVar } from "./blocks";
import { ContextVarExpr } from '../ContextVarExpr';
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
    handleContextVarExprChange: (columnId: string, contextVarId: string | null, expr: Expr) => void;
    handleRemove: (columnId: string) => void;
    handleAdd: (option?: {
        label: string;
        value: string;
    } | undefined) => void;
    renderColumn(columnId: string): JSX.Element | null;
    render(): JSX.Element;
}
