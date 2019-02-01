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
const CompoundBlock_1 = __importDefault(require("../../CompoundBlock"));
const propertyEditors_1 = require("../../propertyEditors");
const TabbedDesigner_1 = __importDefault(require("./TabbedDesigner"));
const ListEditor_1 = __importDefault(require("../../ListEditor"));
const v4_1 = __importDefault(require("uuid/v4"));
const TabbedInstance_1 = __importDefault(require("./TabbedInstance"));
/** Tabbed control */
class TabbedBlock extends CompoundBlock_1.default {
    getChildren(contextVars) {
        return this.blockDef.tabs.filter(tab => tab.content).map(tab => ({ blockDef: tab.content, contextVars: contextVars }));
    }
    validate() { return null; }
    processChildren(action) {
        return immer_1.default(this.blockDef, draft => {
            for (const tab of draft.tabs) {
                tab.content = action(tab.content);
            }
        });
    }
    renderDesign(props) {
        return React.createElement(TabbedDesigner_1.default, { renderDesignProps: props, tabbedBlockDef: this.blockDef });
    }
    renderInstance(props) {
        return React.createElement(TabbedInstance_1.default, { renderInstanceProps: props, tabbedBlockDef: this.blockDef });
    }
    renderEditor(props) {
        const handleAddTab = () => {
            props.onChange(immer_1.default(this.blockDef, (draft) => {
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
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "tabs" }, (tabs, onTabsChange) => React.createElement(ListEditor_1.default, { items: this.blockDef.tabs, onItemsChange: onTabsChange }, (tab, onTabChange) => React.createElement(propertyEditors_1.PropertyEditor, { obj: tab, onChange: onTabChange, property: "label" }, (label, onLabelChange) => React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: label, onChange: onLabelChange, locale: props.locale })))),
                React.createElement("button", { type: "button", className: "btn btn-link btn-sm", onClick: handleAddTab },
                    React.createElement("i", { className: "fa fa-plus" }),
                    " Add Tab"))));
    }
}
exports.TabbedBlock = TabbedBlock;
//# sourceMappingURL=tabbed.js.map