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
const React = __importStar(require("react"));
const LeafBlock_1 = __importDefault(require("../LeafBlock"));
const propertyEditors_1 = require("../propertyEditors");
const localization_1 = require("../localization");
const bootstrap_1 = require("react-library/lib/bootstrap");
class ButtonBlock extends LeafBlock_1.default {
    validate(options) {
        let error;
        // Validate action
        if (this.blockDef.actionDef) {
            const action = options.actionLibrary.createAction(this.blockDef.actionDef);
            error = action.validate({
                schema: options.schema,
                contextVars: options.contextVars,
                widgetLibrary: options.widgetLibrary
            });
            if (error) {
                return error;
            }
        }
        return null;
    }
    getContextVarExprs(contextVar, widgetLibrary, actionLibrary) {
        // Include action expressions
        if (this.blockDef.actionDef) {
            const action = actionLibrary.createAction(this.blockDef.actionDef);
            return action.getContextVarExprs(contextVar, widgetLibrary);
        }
        return [];
    }
    renderButton(locale, onClick) {
        const label = localization_1.localize(this.blockDef.label, locale);
        let className = "btn btn-" + this.blockDef.style;
        switch (this.blockDef.size) {
            case "normal":
                break;
            case "small":
                className += ` btn-sm`;
                break;
            case "large":
                className += ` btn-lg`;
                break;
        }
        return (React.createElement("button", { type: "button", className: className, onClick: onClick, style: { margin: 5 } }, label));
    }
    renderDesign(props) {
        return this.renderButton(props.locale, (() => null));
    }
    renderInstance(props) {
        const handleClick = () => {
            // Confirm if confirm message
            if (this.blockDef.confirmMessage) {
                if (!confirm(localization_1.localize(this.blockDef.confirmMessage, props.locale))) {
                    return;
                }
            }
            // Run action
            if (this.blockDef.actionDef) {
                const action = props.actionLibrary.createAction(this.blockDef.actionDef);
                action.performAction({
                    contextVars: props.contextVars,
                    database: props.database,
                    schema: props.schema,
                    locale: props.locale,
                    contextVarValues: props.contextVarValues,
                    pageStack: props.pageStack,
                    getContextVarExprValue: props.getContextVarExprValue
                });
            }
        };
        return this.renderButton(props.locale, handleClick);
    }
    renderEditor(props) {
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Text" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "label" }, (value, onChange) => React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }))),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Style" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "style" }, (value, onChange) => React.createElement(bootstrap_1.Select, { value: value, onChange: onChange, options: [
                        { value: "default", label: "Default" },
                        { value: "primary", label: "Primary" },
                        { value: "link", label: "Link" },
                    ] }))),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Size" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "size" }, (value, onChange) => React.createElement(bootstrap_1.Select, { value: value, onChange: onChange, options: [
                        { value: "normal", label: "Default" },
                        { value: "small", label: "Small" },
                        { value: "large", label: "Large" }
                    ] }))),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "When button clicked" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "actionDef" }, (value, onChange) => (React.createElement(propertyEditors_1.ActionDefEditor, { value: value, onChange: onChange, locale: props.locale, schema: props.schema, dataSource: props.dataSource, actionLibrary: props.actionLibrary, widgetLibrary: props.widgetLibrary, contextVars: props.contextVars })))),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Confirm message" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "confirmMessage" }, (value, onChange) => React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale })))));
    }
}
exports.ButtonBlock = ButtonBlock;
//# sourceMappingURL=button.js.map