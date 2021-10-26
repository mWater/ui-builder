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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerticalBlock = void 0;
const immer_1 = __importDefault(require("immer"));
const React = __importStar(require("react"));
const blocks_1 = require("../blocks");
class VerticalBlock extends blocks_1.Block {
    get id() {
        return this.blockDef.id;
    }
    getChildren(contextVars) {
        return this.blockDef.items.map((bd) => ({ blockDef: bd, contextVars: contextVars }));
    }
    validate() {
        return null;
    }
    processChildren(action) {
        // Apply action to all children, discarding null ones
        const newItems = [];
        for (const item of this.blockDef.items) {
            const newItem = action(item);
            if (newItem) {
                newItems.push(newItem);
            }
        }
        return (0, immer_1.default)(this.blockDef, (draft) => {
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
        if (this.blockDef.items.some((bd) => bd.type == "vertical")) {
            // Create list of items
            let newItems = [];
            for (const item of this.blockDef.items) {
                if (item.type == "vertical") {
                    newItems = newItems.concat(item.items);
                }
                else {
                    newItems.push(item);
                }
            }
            return (0, immer_1.default)(this.blockDef, (draft) => {
                draft.items = newItems;
            });
        }
        return this.blockDef;
    }
    renderDesign(props) {
        // Add keys
        return (React.createElement("div", { style: { paddingLeft: 5, paddingRight: 5 } }, this.blockDef.items.map((childBlockDef, index) => React.cloneElement(props.renderChildBlock(props, childBlockDef), { key: index }))));
    }
    renderInstance(props) {
        return (React.createElement("div", null, this.blockDef.items.map((childBlockDef, index) => {
            const childElem = props.renderChildBlock(props, childBlockDef);
            return childElem ? React.cloneElement(childElem, { key: index }) : null;
        })));
    }
    getLabel() {
        return "";
    }
}
exports.VerticalBlock = VerticalBlock;
