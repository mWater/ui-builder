/// <reference types="react" />
import { Database, OrderBy } from "../../../database/Database";
import { Expr } from 'mwater-expressions';
import { ContextVar } from '../../blocks';
interface SingleProps<T> {
    database: Database;
    table: string;
    value: T | null;
    onChange: (value: T | null) => void;
    placeholder?: string;
    /** True to select multiple values */
    multi: false;
    /** Format the label given the label values */
    formatLabel: (labelValues: any[]) => string;
    /** Expressions which are embedded in the label as {0}, {1}... */
    labelEmbeddedExprs: Expr[];
    /** Text/enum expressions to search on */
    searchExprs: Expr[];
    /** Sort order of results */
    orderBy: OrderBy[];
    /** Optional filter on options */
    filterExpr?: Expr;
    contextVars: ContextVar[];
    contextVarValues: {
        [contextVarId: string]: any;
    };
}
interface MultiProps<T> {
    database: Database;
    table: string;
    value: T[] | null;
    onChange: (value: T[] | null) => void;
    placeholder?: string;
    /** True to select multiple values */
    multi: true;
    /** Format the label given the label values */
    formatLabel: (labelValues: any[]) => string;
    /** Expressions which are embedded in the label as {0}, {1}... */
    labelEmbeddedExprs: Expr[];
    /** Text/enum expressions to search on */
    searchExprs: Expr[];
    /** Sort order of results */
    orderBy: OrderBy[];
    /** Optional filter on options */
    filterExpr?: Expr;
    contextVars: ContextVar[];
    contextVarValues: {
        [contextVarId: string]: any;
    };
}
declare type Props<T> = SingleProps<T> | MultiProps<T>;
/** Displays a combo box that allows selecting one text values from an expression */
export declare function IdDropdownComponent<T>(props: Props<T>): JSX.Element;
export {};
