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
var localization_1 = require("../localization");
var bootstrap_1 = require("react-library/lib/bootstrap");
var ButtonBlock = /** @class */ (function (_super) {
    __extends(ButtonBlock, _super);
    function ButtonBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ButtonBlock.prototype.validate = function (options) {
        var error;
        // Validate action
        if (this.blockDef.actionDef) {
            var action = options.actionLibrary.createAction(this.blockDef.actionDef);
            error = action.validate({
                schema: options.schema,
                contextVars: options.contextVars,
                widgetLibrary: options.widgetLibrary
            });
            if (error) {
                return error;
            }
        }
        return null;
    };
    ButtonBlock.prototype.getContextVarExprs = function (contextVar, widgetLibrary, actionLibrary) {
        // Include action expressions
        if (this.blockDef.actionDef) {
            var action = actionLibrary.createAction(this.blockDef.actionDef);
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
            case "large":
                className += " btn-lg";
                break;
        }
        return (React.createElement("button", { type: "button", className: className, onClick: onClick, style: { margin: 5 } }, label));
    };
    ButtonBlock.prototype.renderDesign = function (props) {
        return this.renderButton(props.locale, (function () { return null; }));
    };
    ButtonBlock.prototype.renderInstance = function (props) {
        var _this = this;
        var handleClick = function () {
            // Confirm if confirm message
            if (_this.blockDef.confirmMessage) {
                if (!confirm(localization_1.localize(_this.blockDef.confirmMessage, props.locale))) {
                    return;
                }
            }
            // Run action
            if (_this.blockDef.actionDef) {
                var action = props.actionLibrary.createAction(_this.blockDef.actionDef);
                action.performAction({
                    contextVars: props.contextVars,
                    database: props.database,
                    schema: props.schema,
                    locale: props.locale,
                    contextVarValues: props.contextVarValues,
                    pageStack: props.pageStack,
                    getContextVarExprValue: props.getContextVarExprValue
                });
            }
        };
        return this.renderButton(props.locale, handleClick);
    };
    ButtonBlock.prototype.renderEditor = function (props) {
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Text" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "label" }, function (value, onChange) { return React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }); })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Style" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "style" }, function (value, onChange) {
                    return React.createElement(bootstrap_1.Select, { value: value, onChange: onChange, options: [
                            { value: "default", label: "Default" },
                            { value: "primary", label: "Primary" },
                            { value: "link", label: "Link" },
                        ] });
                })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Size" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "size" }, function (value, onChange) {
                    return React.createElement(bootstrap_1.Select, { value: value, onChange: onChange, options: [
                            { value: "normal", label: "Default" },
                            { value: "small", label: "Small" },
                            { value: "large", label: "Large" }
                        ] });
                })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "When button clicked" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "actionDef" }, function (value, onChange) { return (React.createElement(propertyEditors_1.ActionDefEditor, { value: value, onChange: onChange, locale: props.locale, schema: props.schema, dataSource: props.dataSource, actionLibrary: props.actionLibrary, widgetLibrary: props.widgetLibrary, contextVars: props.contextVars })); })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Confirm message" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "confirmMessage" }, function (value, onChange) { return React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }); }))));
    };
    return ButtonBlock;
}(LeafBlock_1.default));
exports.ButtonBlock = ButtonBlock;
