"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextualBlock = void 0;
const LeafBlock_1 = __importDefault(require("../LeafBlock"));
const react_1 = __importDefault(require("react"));
const propertyEditors_1 = require("../propertyEditors");
const bootstrap_1 = require("react-library/lib/bootstrap");
const bootstrap_2 = require("react-library/lib/bootstrap");
const markdown_it_1 = __importDefault(require("markdown-it"));
const dompurify_1 = require("dompurify");
class TextualBlock extends LeafBlock_1.default {
    getClassName() {
        if (this.blockDef.color) {
            return "text-" + this.blockDef.color;
        }
        return "";
    }
    /** Gets applied styles as CSS properties */
    getStyle() {
        const style = {};
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
    }
    /** Renders content with the appropriate styling. If markdown, should already be processed */
    renderText(content) {
        const style = this.getStyle();
        return react_1.default.createElement(this.blockDef.style || "div", { style: style, className: this.getClassName() }, content);
    }
    /** Processes markdown*/
    processMarkdown(text) {
        return react_1.default.createElement("div", { dangerouslySetInnerHTML: { __html: new markdown_it_1.default().render(text) } });
    }
    /** Processes HTML */
    processHTML(text) {
        return react_1.default.createElement("div", { dangerouslySetInnerHTML: { __html: (0, dompurify_1.sanitize)(text) } });
    }
    canonicalize() {
        if (this.blockDef.html && this.blockDef.markdown) {
            return Object.assign(Object.assign({}, this.blockDef), { markdown: false });
        }
        return this.blockDef;
    }
    renderTextualEditor(props) {
        return (react_1.default.createElement("div", null,
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Style" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "style" }, (value, onChange) => react_1.default.createElement(bootstrap_1.Select, { value: value || "div", onChange: onChange, options: [
                        { value: "div", label: "Plain Text" },
                        { value: "p", label: "Paragraph" },
                        { value: "h1", label: "Heading 1" },
                        { value: "h2", label: "Heading 2" },
                        { value: "h3", label: "Heading 3" },
                        { value: "h4", label: "Heading 4" },
                        { value: "h5", label: "Heading 5" }
                    ] }))),
            react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "bold" }, (value, onChange) => react_1.default.createElement(bootstrap_2.Checkbox, { value: value, onChange: onChange }, "Bold")),
            react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "italic" }, (value, onChange) => react_1.default.createElement(bootstrap_2.Checkbox, { value: value, onChange: onChange }, "Italic")),
            react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "underline" }, (value, onChange) => react_1.default.createElement(bootstrap_2.Checkbox, { value: value, onChange: onChange }, "Underline")),
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Alignment" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "align" }, (value, onChange) => react_1.default.createElement(bootstrap_2.Toggle, { value: value || "left", onChange: onChange, options: [
                        { value: "left", label: react_1.default.createElement("i", { className: "fa fa-align-left" }) },
                        { value: "center", label: react_1.default.createElement("i", { className: "fa fa-align-center" }) },
                        { value: "right", label: react_1.default.createElement("i", { className: "fa fa-align-right" }) },
                        { value: "justify", label: react_1.default.createElement("i", { className: "fa fa-align-justify" }) }
                    ] }))),
            react_1.default.createElement("div", null,
                !this.blockDef.html ?
                    react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "markdown" }, (value, onChange) => react_1.default.createElement(bootstrap_2.Checkbox, { inline: true, value: value, onChange: onChange }, "Markdown"))
                    : null,
                !this.blockDef.markdown ?
                    react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "html" }, (value, onChange) => react_1.default.createElement(bootstrap_2.Checkbox, { inline: true, value: value, onChange: onChange }, "HTML"))
                    : null,
                !this.blockDef.markdown && !this.blockDef.html ?
                    react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "multiline" }, (value, onChange) => react_1.default.createElement(bootstrap_2.Checkbox, { inline: true, value: value, onChange: onChange }, "Multi-line"))
                    : null),
            react_1.default.createElement("br", null),
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Color" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "color" }, (value, onChange) => 
                // Had to use "as any" due to Tyepscript bug
                react_1.default.createElement(bootstrap_1.Select, { value: value, onChange: onChange, options: [
                        { value: null, label: "Default" },
                        { value: "muted", label: "Muted" },
                        { value: "primary", label: "Primary" },
                        { value: "success", label: "Success" },
                        { value: "info", label: "Info" },
                        { value: "warning", label: "Warning" },
                        { value: "danger", label: "Danger" }
                    ] })))));
    }
}
exports.TextualBlock = TextualBlock;
