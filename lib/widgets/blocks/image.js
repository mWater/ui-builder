"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
const LeafBlock_1 = __importDefault(require("../LeafBlock"));
const propertyEditors_1 = require("../propertyEditors");
const bootstrap_1 = require("react-library/lib/bootstrap");
class ImageBlock extends LeafBlock_1.default {
    validate(options) {
        if (!this.blockDef.url) {
            return "URL required";
        }
        return null;
    }
    renderImage() {
        if (!this.blockDef.url) {
            return React.createElement("i", { className: "fa fa-picture-o" });
        }
        return (React.createElement("img", { src: this.blockDef.url }));
    }
    renderDesign(props) {
        return this.renderImage();
    }
    renderInstance(props) {
        return this.renderImage();
    }
    renderEditor(props) {
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "URL" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "url" }, (value, onChange) => React.createElement(bootstrap_1.TextInput, { value: value, onChange: onChange })))));
    }
}
exports.ImageBlock = ImageBlock;
//# sourceMappingURL=image.js.map