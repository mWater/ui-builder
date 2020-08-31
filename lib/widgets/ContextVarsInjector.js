"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var React = __importStar(require("react"));
var ContextVarInjector_1 = __importDefault(require("./ContextVarInjector"));
/** Injects one or more context variables into the inner render instance props.
 * Holds state of the filters that are applied to rowset.
 * Computes values of expressions
 */
var ContextVarsInjector = /** @class */ (function (_super) {
    __extends(ContextVarsInjector, _super);
    function ContextVarsInjector() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ContextVarsInjector.prototype.render = function () {
        var _this = this;
        // Wrap once per child
        var elem = this.props.children;
        var allContextVars = this.props.instanceCtx.contextVars.concat(this.props.injectedContextVars);
        // Do in reverse order, as the inner most one is done first
        var reverseInjectedContextVars = this.props.injectedContextVars.slice().reverse();
        var _loop_1 = function (contextVar) {
            var innerBlock = this_1.props.innerBlock ? this_1.props.instanceCtx.createBlock(this_1.props.innerBlock) : null;
            // Get context var exprs
            var contextVarExprs = innerBlock ? innerBlock.getSubtreeContextVarExprs(contextVar, __assign(__assign({}, this_1.props.instanceCtx), { contextVars: allContextVars })) : [];
            var initialFilters = innerBlock ? innerBlock.getSubtreeInitialFilters(contextVar.id, __assign(__assign({}, this_1.props.instanceCtx), { contextVars: allContextVars })) : [];
            var currentElem = elem;
            elem = function (outerInstanceCtx, loading, refreshing) { return (React.createElement(ContextVarInjector_1.default, { injectedContextVar: contextVar, value: _this.props.injectedContextVarValues[contextVar.id], instanceCtx: outerInstanceCtx, initialFilters: initialFilters, contextVarExprs: contextVarExprs }, function (renderProps, innerLoading, innerRefreshing) { return currentElem(renderProps, innerLoading || loading, innerRefreshing || refreshing); })); };
        };
        var this_1 = this;
        for (var _i = 0, reverseInjectedContextVars_1 = reverseInjectedContextVars; _i < reverseInjectedContextVars_1.length; _i++) {
            var contextVar = reverseInjectedContextVars_1[_i];
            _loop_1(contextVar);
        }
        return elem(this.props.instanceCtx, false, false);
    };
    return ContextVarsInjector;
}(React.Component));
exports.default = ContextVarsInjector;
