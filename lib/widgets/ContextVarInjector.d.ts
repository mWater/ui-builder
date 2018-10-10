import { RenderInstanceProps, ContextVar, Filter } from "./blocks";
import * as React from "react";
import { Expr, Schema } from "mwater-expressions";
import { QueryOptions, Database } from "../database/Database";
interface Props {
    contextVar: ContextVar;
    value: any;
    renderInstanceProps: RenderInstanceProps;
    contextVarExprs?: Expr[];
    initialFilters?: Filter[];
    schema: Schema;
    database: Database;
    children: (renderInstanceProps: RenderInstanceProps, loading: boolean, refreshing: boolean) => React.ReactElement<any>;
}
interface State {
    filters: Filter[];
    loading: boolean;
    refreshing: boolean;
    /** Value of expressions. Index by canonicalized JSON */
    exprValues: {
        [exprJson: string]: any;
    };
}
/** Injects one context variable into the inner render instance props.
 * Holds state of the filters that are applied to rowset-type context vars
 * Computes values of expressions for row and rowset types
 */
export default class ContextVarInjector extends React.Component<Props, State> {
    constructor(props: Props);
    componentDidMount(): void;
    componentDidUpdate(prevProps: Props, prevState: State): void;
    componentWillUnmount(): void;
    handleDatabaseChange: () => void;
    createRowQueryOptions(table: string): QueryOptions;
    createRowsetQueryOptions(table: string): QueryOptions;
    performQueries(): Promise<void>;
    render(): React.ReactElement<any>;
}
export {};
