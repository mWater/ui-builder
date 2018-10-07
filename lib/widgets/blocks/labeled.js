import produce from 'immer';
import * as React from 'react';
import CompoundBlock from '../CompoundBlock';
import { localize } from '../localization';
import { LabeledProperty, LocalizedTextPropertyEditor, PropertyEditor } from '../propertyEditors';
export class LabeledBlock extends CompoundBlock {
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
        const labelText = localize(this.blockDef.label, props.locale);
        return (React.createElement("div", { style: { paddingTop: 5, paddingBottom: 5 } },
            React.createElement("div", { style: { fontWeight: "bold" } }, labelText ? labelText : React.createElement("span", { className: "text-muted" }, "Label")),
            props.renderChildBlock(props, this.blockDef.child, handleAdd)));
    }
    renderInstance(props) {
        return (React.createElement("div", { style: { paddingTop: 5, paddingBottom: 5 } },
            React.createElement("div", { style: { fontWeight: "bold" } }, localize(this.blockDef.label, props.locale)),
            props.renderChildBlock(props, this.blockDef.child)));
    }
    renderEditor(props) {
        return (React.createElement("div", null,
            React.createElement(LabeledProperty, { label: "Label" },
                React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "label" }, (value, onChange) => React.createElement(LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale })))));
    }
}
//# sourceMappingURL=labeled.js.map