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
var _ = __importStar(require("lodash"));
var LeafBlock_1 = __importDefault(require("../LeafBlock"));
var blocks_1 = require("../blocks");
var BlockPlaceholder_1 = __importDefault(require("../BlockPlaceholder"));
var propertyEditors_1 = require("../propertyEditors");
var bootstrap_1 = require("react-library/lib/bootstrap");
var immer_1 = __importDefault(require("immer"));
var WidgetBlock = /** @class */ (function (_super) {
    __extends(WidgetBlock, _super);
    function WidgetBlock(blockDef, createBlock) {
        var _this = _super.call(this, blockDef) || this;
        _this.createBlock = createBlock;
        return _this;
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
    WidgetBlock.prototype.getInitialFilters = function (contextVarId, widgetLibrary) {
        var widgetDef = widgetLibrary.widgets[this.blockDef.widgetId];
        if (widgetDef && widgetDef.blockDef) {
            var innerBlock = this.createBlock(widgetDef.blockDef);
            // Map contextVarId to internal id
            for (var _i = 0, _a = Object.keys(this.blockDef.contextVarMap); _i < _a.length; _i++) {
                var key = _a[_i];
                var value = this.blockDef.contextVarMap[key];
                if (value === contextVarId) {
                    return innerBlock.getInitialFilters(key, widgetLibrary);
                }
            }
        }
        return [];
    };
    WidgetBlock.prototype.getContextVarExprs = function (contextVar, widgetLibrary, actionLibrary) {
        var _this = this;
        if (!this.blockDef.widgetId) {
            return [];
        }
        // Get inner widget
        var widgetDef = widgetLibrary.widgets[this.blockDef.widgetId];
        if (!widgetDef.blockDef) {
            return [];
        }
        // Map context variable
        var innerContextVar = widgetDef.contextVars.find(function (cv) { return contextVar.id === _this.blockDef.contextVarMap[cv.id]; });
        if (!innerContextVar) {
            return [];
        }
        // Get complete context variables exprs of inner widget blocks
        var contextVarExprs = _.flatten(blocks_1.getBlockTree(widgetDef.blockDef, this.createBlock, widgetDef.contextVars).map(function (cb) {
            var block = _this.createBlock(cb.blockDef);
            return block.getContextVarExprs(innerContextVar, widgetLibrary, actionLibrary);
        }));
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
    WidgetBlock.prototype.renderDesign = function (props) {
        var _this = this;
        if (!this.blockDef.widgetId) {
            return React.createElement("div", { style: { fontStyle: "italic" } }, "Select widget...");
        }
        // Find the widget
        var widgetDef = props.widgetLibrary.widgets[this.blockDef.widgetId];
        if (widgetDef && widgetDef.blockDef) {
            var innerBlock = this.createBlock(widgetDef.blockDef);
            // Create props for rendering inner block
            var innerProps = {
                schema: props.schema,
                dataSource: props.dataSource,
                selectedId: null,
                locale: props.locale,
                contextVars: widgetDef.contextVars,
                widgetLibrary: props.widgetLibrary,
                store: new blocks_1.NullBlockStore(),
                blockPaletteEntries: [],
                renderChildBlock: function (childProps, childBlockDef) {
                    if (childBlockDef) {
                        var childBlock = _this.createBlock(childBlockDef);
                        return childBlock.renderDesign(childProps);
                    }
                    else {
                        return React.createElement(BlockPlaceholder_1.default, null);
                    }
                },
            };
            return (React.createElement("div", null,
                innerBlock.renderDesign(innerProps),
                React.createElement("div", { style: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0 } })));
        }
        else { // Handle case of widget with null block
            return React.createElement("div", null);
        }
    };
    WidgetBlock.prototype.renderInstance = function (props) {
        var _this = this;
        // Map context var values
        var mappedContextVarValues = {};
        for (var _i = 0, _a = Object.keys(this.blockDef.contextVarMap); _i < _a.length; _i++) {
            var innerContextVarId = _a[_i];
            var outerContextVarId = this.blockDef.contextVarMap[innerContextVarId];
            if (outerContextVarId) {
                mappedContextVarValues[innerContextVarId] = props.contextVarValues[outerContextVarId];
            }
            else {
                mappedContextVarValues[innerContextVarId] = null;
            }
        }
        // Find the widget
        var widgetDef = props.widgetLibrary.widgets[this.blockDef.widgetId];
        if (widgetDef && widgetDef.blockDef) {
            var innerBlock = this.createBlock(widgetDef.blockDef);
            var innerProps = __assign(__assign({}, props), { contextVars: props.contextVars.concat(widgetDef.contextVars), contextVarValues: __assign(__assign({}, props.contextVarValues), mappedContextVarValues), getContextVarExprValue: function (contextVarId, expr) {
                    // Lookup outer id
                    var outerContextVarId = _this.blockDef.contextVarMap[contextVarId];
                    if (outerContextVarId) {
                        // Map variable from inner to outer
                        return props.getContextVarExprValue(outerContextVarId, _this.mapInnerToOuterVariables(expr));
                    }
                    else {
                        return;
                    }
                }, onSelectContextVar: function (contextVarId, primaryKey) {
                    // Lookup outer id
                    var outerContextVarId = _this.blockDef.contextVarMap[contextVarId];
                    if (outerContextVarId) {
                        props.onSelectContextVar(outerContextVarId, primaryKey);
                    }
                }, setFilter: function (contextVarId, filter) {
                    // Lookup outer id
                    var outerContextVarId = _this.blockDef.contextVarMap[contextVarId];
                    if (outerContextVarId) {
                        props.setFilter(outerContextVarId, filter);
                    }
                }, getFilters: function (contextVarId) {
                    // Lookup outer id
                    var outerContextVarId = _this.blockDef.contextVarMap[contextVarId];
                    if (outerContextVarId) {
                        return props.getFilters(outerContextVarId);
                    }
                    return [];
                } });
            return innerBlock.renderInstance(innerProps);
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
            props.onChange(__assign(__assign({}, _this.blockDef), { widgetId: widgetId, contextVarMap: {} }));
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
                        props.onChange(immer_1.default(_this.blockDef, function (draft) {
                            draft.contextVarMap[contextVar.id] = contextVarId;
                        }));
                    };
                    return (React.createElement("tr", { key: contextVar.id },
                        React.createElement("td", null, contextVar.name),
                        React.createElement("td", null,
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
