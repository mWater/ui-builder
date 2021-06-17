import { Database, OrderBy } from "../../../database/Database";
import { Expr } from 'mwater-expressions';
import React from 'react';
import { ContextVar } from '../../blocks';
import { Styles } from 'react-select';
interface SingleProps<T> {
    database: Database;
    table: string;
    value: T | null;
    onChange?: (value: T | null) => void;
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
    /** Styling for react-select */
    styles?: Partial<Styles>;
}
interface MultiProps<T> {
    database: Database;
    table: string;
    value: T[] | null;
    onChange?: (value: T[] | null) => void;
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
    /** Optional styling for react-select */
    styles?: Partial<Styles>;
}
declare type Props<T> = SingleProps<T> | MultiProps<T>;
/** Displays a combo box that allows selecting one id value from a list */
declare function IdDropdownComponent<T>(props: Props<T>): JSX.Element;
declare const MemoIdDropdownComponent: React.MemoExoticComponent<typeof IdDropdownComponent>;
export { MemoIdDropdownComponent as IdDropdownComponent };
