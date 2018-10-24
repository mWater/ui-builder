import { getBlockTree } from "./blocks";
import * as React from "react";
import ContextVarInjector from './ContextVarInjector';
import * as _ from "lodash";
/** Injects one or more context variables into the inner render instance props.
 * Holds state of the filters that are applied to rowset.
 * Computes values of expressions
 */
export default class ContextVarsInjector extends React.Component {
    render() {
        // Wrap once per child
        let elem = this.props.children;
        const allContextVars = this.props.renderInstanceProps.contextVars.concat(this.props.injectedContextVars);
        for (const contextVar of this.props.injectedContextVars) {
            // Get context var exprs
            const contextVarExprs = _.flatten(getBlockTree(this.props.innerBlock, this.props.createBlock, allContextVars).map(cb => {
                const block = this.props.createBlock(cb.blockDef);
                return block.getContextVarExprs(contextVar, this.props.renderInstanceProps.widgetLibrary, this.props.renderInstanceProps.actionLibrary);
            }));
            const currentElem = elem;
            elem = (outerProps, loading, refreshing) => (React.createElement(ContextVarInjector, { injectedContextVar: contextVar, schema: this.props.schema, database: this.props.database, value: this.props.injectedContextVarValues[contextVar.id], renderInstanceProps: outerProps, contextVarExprs: contextVarExprs }, (renderProps, innerLoading, innerRefreshing) => currentElem(renderProps, innerLoading || loading, innerRefreshing || refreshing)));
        }
        return elem(this.props.renderInstanceProps, false, false);
    }
}
//# sourceMappingURL=ContextVarsInjector.js.map