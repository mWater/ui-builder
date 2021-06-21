"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TabbedBlock = void 0;
const immer_1 = __importDefault(require("immer"));
const react_1 = __importDefault(require("react"));
const blocks_1 = require("../../blocks");
const propertyEditors_1 = require("../../propertyEditors");
const TabbedDesigner_1 = __importDefault(require("./TabbedDesigner"));
const ListEditor_1 = __importDefault(require("../../ListEditor"));
const v4_1 = __importDefault(require("uuid/v4"));
const TabbedInstance_1 = require("./TabbedInstance");
const bootstrap_1 = require("react-library/lib/bootstrap");
/** Tabbed control */
class TabbedBlock extends blocks_1.Block {
    getChildren(contextVars) {
        return this.blockDef.tabs.filter(tab => tab.content).map(tab => ({ blockDef: tab.content, contextVars: contextVars }));
    }
    validate() { return null; }
    processChildren(action) {
        // Immer bug requires that producers not be nested
        const tabContents = this.blockDef.tabs.map(t => action(t.content));
        return immer_1.default(this.blockDef, draft => {
            for (var i = 0; i < tabContents.length; i++) {
                draft.tabs[i].content = tabContents[i];
            }
        });
    }
    renderDesign(props) {
        return react_1.default.createElement(TabbedDesigner_1.default, { designCtx: props, tabbedBlockDef: this.blockDef });
    }
    renderInstance(props) {
        return react_1.default.createElement(TabbedInstance_1.TabbedInstance, { instanceCtx: props, blockDef: this.blockDef });
    }
    renderEditor(props) {
        const handleAddTab = () => {
            props.store.replaceBlock(immer_1.default(this.blockDef, (draft) => {
                draft.tabs.push({
                    id: v4_1.default(),
                    label: { _base: "en", en: "Unnamed" },
                    content: null
                });
            }));
        };
        return (react_1.default.createElement("div", null,
            react_1.default.createElement("h3", null, "Tabbed"),
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Tabs" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "tabs" }, (tabs, onTabsChange) => react_1.default.createElement(ListEditor_1.default, { items: this.blockDef.tabs, onItemsChange: onTabsChange }, (tab, onTabChange) => react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: tab, onChange: onTabChange, property: "label" }, (label, onLabelChange) => react_1.default.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: label, onChange: onLabelChange, locale: props.locale })))),
                react_1.default.createElement("button", { type: "button", className: "btn btn-link btn-sm", onClick: handleAddTab },
                    react_1.default.createElement("i", { className: "fa fa-plus" }),
                    " Add Tab")),
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Collapse Below Width" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "collapseWidth" }, (value, onChange) => (react_1.default.createElement(bootstrap_1.Select, { value: value, onChange: v => onChange(v != null ? v : undefined), options: [
                        { value: 400, label: `< 400px (Phone)` },
                        { value: 600, label: `< 600px (Small tablet)` },
                        { value: 800, label: `< 800px (Tablet)` },
                        { value: 1000, label: `< 1000px (Laptop)` },
                        { value: 1200, label: `< 1200px (Desktop)` },
                        { value: 1600, label: `< 1600px (Wide Desktop)` }
                    ], nullLabel: "None" }))))));
    }
}
exports.TabbedBlock = TabbedBlock;
