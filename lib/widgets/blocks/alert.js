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
exports.AlertBlock = void 0;
var immer_1 = __importDefault(require("immer"));
var React = __importStar(require("react"));
var blocks_1 = require("../blocks");
var propertyEditors_1 = require("../propertyEditors");
var bootstrap_1 = require("react-library/lib/bootstrap");
var AlertBlock = /** @class */ (function (_super) {
    __extends(AlertBlock, _super);
    function AlertBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AlertBlock.prototype.getChildren = function (contextVars) {
        return this.blockDef.content ? [{ blockDef: this.blockDef.content, contextVars: contextVars }] : [];
    };
    AlertBlock.prototype.validate = function () { return null; };
    AlertBlock.prototype.processChildren = function (action) {
        var content = action(this.blockDef.content);
        return immer_1.default(this.blockDef, function (draft) {
            draft.content = content;
        });
    };
    AlertBlock.prototype.renderDesign = function (props) {
        var _this = this;
        var handleAdd = function (addedBlockDef) {
            props.store.alterBlock(_this.id, immer_1.default(function (b) {
                b.content = addedBlockDef;
                return b;
            }), addedBlockDef.id);
        };
        return (React.createElement("div", { className: "alert alert-" + this.blockDef.style }, props.renderChildBlock(props, this.blockDef.content, handleAdd)));
    };
    AlertBlock.prototype.renderInstance = function (props) {
        return (React.createElement("div", { className: "alert alert-" + this.blockDef.style }, props.renderChildBlock(props, this.blockDef.content)));
    };
    AlertBlock.prototype.renderEditor = function (designCtx) {
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Style" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: designCtx.store.replaceBlock, property: "style" }, function (value, onChange) {
                    return React.createElement(bootstrap_1.Select, { value: value || null, onChange: onChange, options: [
                            { value: "info", label: "Info" },
                            { value: "success", label: "Success" },
                            { value: "warning", label: "Warning" },
                            { value: "danger", label: "Danger" }
                        ] });
                }))));
    };
    return AlertBlock;
}(blocks_1.Block));
exports.AlertBlock = AlertBlock;
