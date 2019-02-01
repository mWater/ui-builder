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
const bootstrap_1 = require("react-library/lib/bootstrap");
const propertyEditors_1 = require("../propertyEditors");
class HorizontalBlock extends CompoundBlock_1.default {
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
        return immer_1.default(this.blockDef, (draft) => {
            draft.items = draft.items.map(item => item.type === "horizontal" ? item.items : item).reduce((a, b) => a.concat(b), []);
        });
    }
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
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Alignment" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "align" }, (value, onChange) => React.createElement(bootstrap_1.Toggle, { value: value || "justify", onChange: onChange, options: [
                        { value: "justify", label: React.createElement("i", { className: "fa fa-align-justify" }) },
                        { value: "left", label: React.createElement("i", { className: "fa fa-align-left" }) },
                        { value: "center", label: React.createElement("i", { className: "fa fa-align-center" }) },
                        { value: "right", label: React.createElement("i", { className: "fa fa-align-right" }) }
                    ] })))));
    }
}
exports.HorizontalBlock = HorizontalBlock;
//# sourceMappingURL=horizontal.js.map