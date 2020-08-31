"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var LeafBlock_1 = __importDefault(require("../LeafBlock"));
var react_1 = __importDefault(require("react"));
var propertyEditors_1 = require("../propertyEditors");
var bootstrap_1 = require("react-library/lib/bootstrap");
var bootstrap_2 = require("react-library/lib/bootstrap");
var markdown_it_1 = __importDefault(require("markdown-it"));
var TextualBlock = /** @class */ (function (_super) {
    __extends(TextualBlock, _super);
    function TextualBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TextualBlock.prototype.getClassName = function () {
        if (this.blockDef.color) {
            return "text-" + this.blockDef.color;
        }
        return "";
    };
    /** Gets applied styles as CSS properties */
    TextualBlock.prototype.getStyle = function () {
        var style = {};
        if (this.blockDef.bold) {
            style.fontWeight = "bold";
        }
        if (this.blockDef.italic) {
            style.fontStyle = "italic";
        }
        if (this.blockDef.underline) {
            style.textDecoration = "underline";
        }
        if (this.blockDef.align) {
            style.textAlign = this.blockDef.align;
        }
        // Multiline is only when not markdown
        if (this.blockDef.multiline && !this.blockDef.markdown) {
            style.whiteSpace = "pre-line";
        }
        return style;
    };
    /** Renders content with the appropriate styling. If markdown, should already be processed */
    TextualBlock.prototype.renderText = function (content) {
        var style = this.getStyle();
        return react_1.default.createElement(this.blockDef.style || "div", { style: style, className: this.getClassName() }, content);
    };
    /** Processes markdown if markdown is turned on, otherwise passthrough */
    TextualBlock.prototype.processMarkdown = function (text) {
        if (!this.blockDef.markdown) {
            return text;
        }
        return react_1.default.createElement("div", { dangerouslySetInnerHTML: { __html: new markdown_it_1.default().render(text) } });
    };
    TextualBlock.prototype.renderTextualEditor = function (props) {
        return (react_1.default.createElement("div", null,
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Style" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "style" }, function (value, onChange) {
                    return react_1.default.createElement(bootstrap_1.Select, { value: value || "div", onChange: onChange, options: [
                            { value: "div", label: "Plain Text" },
                            { value: "p", label: "Paragraph" },
                            { value: "h1", label: "Heading 1" },
                            { value: "h2", label: "Heading 2" },
                            { value: "h3", label: "Heading 3" },
                            { value: "h4", label: "Heading 4" },
                            { value: "h5", label: "Heading 5" }
                        ] });
                })),
            react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "bold" }, function (value, onChange) { return react_1.default.createElement(bootstrap_2.Checkbox, { value: value, onChange: onChange }, "Bold"); }),
            react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "italic" }, function (value, onChange) { return react_1.default.createElement(bootstrap_2.Checkbox, { value: value, onChange: onChange }, "Italic"); }),
            react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "underline" }, function (value, onChange) { return react_1.default.createElement(bootstrap_2.Checkbox, { value: value, onChange: onChange }, "Underline"); }),
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Alignment" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "align" }, function (value, onChange) {
                    return react_1.default.createElement(bootstrap_2.Toggle, { value: value || "left", onChange: onChange, options: [
                            { value: "left", label: react_1.default.createElement("i", { className: "fa fa-align-left" }) },
                            { value: "center", label: react_1.default.createElement("i", { className: "fa fa-align-center" }) },
                            { value: "right", label: react_1.default.createElement("i", { className: "fa fa-align-right" }) },
                            { value: "justify", label: react_1.default.createElement("i", { className: "fa fa-align-justify" }) }
                        ] });
                })),
            !this.blockDef.markdown ?
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "multiline" }, function (value, onChange) { return react_1.default.createElement(bootstrap_2.Checkbox, { value: value, onChange: onChange }, "Multi-line"); })
                : null,
            react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "markdown" }, function (value, onChange) { return react_1.default.createElement(bootstrap_2.Checkbox, { value: value, onChange: onChange }, "Markdown"); }),
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Color" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "color" }, function (value, onChange) {
                    // Had to use "as any" due to Tyepscript bug
                    return react_1.default.createElement(bootstrap_1.Select, { value: value, onChange: onChange, options: [
                            { value: null, label: "Default" },
                            { value: "muted", label: "Muted" },
                            { value: "primary", label: "Primary" },
                            { value: "success", label: "Success" },
                            { value: "info", label: "Info" },
                            { value: "warning", label: "Warning" },
                            { value: "danger", label: "Danger" }
                        ] });
                }))));
    };
    return TextualBlock;
}(LeafBlock_1.default));
exports.TextualBlock = TextualBlock;
