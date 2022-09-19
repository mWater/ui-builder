/// <reference types="react" />
import { Schema, DataSource, Expr } from "mwater-expressions";
import { OrderBy, ContextVar } from "../../..";
/** Query that is available as a prop */
export interface CodedQuery {
    /** Name of the query. Will be exposed as prop */
    name: string;
    selects: {
        alias: string;
        expr: Expr;
    }[];
    distinct?: boolean;
    from: string;
    where?: Expr;
    orderBy?: OrderBy[];
    limit?: number | null;
}
/** Edits coded queries. */
export declare function CodedQueriesEditor(props: {
    value?: CodedQuery[] | null;
    onChange: (value: CodedQuery[]) => void;
    schema: Schema;
    dataSource: DataSource;
    contextVars: ContextVar[];
}): JSX.Element;
export declare function CodedQueryEditor(props: {
    value: Partial<CodedQuery>;
    onChange: (value: Partial<CodedQuery>) => void;
    schema: Schema;
    dataSource: DataSource;
    contextVars: ContextVar[];
}): JSX.Element;
/** Validate a coded query, returning null if ok, or error */
export declare function validateCodedQuery(codedQuery: Partial<CodedQuery>, schema: Schema, contextVars: ContextVar[]): string | null;
