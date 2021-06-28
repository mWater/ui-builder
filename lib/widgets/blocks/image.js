"use strict";
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
exports.ImageBlock = void 0;
const React = __importStar(require("react"));
const LeafBlock_1 = __importDefault(require("../LeafBlock"));
const propertyEditors_1 = require("../propertyEditors");
const bootstrap_1 = require("react-library/lib/bootstrap");
const immer_1 = __importDefault(require("immer"));
require("./image.css");
/** Simple static image block */
class ImageBlock extends LeafBlock_1.default {
    validate(designCtx) {
        if (!this.blockDef.url) {
            return "URL required";
        }
        let error;
        // Validate action
        if (this.blockDef.clickActionDef) {
            const action = designCtx.actionLibrary.createAction(this.blockDef.clickActionDef);
            error = action.validate(designCtx);
            if (error) {
                return error;
            }
        }
        return null;
    }
    renderImage(locale, handleClick) {
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
        const sizeMode = this.blockDef.sizeMode || "normal";
        return (React.createElement("div", { onClick: handleClick, className: `image-block-div-${sizeMode}`, style: { textAlign: this.blockDef.align } },
            React.createElement("img", { src: url, className: `image-block-img-${sizeMode}` })));
    }
    renderDesign(props) {
        return this.renderImage(props.locale);
    }
    renderInstance(instanceCtx) {
        const handleClick = () => {
            // Run action
            if (this.blockDef.clickActionDef) {
                const action = instanceCtx.actionLibrary.createAction(this.blockDef.clickActionDef);
                action.performAction(instanceCtx);
            }
        };
        return this.renderImage(instanceCtx.locale, handleClick);
    }
    renderEditor(props) {
        const locales = [
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
        const localizedUrls = this.blockDef.localizedUrls || {};
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "URL" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "url" }, (value, onChange) => React.createElement(bootstrap_1.TextInput, { value: value || null, onChange: onChange }))),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Size Mode" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "sizeMode" }, (value, onChange) => React.createElement(bootstrap_1.Select, { value: value || "normal", onChange: onChange, options: [
                        { value: "normal", label: "Normal" },
                        { value: "fullwidth", label: "Full width" },
                        { value: "banner", label: "Banner (deprecated)" }
                    ] }))),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Alignment" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "align" }, (value, onChange) => React.createElement(bootstrap_1.Toggle, { value: value || "left", onChange: onChange, options: [
                        { value: "left", label: React.createElement("i", { className: "fa fa-align-left" }) },
                        { value: "center", label: React.createElement("i", { className: "fa fa-align-center" }) },
                        { value: "right", label: React.createElement("i", { className: "fa fa-align-right" }) },
                    ] }))),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "When image clicked" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "clickActionDef" }, (value, onChange) => (React.createElement(propertyEditors_1.ActionDefEditor, { value: value, onChange: onChange, designCtx: props })))),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Locale-specific URL overrides" }, locales.map(locale => {
                const onChange = (url) => {
                    props.store.replaceBlock(immer_1.default(this.blockDef, bd => {
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
    }
}
exports.ImageBlock = ImageBlock;
