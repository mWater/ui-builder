import produce from 'immer';
import * as React from 'react';
import CompoundBlock from '../CompoundBlock';
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
        // const labelText = localize(this.blockDef.label, props.locale)
        return (React.createElement("div", null,
            props.renderChildBlock(props, this.blockDef.child, handleAdd),
            React.createElement("div", { className: "save-cancel-footer" },
                React.createElement("button", { type: "button", className: "btn btn-primary" }, "Save"),
                "\u00A0",
                React.createElement("button", { type: "button", className: "btn btn-default" }, "Cancel"))));
    }
    renderInstance(props) {
        return (React.createElement("div", null,
            props.renderChildBlock(props, this.blockDef.child),
            React.createElement("div", { className: "save-cancel-footer" },
                React.createElement("button", { type: "button", className: "btn btn-primary" }, "Save"),
                "\u00A0",
                React.createElement("button", { type: "button", className: "btn btn-default" }, "Cancel"))));
    }
    renderEditor(props) {
        return null;
    }
}
//# sourceMappingURL=saveCancel.js.map