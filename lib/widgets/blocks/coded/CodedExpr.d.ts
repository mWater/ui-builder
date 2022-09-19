/// <reference types="react" />
import { Expr, Schema, DataSource } from "mwater-expressions";
import { ContextVar } from "../../..";
/** Expression that is available as a prop */
export interface CodedExpr {
    /** Name of the expression. Will be exposed as prop */
    name: string;
    /** Context variable (row or rowset) to use for expression */
    contextVarId: string | null;
    /** Expression to evaluate */
    expr: Expr;
}
/** Edits coded expressions. */
export declare function CodedExprsEditor(props: {
    value?: CodedExpr[] | null;
    onChange: (value: CodedExpr[]) => void;
    schema: Schema;
    dataSource: DataSource;
    contextVars: ContextVar[];
}): JSX.Element;
/** Allows editing of an coded expression */
export declare const CodedExprEditor: (props: {
    value: CodedExpr;
    onChange: (codedExpr: CodedExpr) => void;
    schema: Schema;
    dataSource: DataSource;
    contextVars: ContextVar[];
}) => JSX.Element;
