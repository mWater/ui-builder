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
exports.SpacerBlock = void 0;
const React = __importStar(require("react"));
const LeafBlock_1 = __importDefault(require("../LeafBlock"));
const propertyEditors_1 = require("../propertyEditors");
const bootstrap_1 = require("react-library/lib/bootstrap");
/** Creates a fixed size spacer to separate blocks */
class SpacerBlock extends LeafBlock_1.default {
    validate() { return null; }
    renderDesign(props) {
        const style = {
            backgroundImage: "linear-gradient(45deg, #dddddd 8.33%, #ffffff 8.33%, #ffffff 50%, #dddddd 50%, #dddddd 58.33%, #ffffff 58.33%, #ffffff 100%)",
            backgroundSize: "8.49px 8.49px"
        };
        if (this.blockDef.width) {
            style.width = this.blockDef.width + "em";
        }
        if (this.blockDef.height) {
            style.height = this.blockDef.height + "em";
        }
        return React.createElement("div", { style: style });
    }
    renderInstance(props) {
        const style = {};
        if (this.blockDef.width) {
            style.width = this.blockDef.width + "em";
        }
        if (this.blockDef.height) {
            style.height = this.blockDef.height + "em";
        }
        return React.createElement("div", { style: style });
    }
    renderEditor(props) {
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Width in ems (blank for auto)" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "width" }, (value, onChange) => React.createElement(bootstrap_1.NumberInput, { value: value, onChange: onChange, decimal: true }))),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Height in ems (blank for auto)" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "height" }, (value, onChange) => React.createElement(bootstrap_1.NumberInput, { value: value, onChange: onChange, decimal: true })))));
    }
}
exports.SpacerBlock = SpacerBlock;
