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
exports.ButtonBlock = void 0;
var React = __importStar(require("react"));
var LeafBlock_1 = __importDefault(require("../LeafBlock"));
var propertyEditors_1 = require("../propertyEditors");
var localization_1 = require("../localization");
var bootstrap_1 = require("react-library/lib/bootstrap");
var ButtonBlock = /** @class */ (function (_super) {
    __extends(ButtonBlock, _super);
    function ButtonBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ButtonBlock.prototype.validate = function (designCtx) {
        var error;
        // Validate action
        if (this.blockDef.actionDef) {
            var action = designCtx.actionLibrary.createAction(this.blockDef.actionDef);
            error = action.validate(designCtx);
            if (error) {
                return error;
            }
        }
        return null;
    };
    ButtonBlock.prototype.getContextVarExprs = function (contextVar, ctx) {
        // Include action expressions
        if (this.blockDef.actionDef) {
            var action = ctx.actionLibrary.createAction(this.blockDef.actionDef);
            return action.getContextVarExprs(contextVar);
        }
        return [];
    };
    ButtonBlock.prototype.renderButton = function (locale, onClick) {
        var label = localization_1.localize(this.blockDef.label, locale);
        var className = "btn btn-" + this.blockDef.style;
        switch (this.blockDef.size) {
            case "normal":
                break;
            case "small":
                className += " btn-sm";
                break;
            case "extrasmall":
                className += " btn-xs";
                break;
            case "large":
                className += " btn-lg";
                break;
        }
        if (this.blockDef.block) {
            className += " btn-block";
        }
        var icon = this.blockDef.icon ? React.createElement("i", { className: "fa fa-" + this.blockDef.icon }) : null;
        var style = {};
        if (!this.blockDef.block) {
            style.margin = 5;
        }
        return (React.createElement("button", { type: "button", className: className, onClick: onClick, style: style },
            icon,
            icon && label ? "\u00A0" : null,
            label));
    };
    ButtonBlock.prototype.renderDesign = function (props) {
        return this.renderButton(props.locale, (function () { return null; }));
    };
    ButtonBlock.prototype.renderInstance = function (instanceCtx) {
        var _this = this;
        var handleClick = function () {
            // Confirm if confirm message
            if (_this.blockDef.confirmMessage) {
                if (!confirm(localization_1.localize(_this.blockDef.confirmMessage, instanceCtx.locale))) {
                    return;
                }
            }
            // Run action
            if (_this.blockDef.actionDef) {
                var action = instanceCtx.actionLibrary.createAction(_this.blockDef.actionDef);
                action.performAction(instanceCtx);
            }
        };
        return this.renderButton(instanceCtx.locale, handleClick);
    };
    ButtonBlock.prototype.renderEditor = function (props) {
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Text" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "label" }, function (value, onChange) { return React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }); })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Style" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "style" }, function (value, onChange) {
                    return React.createElement(bootstrap_1.Select, { value: value, onChange: onChange, options: [
                            { value: "default", label: "Default" },
                            { value: "primary", label: "Primary" },
                            { value: "link", label: "Link" },
                        ] });
                })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Size" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "size" }, function (value, onChange) {
                    return React.createElement(bootstrap_1.Select, { value: value, onChange: onChange, options: [
                            { value: "normal", label: "Default" },
                            { value: "small", label: "Small" },
                            { value: "extrasmall", label: "Extra-small" },
                            { value: "large", label: "Large" }
                        ] });
                })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Icon" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "icon" }, function (value, onChange) {
                    return React.createElement(bootstrap_1.Select, { value: value, onChange: onChange, nullLabel: "None", options: [
                            { value: "plus", label: "Add" },
                            { value: "pencil", label: "Edit" },
                            { value: "times", label: "Remove" },
                            { value: "print", label: "Print" },
                            { value: "upload", label: "Upload" },
                            { value: "download", label: "Download" }
                        ] });
                })),
            React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "block" }, function (value, onChange) { return React.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange }, "Block-style"); }),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "When button clicked" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "actionDef" }, function (value, onChange) { return (React.createElement(propertyEditors_1.ActionDefEditor, { value: value, onChange: onChange, designCtx: props })); })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Confirm message" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "confirmMessage" }, function (value, onChange) { return React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }); }))));
    };
    return ButtonBlock;
}(LeafBlock_1.default));
exports.ButtonBlock = ButtonBlock;
