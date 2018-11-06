import * as _ from 'lodash';
import * as React from 'react';
import { Action } from '../actions';
import { LabeledProperty, PropertyEditor, ContextVarPropertyEditor } from '../propertyEditors';
import { Select } from 'react-library/lib/bootstrap';
import produce from 'immer';
export class OpenPageAction extends Action {
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
                        props.onChange(produce(actionDef, (draft) => {
                            draft.contextVarValues[contextVar.id] = { type: "ref", contextVarId: contextVarId };
                        }));
                    };
                    return (React.createElement("tr", { key: contextVar.id },
                        React.createElement("td", null, contextVar.name),
                        React.createElement("td", null,
                            React.createElement(ContextVarPropertyEditor, { contextVars: props.contextVars, types: [contextVar.type], table: contextVar.table, value: cvr ? cvr.contextVarId : null, onChange: handleCVRChange }))));
                }))));
        };
        return (React.createElement("div", null,
            React.createElement(LabeledProperty, { label: "Page Type" },
                React.createElement(PropertyEditor, { obj: this.actionDef, onChange: props.onChange, property: "pageType" }, (value, onChange) => React.createElement(Select, { value: value, onChange: onChange, options: [{ value: "normal", label: "Normal" }, { value: "modal", label: "Modal" }] }))),
            React.createElement(LabeledProperty, { label: "Page Widget" },
                React.createElement(Select, { value: actionDef.widgetId, onChange: handleWidgetIdChange, options: widgetOptions, nullLabel: "Select Widget" })),
            React.createElement(LabeledProperty, { label: "Variables" }, renderContextVarValues())));
    }
}
//# sourceMappingURL=openPage.js.map