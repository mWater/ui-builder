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
exports.FloatBlock = void 0;
var React = __importStar(require("react"));
var _ = __importStar(require("lodash"));
var blocks_1 = require("../blocks");
var propertyEditors_1 = require("../propertyEditors");
var bootstrap_1 = require("react-library/lib/bootstrap");
var immer_1 = __importDefault(require("immer"));
var FloatBlock = /** @class */ (function (_super) {
    __extends(FloatBlock, _super);
    function FloatBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FloatBlock.prototype.getChildren = function (contextVars) {
        // Get for all cells
        return _.compact([this.blockDef.mainContent, this.blockDef.floatContent]).map(function (bd) { return ({ blockDef: bd, contextVars: contextVars }); });
    };
    FloatBlock.prototype.validate = function () { return null; };
    FloatBlock.prototype.processChildren = function (action) {
        var _this = this;
        return immer_1.default(this.blockDef, function (draft) {
            draft.mainContent = action(_this.blockDef.mainContent);
            draft.floatContent = action(_this.blockDef.floatContent);
        });
    };
    FloatBlock.prototype.renderDesign = function (props) {
        var _this = this;
        var handleSetMainContent = function (blockDef) {
            props.store.alterBlock(_this.id, immer_1.default(function (b) {
                b.mainContent = blockDef;
            }), blockDef.id);
        };
        var handleSetFloatContent = function (blockDef) {
            props.store.alterBlock(_this.id, immer_1.default(function (b) {
                b.floatContent = blockDef;
            }), blockDef.id);
        };
        var mainContentNode = props.renderChildBlock(props, this.blockDef.mainContent, handleSetMainContent);
        var floatContentNode = props.renderChildBlock(props, this.blockDef.floatContent, handleSetFloatContent);
        return React.createElement(FloatComponent, { float: floatContentNode, main: mainContentNode, direction: this.blockDef.direction, verticalAlign: this.blockDef.verticalAlign });
    };
    FloatBlock.prototype.renderInstance = function (props) {
        var mainContentNode = props.renderChildBlock(props, this.blockDef.mainContent);
        var floatContentNode = props.renderChildBlock(props, this.blockDef.floatContent);
        return React.createElement(FloatComponent, { float: floatContentNode, main: mainContentNode, direction: this.blockDef.direction, verticalAlign: this.blockDef.verticalAlign });
    };
    FloatBlock.prototype.renderEditor = function (props) {
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Direction" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "direction" }, function (value, onChange) {
                    return React.createElement(bootstrap_1.Toggle, { value: value, onChange: onChange, options: [
                            { value: "left", label: React.createElement("i", { className: "fa fa-align-left" }) },
                            { value: "right", label: React.createElement("i", { className: "fa fa-align-right" }) }
                        ] });
                })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Vertical Alignment" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "verticalAlign" }, function (value, onChange) {
                    return React.createElement(bootstrap_1.Toggle, { value: value, onChange: onChange, options: [
                            { value: "top", label: "Top" },
                            { value: "middle", label: "Middle" },
                            { value: "bottom", label: "Bottom" }
                        ] });
                }))));
    };
    return FloatBlock;
}(blocks_1.Block));
exports.FloatBlock = FloatBlock;
var FloatComponent = function (props) {
    return (React.createElement("table", { style: { width: "100%" } },
        React.createElement("tbody", null,
            React.createElement("tr", { key: "float" },
                props.direction == "left" ? React.createElement("td", { key: "left", style: { verticalAlign: props.verticalAlign } }, props.float) : null,
                React.createElement("td", { key: "main", style: { width: "100%", verticalAlign: props.verticalAlign } }, props.main),
                props.direction == "right" ? React.createElement("td", { key: "right", style: { verticalAlign: props.verticalAlign } }, props.float) : null))));
};
