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
var ReactElementPrinter_1 = __importDefault(require("react-library/lib/ReactElementPrinter"));
var PrintBlock = /** @class */ (function (_super) {
    __extends(PrintBlock, _super);
    function PrintBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PrintBlock.prototype.getChildren = function (contextVars) {
        return this.blockDef.content ? [{ blockDef: this.blockDef.content, contextVars: contextVars }] : [];
    };
    PrintBlock.prototype.validate = function () { return null; };
    PrintBlock.prototype.processChildren = function (action) {
        var label = action(this.blockDef.label);
        var content = action(this.blockDef.content);
        return immer_1.default(this.blockDef, function (draft) {
            draft.label = label;
            draft.content = content;
        });
    };
    PrintBlock.prototype.renderDesign = function (props) {
        var _this = this;
        var handleAdd = function (addedBlockDef) {
            props.store.alterBlock(_this.id, immer_1.default(function (b) {
                b.content = addedBlockDef;
                return b;
            }), addedBlockDef.id);
        };
        return (React.createElement("div", null,
            React.createElement("div", { style: { textAlign: "right" } },
                React.createElement("button", { type: "button", className: "btn btn-link" },
                    React.createElement("i", { className: "fa fa-print" }))),
            props.renderChildBlock(props, this.blockDef.content, handleAdd)));
    };
    PrintBlock.prototype.renderInstance = function (props) {
        var elem = props.renderChildBlock(props, this.blockDef.content);
        var handleClick = function () {
            new ReactElementPrinter_1.default().print(elem, { delay: 5000 });
        };
        return (React.createElement("div", null,
            React.createElement("div", { style: { textAlign: "right" } },
                React.createElement("button", { type: "button", className: "btn btn-link", onClick: handleClick },
                    React.createElement("i", { className: "fa fa-print" }))),
            elem));
    };
    return PrintBlock;
}(blocks_1.Block));
exports.PrintBlock = PrintBlock;
