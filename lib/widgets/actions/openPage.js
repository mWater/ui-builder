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
exports.OpenPageAction = void 0;
var _ = __importStar(require("lodash"));
var React = __importStar(require("react"));
var actions_1 = require("../actions");
var propertyEditors_1 = require("../propertyEditors");
var bootstrap_1 = require("react-library/lib/bootstrap");
var immer_1 = __importDefault(require("immer"));
var mwater_expressions_1 = require("mwater-expressions");
var embeddedExprs_1 = require("../../embeddedExprs");
var blocks_1 = require("../blocks");
var localization_1 = require("../localization");
var OpenPageAction = /** @class */ (function (_super) {
    __extends(OpenPageAction, _super);
    function OpenPageAction() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    OpenPageAction.prototype.validate = function (designCtx) {
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
            var contextVarValue = this_1.actionDef.contextVarValues[widgetCV.id];
            if (contextVarValue.type == "ref") {
                var srcCV = designCtx.contextVars.find(function (cv) { return cv.id === contextVarValue.contextVarId; });
                if (!srcCV || srcCV.table !== widgetCV.table || srcCV.type !== widgetCV.type) {
                    return { value: "Invalid context variable" };
                }
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
        var contextVarValues = {};
        var _loop_2 = function (cvid) {
            var contextVarValue = this_2.actionDef.contextVarValues[cvid];
            if (contextVarValue.type == "ref") {
                // Look up outer context variable
                var outerCV = instanceCtx.contextVars.find(function (cv) { return cv.id == contextVarValue.contextVarId; });
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
                // Inline variables used in rowsets as they may depend on context variables that aren't present in new page
                if (outerCV.type == "rowset") {
                    outerCVValue = new mwater_expressions_1.ExprUtils(instanceCtx.schema, blocks_1.createExprVariables(instanceCtx.contextVars)).inlineVariableValues(outerCVValue, instanceCtx.contextVarValues);
                }
                contextVarValues[cvid] = outerCVValue;
            }
            else if (contextVarValue.type == "null") {
                contextVarValues[cvid] = null;
            }
        };
        var this_2 = this;
        // Perform mappings 
        for (var _i = 0, _a = Object.keys(this.actionDef.contextVarValues); _i < _a.length; _i++) {
            var cvid = _a[_i];
            _loop_2(cvid);
        }
        // Include global context variables
        for (var _b = 0, _c = instanceCtx.globalContextVars || []; _b < _c.length; _b++) {
            var globalContextVar = _c[_b];
            contextVarValues[globalContextVar.id] = instanceCtx.contextVarValues[globalContextVar.id];
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
                locale: instanceCtx.locale,
                formatLocale: instanceCtx.formatLocale
            });
        }
        var page = {
            type: this.actionDef.pageType,
            modalSize: this.actionDef.modalSize || "large",
            database: instanceCtx.database,
            widgetId: this.actionDef.widgetId,
            contextVarValues: contextVarValues,
            title: title
        };
        if (this.actionDef.replacePage) {
            instanceCtx.pageStack.replacePage(page);
        }
        else {
            instanceCtx.pageStack.openPage(page);
        }
        return Promise.resolve();
    };
    /** Render an optional property editor for the action. This may use bootstrap */
    OpenPageAction.prototype.renderEditor = function (props) {
        // Create widget options 
        var widgetOptions = _.sortBy(Object.values(props.widgetLibrary.widgets).map(function (w) { return ({ label: w.name, value: w.id }); }), "label");
        var actionDef = this.actionDef;
        var onChange = props.onChange;
        var handleWidgetIdChange = function (widgetId) {
            onChange(__assign(__assign({}, actionDef), { widgetId: widgetId, contextVarValues: {} }));
        };
        var widgetDef = actionDef.widgetId ? props.widgetLibrary.widgets[actionDef.widgetId] : null;
        var renderContextVarValues = function () {
            if (!widgetDef) {
                return null;
            }
            return (React.createElement("table", { className: "table table-bordered table-condensed" },
                React.createElement("tbody", null, widgetDef.contextVars.map(function (contextVar) {
                    var cvr = actionDef.contextVarValues[contextVar.id];
                    var handleCVRChange = function (cvr) {
                        props.onChange(immer_1.default(actionDef, function (draft) {
                            draft.contextVarValues[contextVar.id] = cvr;
                        }));
                    };
                    // Create options list
                    var options = [
                        { value: { type: "null" }, label: "No Value" }
                    ];
                    for (var _i = 0, _a = props.contextVars; _i < _a.length; _i++) {
                        var cv = _a[_i];
                        if (cv.type == contextVar.type && cv.table == contextVar.table) {
                            options.push({ value: { type: "ref", contextVarId: cv.id }, label: cv.name });
                        }
                    }
                    return (React.createElement("tr", { key: contextVar.id },
                        React.createElement("td", { key: "name" }, contextVar.name),
                        React.createElement("td", { key: "value" },
                            React.createElement(bootstrap_1.Select, { options: options, value: cvr, onChange: handleCVRChange, nullLabel: "Select..." }),
                            !cvr ? React.createElement("span", { className: "text-warning" }, "Value not set") : null)));
                }))));
        };
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Page Type" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.actionDef, onChange: onChange, property: "pageType" }, function (value, onChange) { return React.createElement(bootstrap_1.Toggle, { value: value, onChange: onChange, options: [{ value: "normal", label: "Normal" }, { value: "modal", label: "Modal" }] }); })),
            this.actionDef.pageType == "modal" ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Modal Size" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.actionDef, onChange: onChange, property: "modalSize" }, function (value, onChange) {
                        return React.createElement(bootstrap_1.Toggle, { value: value || "large", onChange: onChange, options: [
                                { value: "small", label: "Small" },
                                { value: "normal", label: "Normal" },
                                { value: "large", label: "Large" },
                                { value: "full", label: "Full-screen" }
                            ] });
                    }))
                : null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Page Widget" },
                React.createElement(bootstrap_1.Select, { value: actionDef.widgetId, onChange: handleWidgetIdChange, options: widgetOptions, nullLabel: "Select Widget" })),
            React.createElement(propertyEditors_1.PropertyEditor, { obj: this.actionDef, onChange: onChange, property: "replacePage" }, function (value, onChange) { return React.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange }, "Replace current page"); }),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Variables" }, renderContextVarValues()),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Page Title" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.actionDef, onChange: onChange, property: "title" }, function (value, onChange) {
                    return React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale });
                })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Page Title embedded expressions", help: "Reference in text as {0}, {1}, etc." },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.actionDef, onChange: onChange, property: "titleEmbeddedExprs" }, function (value, onChange) { return (React.createElement(propertyEditors_1.EmbeddedExprsEditor, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, contextVars: props.contextVars })); }))));
    };
    return OpenPageAction;
}(actions_1.Action));
exports.OpenPageAction = OpenPageAction;
