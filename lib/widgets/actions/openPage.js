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
var _ = __importStar(require("lodash"));
var React = __importStar(require("react"));
var actions_1 = require("../actions");
var propertyEditors_1 = require("../propertyEditors");
var bootstrap_1 = require("react-library/lib/bootstrap");
var immer_1 = __importDefault(require("immer"));
var embeddedExprs_1 = require("../../embeddedExprs");
var localization_1 = require("../localization");
var OpenPageAction = /** @class */ (function (_super) {
    __extends(OpenPageAction, _super);
    function OpenPageAction() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    OpenPageAction.prototype.validate = function (designCtx) {
        var _this = this;
        // Find widget
        if (!this.actionDef.widgetId) {
            return "Widget required";
        }
        // Ensure that widget exists 
        var widget = designCtx.widgetLibrary.widgets[this.actionDef.widgetId];
        if (!widget) {
            return "Invalid widget";
        }
        var _loop_1 = function (widgetCV) {
            // Don't allow unmapped variables
            if (!this_1.actionDef.contextVarValues[widgetCV.id]) {
                return { value: "Missing variable mapping" };
            }
            // Ensure that mapping is to available context var
            var srcCV = designCtx.contextVars.find(function (cv) { return cv.id === _this.actionDef.contextVarValues[widgetCV.id].contextVarId; });
            if (!srcCV || srcCV.table !== widgetCV.table || srcCV.type !== widgetCV.type) {
                return { value: "Invalid context variable" };
            }
        };
        var this_1 = this;
        // Ensure that all context variables are correctly mapped
        for (var _i = 0, _a = widget.contextVars; _i < _a.length; _i++) {
            var widgetCV = _a[_i];
            var state_1 = _loop_1(widgetCV);
            if (typeof state_1 === "object")
                return state_1.value;
        }
        // Validate expressions
        var err = embeddedExprs_1.validateEmbeddedExprs({
            embeddedExprs: this.actionDef.titleEmbeddedExprs || [],
            schema: designCtx.schema,
            contextVars: designCtx.contextVars
        });
        if (err) {
            return err;
        }
        return null;
    };
    /** Get any context variables expressions that this action needs */
    OpenPageAction.prototype.getContextVarExprs = function (contextVar) {
        if (this.actionDef.titleEmbeddedExprs) {
            return _.compact(_.map(this.actionDef.titleEmbeddedExprs, function (ee) { return ee.contextVarId === contextVar.id ? ee.expr : null; }));
        }
        return [];
    };
    OpenPageAction.prototype.performAction = function (instanceCtx) {
        var _this = this;
        var contextVarValues = {};
        var _loop_2 = function (cvid) {
            // Look up outer context variable
            var outerCV = instanceCtx.contextVars.find(function (cv) { return cv.id == _this.actionDef.contextVarValues[cvid].contextVarId; });
            if (!outerCV) {
                throw new Error("Outer context variable not found");
            }
            // Get value 
            var outerCVValue = instanceCtx.contextVarValues[outerCV.id];
            // Add filters if rowset
            if (outerCV.type == "rowset") {
                outerCVValue = {
                    type: "op",
                    op: "and",
                    table: outerCV.table,
                    exprs: _.compact([outerCVValue].concat(_.map(instanceCtx.getFilters(outerCV.id), function (f) { return f.expr; })))
                };
            }
            contextVarValues[cvid] = outerCVValue;
        };
        // Perform mappings 
        for (var _i = 0, _a = Object.keys(this.actionDef.contextVarValues); _i < _a.length; _i++) {
            var cvid = _a[_i];
            _loop_2(cvid);
        }
        // Get title
        var title = localization_1.localize(this.actionDef.title, instanceCtx.locale);
        if (title) {
            // Get any embedded expression values
            var exprValues = _.map(this.actionDef.titleEmbeddedExprs || [], function (ee) { return instanceCtx.getContextVarExprValue(ee.contextVarId, ee.expr); });
            // Format and replace
            title = embeddedExprs_1.formatEmbeddedExprString({
                text: title,
                embeddedExprs: this.actionDef.titleEmbeddedExprs || [],
                exprValues: exprValues,
                schema: instanceCtx.schema,
                contextVars: instanceCtx.contextVars,
                locale: instanceCtx.locale
            });
        }
        instanceCtx.pageStack.openPage({
            type: this.actionDef.pageType,
            database: instanceCtx.database,
            widgetId: this.actionDef.widgetId,
            contextVarValues: contextVarValues,
            title: title
        });
        return Promise.resolve();
    };
    /** Render an optional property editor for the action. This may use bootstrap */
    OpenPageAction.prototype.renderEditor = function (props) {
        // Create widget options 
        var widgetOptions = _.sortBy(Object.values(props.widgetLibrary.widgets).map(function (w) { return ({ label: w.name, value: w.id }); }), "label");
        var actionDef = this.actionDef;
        var handleWidgetIdChange = function (widgetId) {
            props.onChange(__assign(__assign({}, actionDef), { widgetId: widgetId, contextVarValues: {} }));
        };
        var widgetDef = actionDef.widgetId ? props.widgetLibrary.widgets[actionDef.widgetId] : null;
        var renderContextVarValues = function () {
            if (!widgetDef) {
                return null;
            }
            return (React.createElement("table", { className: "table table-bordered table-condensed" },
                React.createElement("tbody", null, widgetDef.contextVars.map(function (contextVar) {
                    var cvr = actionDef.contextVarValues[contextVar.id];
                    var handleCVRChange = function (contextVarId) {
                        props.onChange(immer_1.default(actionDef, function (draft) {
                            draft.contextVarValues[contextVar.id] = { type: "ref", contextVarId: contextVarId };
                        }));
                    };
                    return (React.createElement("tr", { key: contextVar.id },
                        React.createElement("td", null, contextVar.name),
                        React.createElement("td", null,
                            React.createElement(propertyEditors_1.ContextVarPropertyEditor, { contextVars: props.contextVars, types: [contextVar.type], table: contextVar.table, value: cvr ? cvr.contextVarId : null, onChange: handleCVRChange }),
                            !cvr ? React.createElement("span", { className: "text-warning" }, "Value not set") : null)));
                }))));
        };
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Page Type" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.actionDef, onChange: props.onChange, property: "pageType" }, function (value, onChange) { return React.createElement(bootstrap_1.Select, { value: value, onChange: onChange, options: [{ value: "normal", label: "Normal" }, { value: "modal", label: "Modal" }] }); })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Page Widget" },
                React.createElement(bootstrap_1.Select, { value: actionDef.widgetId, onChange: handleWidgetIdChange, options: widgetOptions, nullLabel: "Select Widget" })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Variables" }, renderContextVarValues()),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Page Title" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.actionDef, onChange: props.onChange, property: "title" }, function (value, onChange) {
                    return React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale });
                })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Page Title embedded expressions", help: "Reference in text as {0}, {1}, etc." },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.actionDef, onChange: props.onChange, property: "titleEmbeddedExprs" }, function (value, onChange) { return (React.createElement(propertyEditors_1.EmbeddedExprsEditor, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, contextVars: props.contextVars })); }))));
    };
    return OpenPageAction;
}(actions_1.Action));
exports.OpenPageAction = OpenPageAction;
