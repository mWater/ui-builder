"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const blocks_1 = require("./blocks");
const React = __importStar(require("react"));
const ContextVarInjector_1 = __importDefault(require("./ContextVarInjector"));
const _ = __importStar(require("lodash"));
/** Injects one or more context variables into the inner render instance props.
 * Holds state of the filters that are applied to rowset.
 * Computes values of expressions
 */
class ContextVarsInjector extends React.Component {
    render() {
        // Wrap once per child
        let elem = this.props.children;
        const allContextVars = this.props.renderInstanceProps.contextVars.concat(this.props.injectedContextVars);
        for (const contextVar of this.props.injectedContextVars) {
            // Get context var exprs
            const contextVarExprs = _.flatten(blocks_1.getBlockTree(this.props.innerBlock, this.props.createBlock, allContextVars).map(cb => {
                const block = this.props.createBlock(cb.blockDef);
                return block.getContextVarExprs(contextVar, this.props.renderInstanceProps.widgetLibrary, this.props.renderInstanceProps.actionLibrary);
            }));
            const currentElem = elem;
            elem = (outerProps, loading, refreshing) => (React.createElement(ContextVarInjector_1.default, { injectedContextVar: contextVar, schema: this.props.schema, database: this.props.database, value: this.props.injectedContextVarValues[contextVar.id], renderInstanceProps: outerProps, contextVarExprs: contextVarExprs }, (renderProps, innerLoading, innerRefreshing) => currentElem(renderProps, innerLoading || loading, innerRefreshing || refreshing)));
        }
        return elem(Object.assign({}, this.props.renderInstanceProps, { database: this.props.database }), false, false);
    }
}
exports.default = ContextVarsInjector;
//# sourceMappingURL=ContextVarsInjector.js.map