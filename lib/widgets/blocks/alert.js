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
exports.AlertBlock = void 0;
const immer_1 = __importDefault(require("immer"));
const React = __importStar(require("react"));
const blocks_1 = require("../blocks");
const propertyEditors_1 = require("../propertyEditors");
const bootstrap_1 = require("react-library/lib/bootstrap");
class AlertBlock extends blocks_1.Block {
    getChildren(contextVars) {
        return this.blockDef.content ? [{ blockDef: this.blockDef.content, contextVars: contextVars }] : [];
    }
    validate() {
        return null;
    }
    processChildren(action) {
        const content = action(this.blockDef.content);
        return (0, immer_1.default)(this.blockDef, (draft) => {
            draft.content = content;
        });
    }
    renderDesign(props) {
        const handleAdd = (addedBlockDef) => {
            props.store.alterBlock(this.id, (0, immer_1.default)((b) => {
                b.content = addedBlockDef;
                return b;
            }), addedBlockDef.id);
        };
        return (React.createElement("div", { className: `alert alert-${this.blockDef.style}` }, props.renderChildBlock(props, this.blockDef.content, handleAdd)));
    }
    renderInstance(props) {
        return (React.createElement("div", { className: `alert alert-${this.blockDef.style}` }, props.renderChildBlock(props, this.blockDef.content)));
    }
    renderEditor(designCtx) {
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Style" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: designCtx.store.replaceBlock, property: "style" }, (value, onChange) => (React.createElement(bootstrap_1.Select, { value: value || null, onChange: onChange, options: [
                        { value: "info", label: "Info" },
                        { value: "success", label: "Success" },
                        { value: "warning", label: "Warning" },
                        { value: "danger", label: "Danger" }
                    ] }))))));
    }
}
exports.AlertBlock = AlertBlock;
