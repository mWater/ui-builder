import * as React from 'react';
import LeafBlock from '../LeafBlock';
import { LabeledProperty, LocalizedTextPropertyEditor, PropertyEditor, ActionDefEditor } from '../propertyEditors';
import { localize } from '../localization';
import { Select } from 'react-library/lib/bootstrap';
export class ButtonBlock extends LeafBlock {
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
    renderButton(locale, onClick) {
        const label = localize(this.blockDef.label, locale);
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
        return (React.createElement("button", { type: "button", className: className, onClick: onClick }, label));
    }
    renderDesign(props) {
        return this.renderButton(props.locale, (() => null));
    }
    renderInstance(props) {
        const handleClick = () => {
            // Run action
            if (this.blockDef.actionDef) {
                const action = props.actionLibrary.createAction(this.blockDef.actionDef);
                action.performAction({
                    contextVars: props.contextVars,
                    database: props.database,
                    locale: props.locale,
                    contextVarValues: props.contextVarValues,
                    pageStack: props.pageStack
                });
            }
        };
        return this.renderButton(props.locale, handleClick);
    }
    renderEditor(props) {
        return (React.createElement("div", null,
            React.createElement(LabeledProperty, { label: "Text" },
                React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "label" }, (value, onChange) => React.createElement(LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }))),
            React.createElement(LabeledProperty, { label: "Style" },
                React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "style" }, (value, onChange) => React.createElement(Select, { value: value, onChange: onChange, options: [
                        { value: "default", label: "Default" },
                        { value: "primary", label: "Primary" },
                        { value: "link", label: "Link" },
                    ] }))),
            React.createElement(LabeledProperty, { label: "Size" },
                React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "size" }, (value, onChange) => React.createElement(Select, { value: value, onChange: onChange, options: [
                        { value: "normal", label: "Default" },
                        { value: "small", label: "Small" },
                        { value: "large", label: "Large" }
                    ] }))),
            React.createElement(LabeledProperty, { label: "When button clicked" },
                React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "actionDef" }, (value, onChange) => (React.createElement(ActionDefEditor, { value: value, onChange: onChange, locale: props.locale, actionLibrary: props.actionLibrary, widgetLibrary: props.widgetLibrary, contextVars: props.contextVars }))))));
    }
}
//# sourceMappingURL=button.js.map