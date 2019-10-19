import { ContextVar, BlockDef } from "./blocks";
import * as React from "react";
import { InstanceCtx } from "../contexts";
interface Props {
    instanceCtx: InstanceCtx;
    injectedContextVars: ContextVar[];
    injectedContextVarValues: {
        [contextVarId: string]: any;
    };
    /** Block that will be inside the context var injector. Needed to get expressions that will be evaluated */
    innerBlock: BlockDef | null;
    children: (instanceCtx: InstanceCtx, loading: boolean, refreshing: boolean) => React.ReactElement<any>;
}
/** Injects one or more context variables into the inner render instance props.
 * Holds state of the filters that are applied to rowset.
 * Computes values of expressions
 */
export default class ContextVarsInjector extends React.Component<Props> {
    render(): React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>;
}
export {};
