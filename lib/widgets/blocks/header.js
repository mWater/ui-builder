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
exports.HeaderBlock = void 0;
const immer_1 = __importDefault(require("immer"));
const React = __importStar(require("react"));
const blocks_1 = require("../blocks");
class HeaderBlock extends blocks_1.Block {
    getChildren(contextVars) {
        return this.blockDef.child ? [{ blockDef: this.blockDef.child, contextVars: contextVars }] : [];
    }
    validate() { return null; }
    processChildren(action) {
        const child = action(this.blockDef.child);
        return immer_1.default(this.blockDef, draft => {
            draft.child = child;
        });
    }
    renderDesign(props) {
        const handleAdd = (addedBlockDef) => {
            props.store.alterBlock(this.id, immer_1.default((b) => {
                b.child = addedBlockDef;
                return b;
            }), addedBlockDef.id);
        };
        return (React.createElement("div", { className: "header-block" }, props.renderChildBlock(props, this.blockDef.child, handleAdd)));
    }
    renderInstance(props) {
        return (React.createElement("div", { className: "header-block" }, props.renderChildBlock(props, this.blockDef.child)));
    }
}
exports.HeaderBlock = HeaderBlock;
