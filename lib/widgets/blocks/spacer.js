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
exports.SpacerBlock = void 0;
var React = __importStar(require("react"));
var LeafBlock_1 = __importDefault(require("../LeafBlock"));
var propertyEditors_1 = require("../propertyEditors");
var bootstrap_1 = require("react-library/lib/bootstrap");
/** Creates a fixed size spacer to separate blocks */
var SpacerBlock = /** @class */ (function (_super) {
    __extends(SpacerBlock, _super);
    function SpacerBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SpacerBlock.prototype.validate = function () { return null; };
    SpacerBlock.prototype.renderDesign = function (props) {
        var style = {
            backgroundImage: "linear-gradient(45deg, #dddddd 8.33%, #ffffff 8.33%, #ffffff 50%, #dddddd 50%, #dddddd 58.33%, #ffffff 58.33%, #ffffff 100%)",
            backgroundSize: "8.49px 8.49px"
        };
        if (this.blockDef.width) {
            style.width = this.blockDef.width + "em";
        }
        if (this.blockDef.height) {
            style.height = this.blockDef.height + "em";
        }
        return React.createElement("div", { style: style });
    };
    SpacerBlock.prototype.renderInstance = function (props) {
        var style = {};
        if (this.blockDef.width) {
            style.width = this.blockDef.width + "em";
        }
        if (this.blockDef.height) {
            style.height = this.blockDef.height + "em";
        }
        return React.createElement("div", { style: style });
    };
    SpacerBlock.prototype.renderEditor = function (props) {
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Width in ems (blank for auto)" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "width" }, function (value, onChange) { return React.createElement(bootstrap_1.NumberInput, { value: value, onChange: onChange, decimal: true }); })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Height in ems (blank for auto)" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "height" }, function (value, onChange) { return React.createElement(bootstrap_1.NumberInput, { value: value, onChange: onChange, decimal: true }); }))));
    };
    return SpacerBlock;
}(LeafBlock_1.default));
exports.SpacerBlock = SpacerBlock;
