"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
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
var OpenPageAction = /** @class */ (function (_super) {
    __extends(OpenPageAction, _super);
    function OpenPageAction() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    OpenPageAction.prototype.validate = function (options) {
        var _this = this;
        // Find widget
        if (!this.actionDef.widgetId) {
            return "Widget required";
        }
        // Ensure that widget exists 
        var widget = options.widgetLibrary.widgets[this.actionDef.widgetId];
        if (!widget) {
            return "Invalid widget";
        }
        var _loop_1 = function (widgetCV) {
            // Allow unmapped variables
            if (!this_1.actionDef.contextVarValues[widgetCV.id]) {
                return "continue";
            }
            // Ensure that mapping is to available context var
            var srcCV = options.contextVars.find(function (cv) { return cv.id === _this.actionDef.contextVarValues[widgetCV.id].contextVarId; });
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
        return null;
    };
    OpenPageAction.prototype.performAction = function (options) {
        var contextVarValues = {};
        // Perform mappings TODO test
        for (var _i = 0, _a = Object.keys(this.actionDef.contextVarValues); _i < _a.length; _i++) {
            var cvid = _a[_i];
            contextVarValues[cvid] = options.contextVarValues[this.actionDef.contextVarValues[cvid].contextVarId];
        }
        options.pageStack.openPage({
            type: this.actionDef.pageType,
            database: options.database,
            widgetId: this.actionDef.widgetId,
            contextVarValues: contextVarValues
        });
        return Promise.resolve();
    };
    /** Render an optional property editor for the action. This may use bootstrap */
    OpenPageAction.prototype.renderEditor = function (props) {
        // Create widget options 
        var widgetOptions = _.sortBy(Object.values(props.widgetLibrary.widgets).map(function (w) { return ({ label: w.name, value: w.id }); }), "name");
        var actionDef = this.actionDef;
        var handleWidgetIdChange = function (widgetId) {
            props.onChange(__assign({}, actionDef, { widgetId: widgetId, contextVarValues: {} }));
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
                            React.createElement(propertyEditors_1.ContextVarPropertyEditor, { contextVars: props.contextVars, types: [contextVar.type], table: contextVar.table, value: cvr ? cvr.contextVarId : null, onChange: handleCVRChange }))));
                }))));
        };
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Page Type" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.actionDef, onChange: props.onChange, property: "pageType" }, function (value, onChange) { return React.createElement(bootstrap_1.Select, { value: value, onChange: onChange, options: [{ value: "normal", label: "Normal" }, { value: "modal", label: "Modal" }] }); })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Page Widget" },
                React.createElement(bootstrap_1.Select, { value: actionDef.widgetId, onChange: handleWidgetIdChange, options: widgetOptions, nullLabel: "Select Widget" })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Variables" }, renderContextVarValues())));
    };
    return OpenPageAction;
}(actions_1.Action));
exports.OpenPageAction = OpenPageAction;
//# sourceMappingURL=openPage.js.map