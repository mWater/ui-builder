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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var immer_1 = __importDefault(require("immer"));
var React = __importStar(require("react"));
var blocks_1 = require("../blocks");
var localization_1 = require("../localization");
var propertyEditors_1 = require("../propertyEditors");
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
        return (React.createElement("div", { style: { paddingTop: 5, paddingBottom: 5 } },
            React.createElement("div", { key: "label" },
                React.createElement("span", { key: "label", style: { fontWeight: "bold" } }, labelText ? labelText : React.createElement("span", { className: "text-muted" }, "Label")),
                hintText ?
                    React.createElement("span", { key: "hint", className: "text-muted" },
                        " - ",
                        hintText)
                    : null),
            props.renderChildBlock(props, this.blockDef.child, handleAdd),
            React.createElement("p", { className: "help-block", style: { marginLeft: 5 } }, helpText)));
    };
    LabeledBlock.prototype.renderInstance = function (props) {
        var labelText = localization_1.localize(this.blockDef.label, props.locale);
        var hintText = localization_1.localize(this.blockDef.hint, props.locale);
        var helpText = localization_1.localize(this.blockDef.help, props.locale);
        return (React.createElement("div", { style: { paddingTop: 5, paddingBottom: 5 } },
            React.createElement("div", { key: "label" },
                React.createElement("span", { key: "label", style: { fontWeight: "bold" } }, labelText),
                hintText ?
                    React.createElement("span", { key: "hint", className: "text-muted" },
                        " - ",
                        hintText)
                    : null),
            props.renderChildBlock(props, this.blockDef.child),
            React.createElement("p", { className: "help-block", style: { marginLeft: 5 } }, helpText)));
    };
    LabeledBlock.prototype.renderEditor = function (props) {
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Label" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "label" }, function (value, onChange) { return React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }); })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Hint" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "hint" }, function (value, onChange) { return React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }); })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Help" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "help" }, function (value, onChange) { return React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }); }))));
    };
    return LabeledBlock;
}(blocks_1.Block));
exports.LabeledBlock = LabeledBlock;
