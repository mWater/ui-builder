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
const _ = __importStar(require("lodash"));
const React = __importStar(require("react"));
const actions_1 = require("../actions");
const propertyEditors_1 = require("../propertyEditors");
const bootstrap_1 = require("react-library/lib/bootstrap");
const immer_1 = __importDefault(require("immer"));
class OpenPageAction extends actions_1.Action {
    validate(options) {
        // Find widget
        if (!this.actionDef.widgetId) {
            return "Widget required";
        }
        // Ensure that widget exists 
        const widget = options.widgetLibrary.widgets[this.actionDef.widgetId];
        if (!widget) {
            return "Invalid widget";
        }
        // Ensure that all context variables are correctly mapped
        for (const widgetCV of widget.contextVars) {
            // Allow unmapped variables
            if (!this.actionDef.contextVarValues[widgetCV.id]) {
                continue;
            }
            // Ensure that mapping is to available context var
            const srcCV = options.contextVars.find(cv => cv.id === this.actionDef.contextVarValues[widgetCV.id].contextVarId);
            if (!srcCV || srcCV.table !== widgetCV.table || srcCV.type !== widgetCV.type) {
                return "Invalid context variable";
            }
        }
        return null;
    }
    performAction(options) {
        const contextVarValues = {};
        // Perform mappings TODO test
        for (const cvid of Object.keys(this.actionDef.contextVarValues)) {
            contextVarValues[cvid] = options.contextVarValues[this.actionDef.contextVarValues[cvid].contextVarId];
        }
        options.pageStack.openPage({
            type: this.actionDef.pageType,
            database: options.database,
            widgetId: this.actionDef.widgetId,
            contextVarValues: contextVarValues
        });
        return Promise.resolve();
    }
    /** Render an optional property editor for the action. This may use bootstrap */
    renderEditor(props) {
        // Create widget options 
        const widgetOptions = _.sortBy(Object.values(props.widgetLibrary.widgets).map(w => ({ label: w.name, value: w.id })), "name");
        const actionDef = this.actionDef;
        const handleWidgetIdChange = (widgetId) => {
            props.onChange(Object.assign({}, actionDef, { widgetId: widgetId, contextVarValues: {} }));
        };
        const widgetDef = actionDef.widgetId ? props.widgetLibrary.widgets[actionDef.widgetId] : null;
        const renderContextVarValues = () => {
            if (!widgetDef) {
                return null;
            }
            return (React.createElement("table", { className: "table table-bordered table-condensed" },
                React.createElement("tbody", null, widgetDef.contextVars.map(contextVar => {
                    const cvr = actionDef.contextVarValues[contextVar.id];
                    const handleCVRChange = (contextVarId) => {
                        props.onChange(immer_1.default(actionDef, (draft) => {
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
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.actionDef, onChange: props.onChange, property: "pageType" }, (value, onChange) => React.createElement(bootstrap_1.Select, { value: value, onChange: onChange, options: [{ value: "normal", label: "Normal" }, { value: "modal", label: "Modal" }] }))),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Page Widget" },
                React.createElement(bootstrap_1.Select, { value: actionDef.widgetId, onChange: handleWidgetIdChange, options: widgetOptions, nullLabel: "Select Widget" })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Variables" }, renderContextVarValues())));
    }
}
exports.OpenPageAction = OpenPageAction;
//# sourceMappingURL=openPage.js.map