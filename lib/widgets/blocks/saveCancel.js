import produce from 'immer';
import * as React from 'react';
import CompoundBlock from '../CompoundBlock';
import { localize } from '../localization';
import { LocalizedTextPropertyEditor, PropertyEditor, LabeledProperty } from '../propertyEditors';
export class SaveCancelBlock extends CompoundBlock {
    getChildren(contextVars) {
        return this.blockDef.child ? [{ blockDef: this.blockDef.child, contextVars: contextVars }] : [];
    }
    validate() { return null; }
    processChildren(action) {
        return produce(this.blockDef, draft => {
            draft.child = action(draft.child);
        });
    }
    renderDesign(props) {
        const handleAdd = (addedBlockDef) => {
            props.store.alterBlock(this.id, produce((b) => {
                b.child = addedBlockDef;
                return b;
            }), addedBlockDef.id);
        };
        const saveLabelText = localize(this.blockDef.saveLabel, props.locale);
        const cancelLabelText = localize(this.blockDef.cancelLabel, props.locale);
        return (React.createElement("div", null,
            props.renderChildBlock(props, this.blockDef.child, handleAdd),
            React.createElement("div", { className: "save-cancel-footer" },
                React.createElement("button", { type: "button", className: "btn btn-primary" }, saveLabelText),
                "\u00A0",
                React.createElement("button", { type: "button", className: "btn btn-default" }, cancelLabelText))));
    }
    renderInstance(props) {
        const saveLabelText = localize(this.blockDef.saveLabel, props.locale);
        const cancelLabelText = localize(this.blockDef.cancelLabel, props.locale);
        return (React.createElement("div", null,
            props.renderChildBlock(props, this.blockDef.child),
            React.createElement("div", { className: "save-cancel-footer" },
                React.createElement("button", { type: "button", className: "btn btn-primary" }, saveLabelText),
                "\u00A0",
                React.createElement("button", { type: "button", className: "btn btn-default" }, cancelLabelText))));
    }
    renderEditor(props) {
        return (React.createElement("div", null,
            React.createElement(LabeledProperty, { label: "Save Label" },
                React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "saveLabel" }, (value, onChange) => React.createElement(LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }))),
            React.createElement(LabeledProperty, { label: "Cancel Label" },
                React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "cancelLabel" }, (value, onChange) => React.createElement(LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale })))));
    }
}
//# sourceMappingURL=saveCancel.js.map