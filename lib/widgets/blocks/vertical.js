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
class VerticalBlock extends CompoundBlock_1.default {
    get id() { return this.blockDef.id; }
    getChildren(contextVars) {
        return this.blockDef.items.map(bd => ({ blockDef: bd, contextVars: contextVars }));
    }
    validate() { return null; }
    processChildren(action) {
        // Apply action to all children, discarding null ones
        return immer_1.default(this.blockDef, draft => {
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
        return immer_1.default(this.blockDef, (draft) => {
            draft.items = draft.items.map(item => item.type === "vertical" ? item.items : item).reduce((a, b) => a.concat(b), []);
        });
    }
    renderDesign(props) {
        // Add keys
        return (React.createElement("div", { style: { paddingLeft: 5, paddingRight: 5 } }, this.blockDef.items.map((childBlockDef, index) => React.cloneElement(props.renderChildBlock(props, childBlockDef), { key: index }))));
    }
    renderInstance(props) {
        return (React.createElement("div", { style: { paddingLeft: 5, paddingRight: 5 } }, this.blockDef.items.map((childBlockDef, index) => {
            const childElem = props.renderChildBlock(props, childBlockDef);
            return childElem ? React.cloneElement(childElem, { key: index }) : null;
        })));
    }
}
exports.VerticalBlock = VerticalBlock;
//# sourceMappingURL=vertical.js.map