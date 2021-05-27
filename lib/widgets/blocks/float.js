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
exports.FloatBlock = void 0;
const React = __importStar(require("react"));
const _ = __importStar(require("lodash"));
const blocks_1 = require("../blocks");
const propertyEditors_1 = require("../propertyEditors");
const bootstrap_1 = require("react-library/lib/bootstrap");
const immer_1 = __importDefault(require("immer"));
class FloatBlock extends blocks_1.Block {
    getChildren(contextVars) {
        // Get for all cells
        return _.compact([this.blockDef.mainContent, this.blockDef.floatContent]).map(bd => ({ blockDef: bd, contextVars: contextVars }));
    }
    validate() { return null; }
    processChildren(action) {
        return immer_1.default(this.blockDef, (draft) => {
            draft.mainContent = action(this.blockDef.mainContent);
            draft.floatContent = action(this.blockDef.floatContent);
        });
    }
    renderDesign(props) {
        const handleSetMainContent = (blockDef) => {
            props.store.alterBlock(this.id, immer_1.default((b) => {
                b.mainContent = blockDef;
            }), blockDef.id);
        };
        const handleSetFloatContent = (blockDef) => {
            props.store.alterBlock(this.id, immer_1.default((b) => {
                b.floatContent = blockDef;
            }), blockDef.id);
        };
        const mainContentNode = props.renderChildBlock(props, this.blockDef.mainContent, handleSetMainContent);
        const floatContentNode = props.renderChildBlock(props, this.blockDef.floatContent, handleSetFloatContent);
        return React.createElement(FloatComponent, { float: floatContentNode, main: mainContentNode, direction: this.blockDef.direction, verticalAlign: this.blockDef.verticalAlign });
    }
    renderInstance(props) {
        const mainContentNode = props.renderChildBlock(props, this.blockDef.mainContent);
        const floatContentNode = props.renderChildBlock(props, this.blockDef.floatContent);
        return React.createElement(FloatComponent, { float: floatContentNode, main: mainContentNode, direction: this.blockDef.direction, verticalAlign: this.blockDef.verticalAlign });
    }
    renderEditor(props) {
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Direction" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "direction" }, (value, onChange) => React.createElement(bootstrap_1.Toggle, { value: value, onChange: onChange, options: [
                        { value: "left", label: React.createElement("i", { className: "fa fa-align-left" }) },
                        { value: "right", label: React.createElement("i", { className: "fa fa-align-right" }) }
                    ] }))),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Vertical Alignment" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "verticalAlign" }, (value, onChange) => React.createElement(bootstrap_1.Toggle, { value: value, onChange: onChange, options: [
                        { value: "top", label: "Top" },
                        { value: "middle", label: "Middle" },
                        { value: "bottom", label: "Bottom" }
                    ] })))));
    }
}
exports.FloatBlock = FloatBlock;
const FloatComponent = (props) => {
    return (React.createElement("table", { style: { width: "100%" } },
        React.createElement("tbody", null,
            React.createElement("tr", { key: "float" },
                props.direction == "left" ? React.createElement("td", { key: "left", style: { verticalAlign: props.verticalAlign } }, props.float) : null,
                React.createElement("td", { key: "main", style: { width: "100%", verticalAlign: props.verticalAlign } }, props.main),
                props.direction == "right" ? React.createElement("td", { key: "right", style: { verticalAlign: props.verticalAlign } }, props.float) : null))));
};
