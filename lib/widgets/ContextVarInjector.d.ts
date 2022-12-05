import { ContextVar, Filter } from "./blocks";
import * as React from "react";
import { Expr, Variable } from "mwater-expressions";
import { QueryOptions } from "../database/Database";
import { InstanceCtx } from "../contexts";
export interface Props {
    injectedContextVar: ContextVar;
    value: any;
    instanceCtx: InstanceCtx;
    contextVarExprs?: Expr[];
    initialFilters?: Promise<Filter[]>;
    children: (instanceCtx: InstanceCtx, loading: boolean, refreshing: boolean) => React.ReactElement<any> | null;
}
interface State {
    filters?: Filter[];
    loading: boolean;
    refreshing: boolean;
    error?: Error;
    /** Value of expressions. Index by canonicalized JSON */
    exprValues: {
        [exprJson: string]: any;
    };
    /** Filtered context var values at last refresh. Used to detect changes */
    filteredContextVarValues: {
        [contextVarId: string]: any;
    };
}
/** Injects one context variable into the inner render instance props.
 * Holds state of the filters that are applied to rowset-type context vars
 * Computes values of expressions for row and rowset types
 */
export default class ContextVarInjector extends React.Component<Props, State> {
    /** True when component is unmounted */
    unmounted: boolean;
    constructor(props: Props);
    componentDidMount(): void;
    componentDidUpdate(prevProps: Props, prevState: State): void;
    componentWillUnmount(): void;
    handleDatabaseChange: () => void;
    createRowQueryOptions(table: string): QueryOptions;
    /** Create query options for aggregate and literal expressions */
    createRowsetAggrQueryOptions(table: string, variables: Variable[]): QueryOptions;
    /** Create query options for individual expressions */
    createRowsetIndividualQueryOptions(table: string, variables: Variable[], expr: Expr): QueryOptions;
    performQueries(): Promise<void>;
    /** Create props needed by inner component */
    createInnerProps(): InstanceCtx;
    render(): JSX.Element | null;
}
export {};
