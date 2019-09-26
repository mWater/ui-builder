/// <reference types="react" />
import { Database } from "../../../database/Database";
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
    /** Expression to use for label */
    labelExpr: Expr;
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
    /** Expression to use for label */
    labelExpr: Expr;
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
