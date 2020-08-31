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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapObjectTree = exports.WidgetBlock = void 0;
var React = __importStar(require("react"));
var _ = __importStar(require("lodash"));
var LeafBlock_1 = __importDefault(require("../LeafBlock"));
var blocks_1 = require("../blocks");
var BlockPlaceholder_1 = __importDefault(require("../BlockPlaceholder"));
var propertyEditors_1 = require("../propertyEditors");
var bootstrap_1 = require("react-library/lib/bootstrap");
var immer_1 = __importDefault(require("immer"));
var ContextVarsInjector_1 = __importDefault(require("../ContextVarsInjector"));
var WidgetBlock = /** @class */ (function (_super) {
    __extends(WidgetBlock, _super);
    function WidgetBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    WidgetBlock.prototype.validate = function (options) {
        var _this = this;
        if (!this.blockDef.widgetId) {
            return "Widget required";
        }
        // Ensure that widget exists 
        var widget = options.widgetLibrary.widgets[this.blockDef.widgetId];
        if (!widget) {
            return "Invalid widget";
        }
        var _loop_1 = function (internalContextVarId) {
            if (!options.contextVars.find(function (cv) { return cv.id === _this.blockDef.contextVarMap[internalContextVarId]; })) {
                return { value: "Missing context variable in mapping" };
            }
        };
        // Ensure that all context variables exist
        for (var _i = 0, _a = Object.keys(this.blockDef.contextVarMap); _i < _a.length; _i++) {
            var internalContextVarId = _a[_i];
            var state_1 = _loop_1(internalContextVarId);
            if (typeof state_1 === "object")
                return state_1.value;
        }
        return null;
    };
    WidgetBlock.prototype.getInitialFilters = function (contextVarId, instanceCtx) {
        var widgetDef = instanceCtx.widgetLibrary.widgets[this.blockDef.widgetId];
        if (widgetDef && widgetDef.blockDef) {
            var innerBlock = instanceCtx.createBlock(widgetDef.blockDef);
            // Map contextVarId to internal id
            for (var _i = 0, _a = Object.keys(this.blockDef.contextVarMap); _i < _a.length; _i++) {
                var key = _a[_i];
                var value = this.blockDef.contextVarMap[key];
                if (value === contextVarId) {
                    return innerBlock.getInitialFilters(key, instanceCtx);
                }
            }
        }
        return [];
    };
    WidgetBlock.prototype.getContextVarExprs = function (contextVar, ctx) {
        var _this = this;
        if (!this.blockDef.widgetId) {
            return [];
        }
        // Get inner widget
        var widgetDef = ctx.widgetLibrary.widgets[this.blockDef.widgetId];
        if (!widgetDef.blockDef) {
            return [];
        }
        // Map context variable
        var innerContextVar = widgetDef.contextVars.find(function (cv) { return contextVar.id === _this.blockDef.contextVarMap[cv.id]; });
        if (!innerContextVar) {
            // Check if global variable
            if ((ctx.globalContextVars || []).find(function (cv) { return cv.id == contextVar.id; })) {
                // Pass it straight through
                innerContextVar = contextVar;
            }
            else {
                return [];
            }
        }
        // Get complete context variables exprs of inner widget blocks
        var contextVarExprs = ctx.createBlock(widgetDef.blockDef).getSubtreeContextVarExprs(innerContextVar, __assign(__assign({}, ctx), { contextVars: widgetDef.contextVars }));
        // Map any variables of expressions that cross widget boundary
        contextVarExprs = contextVarExprs.map(function (cve) { return _this.mapInnerToOuterVariables(cve); });
        return contextVarExprs;
    };
    /** Maps variables in an expression from inner variable names to outer ones */
    WidgetBlock.prototype.mapInnerToOuterVariables = function (expr) {
        var _this = this;
        return exports.mapObjectTree(expr, function (e) {
            if (e.type === "variable") {
                // Change inner id to outer id
                if (_this.blockDef.contextVarMap[e.variableId]) {
                    return __assign(__assign({}, e), { variableId: _this.blockDef.contextVarMap[e.variableId] });
                }
                else {
                    return e;
                }
            }
            else {
                return e;
            }
        });
    };
    /** Maps variables in an expression from outer variable names to inner ones */
    WidgetBlock.prototype.mapOuterToInnerVariables = function (expr) {
        var _this = this;
        return exports.mapObjectTree(expr, function (e) {
            if (e.type === "variable") {
                // Change outer id to inner id
                for (var key in _this.blockDef.contextVarMap) {
                    if (_this.blockDef.contextVarMap[key] == e.variableId) {
                        return __assign(__assign({}, e), { variableId: key });
                    }
                }
                return e;
            }
            else {
                return e;
            }
        });
    };
    WidgetBlock.prototype.renderDesign = function (props) {
        if (!this.blockDef.widgetId) {
            return React.createElement("div", { style: { fontStyle: "italic" } }, "Select widget...");
        }
        // Find the widget
        var widgetDef = props.widgetLibrary.widgets[this.blockDef.widgetId];
        if (widgetDef && widgetDef.blockDef) {
            var innerBlock = props.createBlock(widgetDef.blockDef);
            var innerContextVars = (props.globalContextVars || [])
                .concat(widgetDef.contextVars)
                .concat(widgetDef.privateContextVars || []);
            // Create props for rendering inner block
            var innerProps = __assign(__assign({}, props), { selectedId: null, contextVars: innerContextVars, store: new blocks_1.NullBlockStore(), blockPaletteEntries: [], renderChildBlock: function (childProps, childBlockDef) {
                    if (childBlockDef) {
                        var childBlock = props.createBlock(childBlockDef);
                        return childBlock.renderDesign(childProps);
                    }
                    else {
                        return React.createElement(BlockPlaceholder_1.default, null);
                    }
                } });
            return (React.createElement("div", null,
                innerBlock.renderDesign(innerProps),
                React.createElement("div", { style: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0 } })));
        }
        else { // Handle case of widget with null block
            return React.createElement("div", null);
        }
    };
    WidgetBlock.prototype.renderInstance = function (instanceCtx) {
        var _this = this;
        // Map context var values
        var mappedContextVarValues = {};
        for (var _i = 0, _a = Object.keys(this.blockDef.contextVarMap); _i < _a.length; _i++) {
            var innerContextVarId = _a[_i];
            var outerContextVarId = this.blockDef.contextVarMap[innerContextVarId];
            if (outerContextVarId) {
                mappedContextVarValues[innerContextVarId] = instanceCtx.contextVarValues[outerContextVarId];
            }
            else {
                mappedContextVarValues[innerContextVarId] = null;
            }
        }
        // Include global context variables
        for (var _b = 0, _c = instanceCtx.globalContextVars || []; _b < _c.length; _b++) {
            var globalContextVar = _c[_b];
            mappedContextVarValues[globalContextVar.id] = instanceCtx.contextVarValues[globalContextVar.id];
        }
        // Find the widget
        var widgetDef = instanceCtx.widgetLibrary.widgets[this.blockDef.widgetId];
        if (widgetDef && widgetDef.blockDef) {
            var innerBlock_1 = instanceCtx.createBlock(widgetDef.blockDef);
            // Include outer context variables, even though widget does not technically need them
            // They are included as the widget might receive expressions such as rowsets that reference
            // variables that are only present in the outer scope.
            var innerContextVars = (instanceCtx.globalContextVars || [])
                .concat(instanceCtx.contextVars)
                .concat(widgetDef.contextVars);
            var innerContextVarValues = __assign(__assign(__assign({}, instanceCtx.contextVarValues), mappedContextVarValues), widgetDef.privateContextVarValues || {});
            var innerInstanceCtx = __assign(__assign({}, instanceCtx), { contextVars: innerContextVars, contextVarValues: innerContextVarValues, getContextVarExprValue: function (contextVarId, expr) {
                    // Lookup outer id
                    var outerContextVarId = _this.blockDef.contextVarMap[contextVarId];
                    if (outerContextVarId) {
                        // Map variable from inner to outer
                        return instanceCtx.getContextVarExprValue(outerContextVarId, _this.mapInnerToOuterVariables(expr));
                    }
                    else {
                        // If global variable, pass through
                        if ((instanceCtx.globalContextVars || []).find(function (cv) { return cv.id == contextVarId; })) {
                            return instanceCtx.getContextVarExprValue(contextVarId, expr);
                        }
                        return;
                    }
                }, onSelectContextVar: function (contextVarId, primaryKey) {
                    // Lookup outer id
                    var outerContextVarId = _this.blockDef.contextVarMap[contextVarId];
                    if (outerContextVarId) {
                        instanceCtx.onSelectContextVar(outerContextVarId, primaryKey);
                    }
                }, setFilter: function (contextVarId, filter) {
                    // Lookup outer id
                    var outerContextVarId = _this.blockDef.contextVarMap[contextVarId];
                    if (outerContextVarId) {
                        instanceCtx.setFilter(outerContextVarId, __assign(__assign({}, filter), { expr: _this.mapInnerToOuterVariables(filter.expr) }));
                    }
                }, getFilters: function (contextVarId) {
                    // Lookup outer id, mapping any variables
                    var outerContextVarId = _this.blockDef.contextVarMap[contextVarId];
                    if (outerContextVarId) {
                        return instanceCtx.getFilters(outerContextVarId).map(function (f) { return (__assign(__assign({}, f), { expr: _this.mapOuterToInnerVariables(f.expr) })); });
                    }
                    return [];
                } });
            // Inject private context vars
            return React.createElement(ContextVarsInjector_1.default, { instanceCtx: innerInstanceCtx, innerBlock: widgetDef.blockDef, injectedContextVars: widgetDef.privateContextVars || [], injectedContextVarValues: widgetDef.privateContextVarValues || {} }, function (instanceCtx, loading, refreshing) {
                if (loading) {
                    return React.createElement("div", { style: { color: "#AAA", fontSize: 18, textAlign: "center" } },
                        React.createElement("i", { className: "fa fa-circle-o-notch fa-spin" }));
                }
                return (React.createElement("div", { style: { opacity: refreshing ? 0.6 : undefined } }, innerBlock_1.renderInstance(instanceCtx)));
            });
        }
        else { // Handle case of widget with null block
            return React.createElement("div", null);
        }
    };
    WidgetBlock.prototype.renderEditor = function (props) {
        var _this = this;
        // Create widget options 
        var widgetOptions = _.sortBy(Object.values(props.widgetLibrary.widgets).map(function (w) { return ({ label: w.name, value: w.id }); }), "label");
        var handleWidgetIdChange = function (widgetId) {
            props.store.replaceBlock(__assign(__assign({}, _this.blockDef), { widgetId: widgetId, contextVarMap: {} }));
        };
        var renderContextVarValues = function () {
            if (!_this.blockDef.widgetId) {
                return null;
            }
            // Find the widget
            var widgetDef = props.widgetLibrary.widgets[_this.blockDef.widgetId];
            if (!widgetDef) {
                return null;
            }
            return (React.createElement("table", { className: "table table-bordered table-condensed" },
                React.createElement("tbody", null, widgetDef.contextVars.map(function (contextVar) {
                    var cv = _this.blockDef.contextVarMap[contextVar.id];
                    var handleCVChange = function (contextVarId) {
                        props.store.replaceBlock(immer_1.default(_this.blockDef, function (draft) {
                            draft.contextVarMap[contextVar.id] = contextVarId;
                        }));
                    };
                    return (React.createElement("tr", { key: contextVar.id },
                        React.createElement("td", { key: "name" }, contextVar.name),
                        React.createElement("td", { key: "value" },
                            React.createElement(propertyEditors_1.ContextVarPropertyEditor, { contextVars: props.contextVars, types: [contextVar.type], table: contextVar.table, value: cv, onChange: handleCVChange }))));
                }))));
        };
        return React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Widget" },
                React.createElement(bootstrap_1.Select, { value: this.blockDef.widgetId, onChange: handleWidgetIdChange, options: widgetOptions, nullLabel: "Select Widget" })),
            renderContextVarValues());
    };
    return WidgetBlock;
}(LeafBlock_1.default));
exports.WidgetBlock = WidgetBlock;
// Run a possibly deep object through a mapping function. Automatically maps all values of objects and arrays recursively
exports.mapObjectTree = function (obj, mapping) {
    // If array, map items
    if (_.isArray(obj)) {
        return obj.map(function (elem) { return exports.mapObjectTree(elem, mapping); });
    }
    if (_.isObject(obj)) {
        // First map object itself
        var res = mapping(obj);
        // Then map values
        return _.mapValues(res, function (value) { return exports.mapObjectTree(value, mapping); });
    }
    return obj;
};
