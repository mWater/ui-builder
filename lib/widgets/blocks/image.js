"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var React = __importStar(require("react"));
var LeafBlock_1 = __importDefault(require("../LeafBlock"));
var propertyEditors_1 = require("../propertyEditors");
var bootstrap_1 = require("react-library/lib/bootstrap");
var ImageBlock = /** @class */ (function (_super) {
    __extends(ImageBlock, _super);
    function ImageBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ImageBlock.prototype.validate = function (options) {
        if (!this.blockDef.url) {
            return "URL required";
        }
        return null;
    };
    ImageBlock.prototype.renderImage = function () {
        if (!this.blockDef.url) {
            return React.createElement("i", { className: "fa fa-picture-o" });
        }
        return (React.createElement("img", { src: this.blockDef.url }));
    };
    ImageBlock.prototype.renderDesign = function (props) {
        return this.renderImage();
    };
    ImageBlock.prototype.renderInstance = function (props) {
        return this.renderImage();
    };
    ImageBlock.prototype.renderEditor = function (props) {
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "URL" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "url" }, function (value, onChange) { return React.createElement(bootstrap_1.TextInput, { value: value, onChange: onChange }); }))));
    };
    return ImageBlock;
}(LeafBlock_1.default));
exports.ImageBlock = ImageBlock;
//# sourceMappingURL=image.js.map