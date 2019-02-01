"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const immer_1 = __importDefault(require("immer"));
const React = __importStar(require("react"));
const CompoundBlock_1 = __importDefault(require("../CompoundBlock"));
const localization_1 = require("../localization");
const propertyEditors_1 = require("../propertyEditors");
class LabeledBlock extends CompoundBlock_1.default {
    getChildren(contextVars) {
        return this.blockDef.child ? [{ blockDef: this.blockDef.child, contextVars: contextVars }] : [];
    }
    validate() { return null; }
    processChildren(action) {
        return immer_1.default(this.blockDef, draft => {
            draft.child = action(draft.child);
        });
    }
    renderDesign(props) {
        const handleAdd = (addedBlockDef) => {
            props.store.alterBlock(this.id, immer_1.default((b) => {
                b.child = addedBlockDef;
                return b;
            }), addedBlockDef.id);
        };
        const labelText = localization_1.localize(this.blockDef.label, props.locale);
        return (React.createElement("div", { style: { paddingTop: 5, paddingBottom: 5 } },
            React.createElement("div", { style: { fontWeight: "bold" } }, labelText ? labelText : React.createElement("span", { className: "text-muted" }, "Label")),
            props.renderChildBlock(props, this.blockDef.child, handleAdd)));
    }
    renderInstance(props) {
        return (React.createElement("div", { style: { paddingTop: 5, paddingBottom: 5 } },
            React.createElement("div", { style: { fontWeight: "bold" } }, localization_1.localize(this.blockDef.label, props.locale)),
            props.renderChildBlock(props, this.blockDef.child)));
    }
    renderEditor(props) {
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Label" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "label" }, (value, onChange) => React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale })))));
    }
}
exports.LabeledBlock = LabeledBlock;
//# sourceMappingURL=labeled.js.map