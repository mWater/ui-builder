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
exports.LabeledBlock = void 0;
var immer_1 = __importDefault(require("immer"));
var React = __importStar(require("react"));
var blocks_1 = require("../blocks");
var localization_1 = require("../localization");
var propertyEditors_1 = require("../propertyEditors");
var bootstrap_1 = require("react-library/lib/bootstrap");
var LabeledBlock = /** @class */ (function (_super) {
    __extends(LabeledBlock, _super);
    function LabeledBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LabeledBlock.prototype.getChildren = function (contextVars) {
        return this.blockDef.child ? [{ blockDef: this.blockDef.child, contextVars: contextVars }] : [];
    };
    LabeledBlock.prototype.validate = function () { return null; };
    LabeledBlock.prototype.processChildren = function (action) {
        var child = action(this.blockDef.child);
        return immer_1.default(this.blockDef, function (draft) {
            draft.child = child;
        });
    };
    LabeledBlock.prototype.renderDesign = function (props) {
        var _this = this;
        var handleAdd = function (addedBlockDef) {
            props.store.alterBlock(_this.id, immer_1.default(function (b) {
                b.child = addedBlockDef;
                return b;
            }), addedBlockDef.id);
        };
        var labelText = localization_1.localize(this.blockDef.label, props.locale);
        var hintText = localization_1.localize(this.blockDef.hint, props.locale);
        var helpText = localization_1.localize(this.blockDef.help, props.locale);
        return this.blockDef.layout == "horizontal" ?
            React.createElement(HorizLabeledControl, { designMode: true, labelText: labelText || "Label", hintText: hintText, helpText: helpText, requiredStar: this.blockDef.requiredStar }, props.renderChildBlock(props, this.blockDef.child, handleAdd))
            :
                React.createElement(StackedLabeledControl, { labelText: labelText || "Label", hintText: hintText, helpText: helpText, requiredStar: this.blockDef.requiredStar }, props.renderChildBlock(props, this.blockDef.child, handleAdd));
    };
    LabeledBlock.prototype.renderInstance = function (props) {
        var labelText = localization_1.localize(this.blockDef.label, props.locale);
        var hintText = localization_1.localize(this.blockDef.hint, props.locale);
        var helpText = localization_1.localize(this.blockDef.help, props.locale);
        return this.blockDef.layout == "horizontal" ?
            React.createElement(HorizLabeledControl, { labelText: labelText || "Label", hintText: hintText, helpText: helpText, requiredStar: this.blockDef.requiredStar }, props.renderChildBlock(props, this.blockDef.child))
            :
                React.createElement(StackedLabeledControl, { labelText: labelText, hintText: hintText, helpText: helpText, requiredStar: this.blockDef.requiredStar }, props.renderChildBlock(props, this.blockDef.child));
    };
    LabeledBlock.prototype.renderEditor = function (props) {
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Label" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "label" }, function (value, onChange) { return React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }); })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Hint" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "hint" }, function (value, onChange) { return React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }); })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Help" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "help" }, function (value, onChange) { return React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }); })),
            React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "requiredStar" }, function (value, onChange) { return React.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange }, "Show required star"); }),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Layout" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "layout" }, function (value, onChange) {
                    return React.createElement(bootstrap_1.Toggle, { value: value || "stacked", onChange: onChange, options: [
                            { value: "stacked", label: "Stacked" },
                            { value: "horizontal", label: "Horizontal" }
                        ] });
                }))));
    };
    return LabeledBlock;
}(blocks_1.Block));
exports.LabeledBlock = LabeledBlock;
function StackedLabeledControl(props) {
    return React.createElement("div", { style: { paddingTop: 5, paddingBottom: 5 } },
        React.createElement("div", { key: "label" },
            React.createElement("span", { key: "label", style: { fontWeight: "bold" } }, props.labelText),
            props.requiredStar ?
                React.createElement("span", { style: { color: "red", paddingLeft: 2 } }, "*")
                : null,
            props.hintText ?
                React.createElement("span", { key: "hint", className: "text-muted" },
                    " - ",
                    props.hintText)
                : null),
        props.children,
        props.helpText ?
            React.createElement("p", { className: "help-block", style: { marginLeft: 5 } }, props.helpText)
            : null);
}
function HorizLabeledControl(props) {
    return React.createElement("div", { style: { paddingTop: 5, paddingBottom: 5, display: "grid", gridTemplateColumns: "auto 1fr", gridTemplateRows: "auto auto", alignItems: "center" } },
        React.createElement("div", { key: "label", style: { paddingTop: props.designMode ? 2 : undefined, marginRight: 5 } },
            React.createElement("span", { key: "label", style: { fontWeight: "bold" } }, props.labelText),
            props.requiredStar ?
                React.createElement("span", { style: { color: "red", paddingLeft: 2 } }, "*")
                : null),
        React.createElement("div", { key: "content" }, props.children),
        React.createElement("div", { key: "blank" }),
        React.createElement("div", { key: "help", style: { marginLeft: 5 } },
            React.createElement("span", { key: "hint", className: "text-muted", style: { marginLeft: 5 } }, props.hintText),
            React.createElement("span", { key: "help", style: { marginLeft: 5 } }, props.helpText)));
}
