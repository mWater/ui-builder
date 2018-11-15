import * as React from 'react';
import { Action } from '../actions';
import { LabeledProperty, PropertyEditor } from '../propertyEditors';
import { TextInput, Checkbox } from 'react-library/lib/bootstrap';
export class GotoUrlAction extends Action {
    async performAction(options) {
        window.open(this.actionDef.url, this.actionDef.newTab ? "_blank" : "_self");
    }
    validate(options) {
        // Check that url is present
        if (!this.actionDef.url) {
            return "URL required";
        }
        return null;
    }
    renderEditor(props) {
        return (React.createElement("div", null,
            React.createElement(LabeledProperty, { label: "URL" },
                React.createElement(PropertyEditor, { obj: this.actionDef, onChange: props.onChange, property: "url" }, (value, onChange) => React.createElement(TextInput, { value: value, onChange: onChange }))),
            React.createElement(PropertyEditor, { obj: this.actionDef, onChange: props.onChange, property: "newTab" }, (value, onChange) => React.createElement(Checkbox, { value: value, onChange: onChange }, "Open in new tab"))));
    }
}
//# sourceMappingURL=gotoUrl.js.map