import produce from 'immer';
import * as React from 'react';
import CompoundBlock from '../CompoundBlock';
export class VerticalBlock extends CompoundBlock {
    get id() { return this.blockDef.id; }
    getChildren(contextVars) {
        return this.blockDef.items.map(bd => ({ blockDef: bd, contextVars: contextVars }));
    }
    validate() { return null; }
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
    canonicalize() {
        // Remove if zero items
        if (this.blockDef.items.length === 0) {
            return null;
        }
        // Collapse if one item
        if (this.blockDef.items.length === 1) {
            return this.blockDef.items[0];
        }
        // Flatten out nested vertical blocks
        return produce(this.blockDef, (draft) => {
            draft.items = draft.items.map(item => item.type === "vertical" ? item.items : item).reduce((a, b) => a.concat(b), []);
        });
    }
    renderChildDesign(props, childBlockDef) {
        return (React.createElement("div", { key: childBlockDef.id }, props.renderChildBlock(props, childBlockDef)));
    }
    renderDesign(props) {
        return (React.createElement("div", { style: { paddingLeft: 5, paddingRight: 5 } }, this.blockDef.items.map(childBlock => this.renderChildDesign(props, childBlock))));
    }
    renderInstance(props) {
        return (React.createElement("div", { style: { paddingLeft: 5, paddingRight: 5 } }, this.blockDef.items.map(childBlockDef => props.renderChildBlock(props, childBlockDef))));
    }
}
//# sourceMappingURL=vertical.js.map