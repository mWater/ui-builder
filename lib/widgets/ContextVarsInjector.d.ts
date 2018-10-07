import { RenderInstanceProps, ContextVar, BlockDef, CreateBlock } from "./blocks";
import * as React from "react";
import { Schema } from "mwater-expressions";
import { Database } from "../database/Database";
interface Props {
    contextVars: ContextVar[];
    contextVarValues: {
        [contextVarId: string]: any;
    };
    renderInstanceProps: RenderInstanceProps;
    schema: Schema;
    database: Database;
    /** Block that will be inside the context var injector. Needed to get expressions that will be evaluated */
    innerBlock: BlockDef;
    createBlock: CreateBlock;
    children: (renderInstanceProps: RenderInstanceProps, loading: boolean, refreshing: boolean) => React.ReactElement<any>;
}
/** Injects one or more context variables into the inner render instance props.
 * Holds state of the filters that are applied to rowset.
 * Computes values of expressions
 */
export default class ContextVarsInjector extends React.Component<Props> {
    render(): React.ReactElement<any>;
}
export {};
