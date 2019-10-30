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
var bootstrap_1 = require("react-library/lib/bootstrap");
var immer_1 = __importDefault(require("immer"));
/** Simple static image block */
var ImageBlock = /** @class */ (function (_super) {
    __extends(ImageBlock, _super);
    function ImageBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ImageBlock.prototype.validate = function (designCtx) {
        if (!this.blockDef.url) {
            return "URL required";
        }
        var error;
        // Validate action
        if (this.blockDef.clickActionDef) {
            var action = designCtx.actionLibrary.createAction(this.blockDef.clickActionDef);
            error = action.validate(designCtx);
            if (error) {
                return error;
            }
        }
        return null;
    };
    ImageBlock.prototype.getContextVarExprs = function (contextVar, ctx) {
        // Include action expressions
        if (this.blockDef.clickActionDef) {
            var action = ctx.actionLibrary.createAction(this.blockDef.clickActionDef);
            return action.getContextVarExprs(contextVar);
        }
        return [];
    };
    ImageBlock.prototype.renderImage = function (locale, handleClick) {
        if (!this.blockDef.url) {
            return React.createElement("i", { className: "fa fa-picture-o" });
        }
        var url;
        if (this.blockDef.localizedUrls && this.blockDef.localizedUrls[locale]) {
            url = this.blockDef.localizedUrls[locale];
        }
        else {
            url = this.blockDef.url;
        }
        var divStyle = {};
        var imageStyle = {};
        var sizeMode = this.blockDef.sizeMode || "normal";
        if (sizeMode == "normal") {
            imageStyle.maxWidth = "100%";
        }
        else if (sizeMode == "fullwidth") {
            imageStyle.width = "100%";
        }
        else if (sizeMode == "banner") {
            imageStyle.width = "100%";
            divStyle.margin = "-15px -20px 0px -20px";
        }
        divStyle.textAlign = this.blockDef.align;
        return (React.createElement("div", { onClick: handleClick, style: divStyle },
            React.createElement("img", { src: url, style: imageStyle })));
    };
    ImageBlock.prototype.renderDesign = function (props) {
        return this.renderImage(props.locale);
    };
    ImageBlock.prototype.renderInstance = function (instanceCtx) {
        var _this = this;
        var handleClick = function () {
            // Run action
            if (_this.blockDef.clickActionDef) {
                var action = instanceCtx.actionLibrary.createAction(_this.blockDef.clickActionDef);
                action.performAction(instanceCtx);
            }
        };
        return this.renderImage(instanceCtx.locale, handleClick);
    };
    ImageBlock.prototype.renderEditor = function (props) {
        var _this = this;
        var locales = [
            "en",
            "fr",
            "es",
            "pt",
            "sw",
            "tet",
            "id",
            "ht",
            "my",
            "km",
            "bn",
            "am"
        ];
        var localizedUrls = this.blockDef.localizedUrls || {};
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "URL" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "url" }, function (value, onChange) { return React.createElement(bootstrap_1.TextInput, { value: value || null, onChange: onChange }); })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Size Mode" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "sizeMode" }, function (value, onChange) {
                    return React.createElement(bootstrap_1.Select, { value: value || "normal", onChange: onChange, options: [
                            { value: "normal", label: "Normal" },
                            { value: "fullwidth", label: "Full width" },
                            { value: "banner", label: "Banner" }
                        ] });
                })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Alignment" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "align" }, function (value, onChange) {
                    return React.createElement(bootstrap_1.Toggle, { value: value || "left", onChange: onChange, options: [
                            { value: "left", label: React.createElement("i", { className: "fa fa-align-left" }) },
                            { value: "center", label: React.createElement("i", { className: "fa fa-align-center" }) },
                            { value: "right", label: React.createElement("i", { className: "fa fa-align-right" }) },
                        ] });
                })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "When image clicked" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "clickActionDef" }, function (value, onChange) { return (React.createElement(propertyEditors_1.ActionDefEditor, { value: value, onChange: onChange, designCtx: props })); })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Locale-specific URL overrides" }, locales.map(function (locale) {
                var onChange = function (url) {
                    props.store.replaceBlock(immer_1.default(_this.blockDef, function (bd) {
                        if (url) {
                            bd.localizedUrls = bd.localizedUrls || {};
                            bd.localizedUrls[locale] = url;
                        }
                        else {
                            bd.localizedUrls = bd.localizedUrls || {};
                            delete bd.localizedUrls[locale];
                        }
                    }));
                };
                return React.createElement(propertyEditors_1.LabeledProperty, { label: locale },
                    React.createElement(bootstrap_1.TextInput, { value: localizedUrls[locale], onChange: onChange, emptyNull: true }));
            }))));
    };
    return ImageBlock;
}(LeafBlock_1.default));
exports.ImageBlock = ImageBlock;
