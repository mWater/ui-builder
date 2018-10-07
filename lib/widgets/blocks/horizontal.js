import produce from 'immer';
import * as React from 'react';
import CompoundBlock from '../CompoundBlock';
import { Toggle } from 'react-library/lib/bootstrap';
import { LabeledProperty, PropertyEditor } from '../propertyEditors';
export class HorizontalBlock extends CompoundBlock {
    get id() { return this.blockDef.id; }
    getChildren(contextVars) {
        return this.blockDef.items.map(bd => ({ blockDef: bd, contextVars: contextVars }));
    }
    validate() { return null; }
    canonicalize() {
        // Remove if zero items
        if (this.blockDef.items.length === 0) {
            return null;
        }
        // Collapse if one item
        if (this.blockDef.items.length === 1) {
            return this.blockDef.items[0];
        }
        // Flatten out nested horizontal blocks
        return produce(this.blockDef, (draft) => {
            draft.items = draft.items.map(item => item.type === "horizontal" ? item.items : item).reduce((a, b) => a.concat(b), []);
        });
    }
    processChildren(action) {
        // Apply action to all children, discarding null ones
        return produce(this.blockDef, draft => {
            const newItems = [];
            for (const item of draft.items) {
                const newItem = action(item);
                if (newItem) {
                    newItems.push(newItem);
                }
            }
            draft.items = newItems;
        });
    }
    renderBlock(children) {
        switch (this.blockDef.align || "justify") {
            case "justify":
                return (React.createElement("div", null, children.map((child, index) => {
                    return (React.createElement("div", { key: index, style: { display: "inline-block", width: (100 / children.length) + "%", verticalAlign: "top" } }, child));
                })));
            case "left":
                return (React.createElement("div", null, children.map((child, index) => {
                    return (React.createElement("div", { key: index, style: { display: "inline-block", verticalAlign: "top" } }, child));
                })));
            case "right":
                return (React.createElement("div", { style: { textAlign: "right" } }, children.map((child, index) => {
                    return (React.createElement("div", { key: index, style: { display: "inline-block", verticalAlign: "top" } }, child));
                })));
            case "center":
                return (React.createElement("div", { style: { textAlign: "center" } }, children.map((child, index) => {
                    return (React.createElement("div", { key: index, style: { display: "inline-block", verticalAlign: "top" } }, child));
                })));
        }
    }
    renderDesign(props) {
        return (React.createElement("div", { style: { paddingTop: 5, paddingBottom: 5 } }, this.renderBlock(this.blockDef.items.map(childBlock => props.renderChildBlock(props, childBlock)))));
    }
    renderInstance(props) {
        return (React.createElement("div", { style: { paddingTop: 5, paddingBottom: 5 } }, this.renderBlock(this.blockDef.items.map(childBlockDef => props.renderChildBlock(props, childBlockDef)))));
    }
    renderEditor(props) {
        return (React.createElement("div", null,
            React.createElement(LabeledProperty, { label: "Alignment" },
                React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "align" }, (value, onChange) => React.createElement(Toggle, { value: value || "justify", onChange: onChange, options: [
                        { value: "justify", label: React.createElement("i", { className: "fa fa-align-justify" }) },
                        { value: "left", label: React.createElement("i", { className: "fa fa-align-left" }) },
                        { value: "center", label: React.createElement("i", { className: "fa fa-align-center" }) },
                        { value: "right", label: React.createElement("i", { className: "fa fa-align-right" }) }
                    ] })))));
    }
}
//# sourceMappingURL=horizontal.js.map