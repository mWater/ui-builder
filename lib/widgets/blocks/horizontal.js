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
exports.HorizontalBlock = void 0;
var lodash_1 = __importDefault(require("lodash"));
var immer_1 = __importDefault(require("immer"));
var React = __importStar(require("react"));
var blocks_1 = require("../blocks");
var bootstrap_1 = require("react-library/lib/bootstrap");
var propertyEditors_1 = require("../propertyEditors");
var HorizontalBlock = /** @class */ (function (_super) {
    __extends(HorizontalBlock, _super);
    function HorizontalBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(HorizontalBlock.prototype, "id", {
        get: function () { return this.blockDef.id; },
        enumerable: false,
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
            var items = draft.items.map(function (item) { return item.type === "horizontal" ? item.items : item; });
            draft.items = items.reduce(function (a, b) { return a.concat(b); }, []);
        });
    };
    HorizontalBlock.prototype.processChildren = function (action) {
        var newItems = [];
        for (var _i = 0, _a = this.blockDef.items; _i < _a.length; _i++) {
            var item = _a[_i];
            var newItem = action(item);
            if (newItem) {
                newItems.push(newItem);
            }
        }
        // Apply action to all children, discarding null ones
        return immer_1.default(this.blockDef, function (draft) { draft.items = newItems; });
    };
    HorizontalBlock.prototype.renderBlock = function (children) {
        var align = this.blockDef.align || "justify";
        var columnWidths = this.blockDef.columnWidths || [];
        // Create columns
        var gridTemplateColumns = this.blockDef.items.map(function (item, index) {
            if (align == "justify") {
                return columnWidths[index] || "1fr";
            }
            return columnWidths[index] || "min-content";
        });
        // Create CSS grid with style
        var containerStyle = {
            display: "grid",
            gridGap: 5,
            gridTemplateColumns: gridTemplateColumns.join(" "),
            justifyContent: this.blockDef.align,
        };
        if (this.blockDef.verticalAlign == "middle") {
            containerStyle.alignItems = "center";
        }
        else if (this.blockDef.verticalAlign == "bottom") {
            containerStyle.alignItems = "end";
        }
        else {
            containerStyle.alignItems = "start";
        }
        return React.createElement("div", { style: containerStyle }, children.map(function (child, index) { return React.createElement(React.Fragment, { key: index }, child); }));
    };
    HorizontalBlock.prototype.renderDesign = function (props) {
        return (React.createElement("div", { style: { paddingTop: 5, paddingBottom: 5 } }, this.renderBlock(this.blockDef.items.map(function (childBlock) { return props.renderChildBlock(props, childBlock); }))));
    };
    HorizontalBlock.prototype.renderInstance = function (props) {
        return (React.createElement("div", null, this.renderBlock(this.blockDef.items.map(function (childBlockDef) { return props.renderChildBlock(props, childBlockDef); }))));
    };
    HorizontalBlock.prototype.renderEditor = function (props) {
        var _this = this;
        var align = this.blockDef.align || "justify";
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Horizontal Alignment" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "align" }, function (value, onChange) {
                    return React.createElement(bootstrap_1.Toggle, { value: value || "justify", onChange: onChange, options: [
                            { value: "justify", label: React.createElement("i", { className: "fa fa-align-justify" }) },
                            { value: "left", label: React.createElement("i", { className: "fa fa-align-left" }) },
                            { value: "center", label: React.createElement("i", { className: "fa fa-align-center" }) },
                            { value: "right", label: React.createElement("i", { className: "fa fa-align-right" }) }
                        ] });
                })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Vertical Alignment" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "verticalAlign" }, function (value, onChange) {
                    return React.createElement(bootstrap_1.Toggle, { value: value || "top", onChange: onChange, options: [
                            { value: "top", label: "Top" },
                            { value: "middle", label: "Middle" },
                            { value: "bottom", label: "Bottom" }
                        ] });
                })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Column Widths" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "columnWidths" }, function (value, onChange) {
                    return React.createElement(ColumnWidthsEditor, { numColumns: _this.blockDef.items.length, defaultWidth: align == "justify" ? "1fr" : "min-content", columnWidths: value || [], onChange: onChange });
                }))));
    };
    HorizontalBlock.prototype.getLabel = function () { return ""; };
    return HorizontalBlock;
}(blocks_1.Block));
exports.HorizontalBlock = HorizontalBlock;
var ColumnWidthsEditor = function (props) {
    return React.createElement("ul", { className: "list-group" }, lodash_1.default.range(props.numColumns).map(function (colIndex) {
        return React.createElement("li", { className: "list-group-item", key: colIndex },
            React.createElement(ColumnWidthEditor, { columnWidth: props.columnWidths[colIndex] || props.defaultWidth, onChange: function (width) { return props.onChange(immer_1.default(props.columnWidths, function (draft) {
                    draft[colIndex] = width;
                })); } }));
    }));
};
var ColumnWidthEditor = function (props) {
    return React.createElement(bootstrap_1.Select, { value: props.columnWidth, onChange: props.onChange, options: [
            { value: "min-content", label: "Fit" },
            { value: "1fr", label: "1 fraction" },
            { value: "2fr", label: "2 fraction" },
            { value: "3fr", label: "3 fraction" },
            { value: "minmax(min-content, 16%)", label: "1/6" },
            { value: "minmax(min-content, 25%)", label: "1/4" },
            { value: "minmax(min-content, 33%)", label: "1/3" },
            { value: "minmax(min-content, 50%)", label: "1/2" },
            { value: "minmax(min-content, 67%)", label: "2/3" },
            { value: "minmax(min-content, 75%)", label: "3/4" },
            { value: "minmax(min-content, 83%)", label: "5/6" },
            { value: "minmax(min-content, 100px)", label: "100px" },
            { value: "minmax(min-content, 200px)", label: "200px" },
            { value: "minmax(min-content, 300px)", label: "300px" },
            { value: "minmax(min-content, 400px)", label: "400px" },
            { value: "minmax(min-content, 500px)", label: "500px" }
        ] });
};
