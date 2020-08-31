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
var lodash_1 = __importDefault(require("lodash"));
var React = __importStar(require("react"));
var LeafBlock_1 = __importDefault(require("../LeafBlock"));
var propertyEditors_1 = require("../propertyEditors");
var localization_1 = require("../localization");
var bootstrap_1 = require("react-library/lib/bootstrap");
var embeddedExprs_1 = require("../../embeddedExprs");
var ButtonBlock = /** @class */ (function (_super) {
    __extends(ButtonBlock, _super);
    function ButtonBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ButtonBlock.prototype.validate = function (designCtx) {
        var error;
        // Validate expressions
        error = embeddedExprs_1.validateEmbeddedExprs({
            embeddedExprs: this.blockDef.labelEmbeddedExprs || [],
            schema: designCtx.schema,
            contextVars: designCtx.contextVars
        });
        if (error) {
            return error;
        }
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
        var exprs = [];
        if (this.blockDef.labelEmbeddedExprs) {
            exprs = exprs.concat(lodash_1.default.compact(lodash_1.default.map(this.blockDef.labelEmbeddedExprs, function (ee) { return ee.contextVarId === contextVar.id ? ee.expr : null; })));
        }
        // Include action expressions
        if (this.blockDef.actionDef) {
            var action = ctx.actionLibrary.createAction(this.blockDef.actionDef);
            exprs = exprs.concat(action.getContextVarExprs(contextVar));
        }
        return exprs;
    };
    ButtonBlock.prototype.renderButton = function (label, onClick) {
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
        var handleClick = function (ev) {
            // Ensure button doesn't trigger other actions
            ev.stopPropagation();
            onClick();
        };
        return (React.createElement("button", { type: "button", className: className, onClick: handleClick, style: style },
            icon,
            icon && label ? "\u00A0" : null,
            label));
    };
    ButtonBlock.prototype.renderDesign = function (props) {
        var label = localization_1.localize(this.blockDef.label, props.locale);
        return this.renderButton(label, (function () { return null; }));
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
        // Get label
        var label = localization_1.localize(this.blockDef.label, instanceCtx.locale);
        if (label) {
            // Get any embedded expression values
            var exprValues = lodash_1.default.map(this.blockDef.labelEmbeddedExprs || [], function (ee) { return instanceCtx.getContextVarExprValue(ee.contextVarId, ee.expr); });
            // Format and replace
            label = embeddedExprs_1.formatEmbeddedExprString({
                text: label,
                embeddedExprs: this.blockDef.labelEmbeddedExprs || [],
                exprValues: exprValues,
                schema: instanceCtx.schema,
                contextVars: instanceCtx.contextVars,
                locale: instanceCtx.locale,
                formatLocale: instanceCtx.formatLocale
            });
        }
        return this.renderButton(label, handleClick);
    };
    ButtonBlock.prototype.renderEditor = function (props) {
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Label" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "label" }, function (value, onChange) { return React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }); })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Label embedded expressions", help: "Reference in text as {0}, {1}, etc." },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "labelEmbeddedExprs" }, function (value, onChange) { return (React.createElement(propertyEditors_1.EmbeddedExprsEditor, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, contextVars: props.contextVars })); })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Style" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "style" }, function (value, onChange) {
                    return React.createElement(bootstrap_1.Toggle, { value: value, onChange: onChange, options: [
                            { value: "default", label: "Default" },
                            { value: "primary", label: "Primary" },
                            { value: "link", label: "Link" },
                        ] });
                })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Size" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "size" }, function (value, onChange) {
                    return React.createElement(bootstrap_1.Toggle, { value: value, onChange: onChange, options: [
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
