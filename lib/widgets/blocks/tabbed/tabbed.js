import produce from 'immer';
import * as React from 'react';
import CompoundBlock from '../../CompoundBlock';
import { LabeledProperty, LocalizedTextPropertyEditor, PropertyEditor } from '../../propertyEditors';
import TabbedDesigner from './TabbedDesigner';
import ListEditor from '../../ListEditor';
import uuid from 'uuid/v4';
import TabbedInstance from './TabbedInstance';
/** Tabbed control */
export class TabbedBlock extends CompoundBlock {
    getChildren(contextVars) {
        return this.blockDef.tabs.filter(tab => tab.content).map(tab => ({ blockDef: tab.content, contextVars: contextVars }));
    }
    validate() { return null; }
    processChildren(action) {
        return produce(this.blockDef, draft => {
            for (const tab of draft.tabs) {
                tab.content = action(tab.content);
            }
        });
    }
    renderDesign(props) {
        return React.createElement(TabbedDesigner, { renderDesignProps: props, tabbedBlockDef: this.blockDef });
    }
    renderInstance(props) {
        return React.createElement(TabbedInstance, { renderInstanceProps: props, tabbedBlockDef: this.blockDef });
    }
    renderEditor(props) {
        const handleAddTab = () => {
            props.onChange(produce(this.blockDef, (draft) => {
                draft.tabs.push({
                    id: uuid(),
                    label: { _base: "en", en: "Unnamed" },
                    content: null
                });
            }));
        };
        return (React.createElement("div", null,
            React.createElement("h3", null, "Tabbed"),
            React.createElement(LabeledProperty, { label: "Tabs" },
                React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "tabs" }, (tabs, onTabsChange) => React.createElement(ListEditor, { items: this.blockDef.tabs, onItemsChange: onTabsChange }, (tab, onTabChange) => React.createElement(PropertyEditor, { obj: tab, onChange: onTabChange, property: "label" }, (label, onLabelChange) => React.createElement(LocalizedTextPropertyEditor, { value: label, onChange: onLabelChange, locale: props.locale })))),
                React.createElement("button", { type: "button", className: "btn btn-link btn-sm", onClick: handleAddTab },
                    React.createElement("i", { className: "fa fa-plus" }),
                    " Add Tab"))));
    }
}
//# sourceMappingURL=tabbed.js.map