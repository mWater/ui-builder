"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
var CompoundBlock_1 = __importDefault(require("../CompoundBlock"));
var bootstrap_1 = require("react-library/lib/bootstrap");
var propertyEditors_1 = require("../propertyEditors");
var HorizontalBlock = /** @class */ (function (_super) {
    __extends(HorizontalBlock, _super);
    function HorizontalBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(HorizontalBlock.prototype, "id", {
        get: function () { return this.blockDef.id; },
        enumerable: true,
        configurable: true
    });
    HorizontalBlock.prototype.getChildren = function (contextVars) {
        return this.blockDef.items.map(function (bd) { return ({ blockDef: bd, contextVars: contextVars }); });
    };
    HorizontalBlock.prototype.validate = function () { return null; };
    HorizontalBlock.prototype.canonicalize = function () {
        // Remove if zero items
        if (this.blockDef.items.length === 0) {
            return null;
        }
        // Collapse if one item
        if (this.blockDef.items.length === 1) {
            return this.blockDef.items[0];
        }
        // Flatten out nested horizontal blocks
        return immer_1.default(this.blockDef, function (draft) {
            draft.items = draft.items.map(function (item) { return item.type === "horizontal" ? item.items : item; }).reduce(function (a, b) { return a.concat(b); }, []);
        });
    };
    HorizontalBlock.prototype.processChildren = function (action) {
        // Apply action to all children, discarding null ones
        return immer_1.default(this.blockDef, function (draft) {
            var newItems = [];
            for (var _i = 0, _a = draft.items; _i < _a.length; _i++) {
                var item = _a[_i];
                var newItem = action(item);
                if (newItem) {
                    newItems.push(newItem);
                }
            }
            draft.items = newItems;
        });
    };
    HorizontalBlock.prototype.renderBlock = function (children) {
        switch (this.blockDef.align || "justify") {
            case "justify":
                return (React.createElement("div", null, children.map(function (child, index) {
                    return (React.createElement("div", { key: index, style: { display: "inline-block", width: (100 / children.length) + "%", verticalAlign: "top" } }, child));
                })));
            case "left":
                return (React.createElement("div", null, children.map(function (child, index) {
                    return (React.createElement("div", { key: index, style: { display: "inline-block", verticalAlign: "top" } }, child));
                })));
            case "right":
                return (React.createElement("div", { style: { textAlign: "right" } }, children.map(function (child, index) {
                    return (React.createElement("div", { key: index, style: { display: "inline-block", verticalAlign: "top" } }, child));
                })));
            case "center":
                return (React.createElement("div", { style: { textAlign: "center" } }, children.map(function (child, index) {
                    return (React.createElement("div", { key: index, style: { display: "inline-block", verticalAlign: "top" } }, child));
                })));
        }
    };
    HorizontalBlock.prototype.renderDesign = function (props) {
        return (React.createElement("div", { style: { paddingTop: 5, paddingBottom: 5 } }, this.renderBlock(this.blockDef.items.map(function (childBlock) { return props.renderChildBlock(props, childBlock); }))));
    };
    HorizontalBlock.prototype.renderInstance = function (props) {
        return (React.createElement("div", { style: { paddingTop: 5, paddingBottom: 5 } }, this.renderBlock(this.blockDef.items.map(function (childBlockDef) { return props.renderChildBlock(props, childBlockDef); }))));
    };
    HorizontalBlock.prototype.renderEditor = function (props) {
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Alignment" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "align" }, function (value, onChange) {
                    return React.createElement(bootstrap_1.Toggle, { value: value || "justify", onChange: onChange, options: [
                            { value: "justify", label: React.createElement("i", { className: "fa fa-align-justify" }) },
                            { value: "left", label: React.createElement("i", { className: "fa fa-align-left" }) },
                            { value: "center", label: React.createElement("i", { className: "fa fa-align-center" }) },
                            { value: "right", label: React.createElement("i", { className: "fa fa-align-right" }) }
                        ] });
                }))));
    };
    return HorizontalBlock;
}(CompoundBlock_1.default));
exports.HorizontalBlock = HorizontalBlock;
//# sourceMappingURL=horizontal.js.map