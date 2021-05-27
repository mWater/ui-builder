"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TabbedBlock = void 0;
const immer_1 = __importDefault(require("immer"));
const React = __importStar(require("react"));
const blocks_1 = require("../../blocks");
const propertyEditors_1 = require("../../propertyEditors");
const TabbedDesigner_1 = __importDefault(require("./TabbedDesigner"));
const ListEditor_1 = __importDefault(require("../../ListEditor"));
const v4_1 = __importDefault(require("uuid/v4"));
const TabbedInstance_1 = __importDefault(require("./TabbedInstance"));
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
        return React.createElement(TabbedDesigner_1.default, { designCtx: props, tabbedBlockDef: this.blockDef });
    }
    renderInstance(props) {
        return React.createElement(TabbedInstance_1.default, { instanceCtx: props, tabbedBlockDef: this.blockDef });
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
        return (React.createElement("div", null,
            React.createElement("h3", null, "Tabbed"),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Tabs" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "tabs" }, (tabs, onTabsChange) => React.createElement(ListEditor_1.default, { items: this.blockDef.tabs, onItemsChange: onTabsChange }, (tab, onTabChange) => React.createElement(propertyEditors_1.PropertyEditor, { obj: tab, onChange: onTabChange, property: "label" }, (label, onLabelChange) => React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: label, onChange: onLabelChange, locale: props.locale })))),
                React.createElement("button", { type: "button", className: "btn btn-link btn-sm", onClick: handleAddTab },
                    React.createElement("i", { className: "fa fa-plus" }),
                    " Add Tab"))));
    }
}
exports.TabbedBlock = TabbedBlock;
