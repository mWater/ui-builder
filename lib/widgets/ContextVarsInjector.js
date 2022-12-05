"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
const ContextVarInjector_1 = __importDefault(require("./ContextVarInjector"));
/** Injects one or more context variables into the inner render instance props.
 * Holds state of the filters that are applied to rowset.
 * Computes values of expressions
 */
class ContextVarsInjector extends React.Component {
    render() {
        // Wrap once per child
        let elem = this.props.children;
        const allContextVars = this.props.instanceCtx.contextVars.concat(this.props.injectedContextVars);
        // Do in reverse order, as the inner most one is done first
        const reverseInjectedContextVars = this.props.injectedContextVars.slice().reverse();
        for (const contextVar of reverseInjectedContextVars) {
            const innerBlock = this.props.innerBlock ? this.props.instanceCtx.createBlock(this.props.innerBlock) : null;
            // Get context var exprs
            const contextVarExprs = innerBlock
                ? innerBlock.getSubtreeContextVarExprs(contextVar, Object.assign(Object.assign({}, this.props.instanceCtx), { contextVars: allContextVars }))
                : [];
            const initialFilters = innerBlock
                ? innerBlock.getSubtreeInitialFilters(contextVar.id, Object.assign(Object.assign({}, this.props.instanceCtx), { contextVars: allContextVars }))
                : Promise.resolve([]);
            const currentElem = elem;
            elem = (outerInstanceCtx, loading, refreshing) => (React.createElement(ContextVarInjector_1.default, { injectedContextVar: contextVar, value: this.props.injectedContextVarValues[contextVar.id], instanceCtx: outerInstanceCtx, initialFilters: initialFilters, contextVarExprs: contextVarExprs }, (renderProps, innerLoading, innerRefreshing) => currentElem(renderProps, innerLoading || loading, innerRefreshing || refreshing)));
        }
        return elem(this.props.instanceCtx, false, false);
    }
}
exports.default = ContextVarsInjector;
