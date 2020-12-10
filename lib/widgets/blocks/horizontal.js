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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HorizontalBlock = void 0;
var lodash_1 = __importDefault(require("lodash"));
var immer_1 = __importDefault(require("immer"));
var react_1 = __importDefault(require("react"));
var blocks_1 = require("../blocks");
var bootstrap_1 = require("react-library/lib/bootstrap");
var propertyEditors_1 = require("../propertyEditors");
var AutoSizeComponent_1 = __importDefault(require("react-library/lib/AutoSizeComponent"));
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
        if (this.blockDef.items.some(function (bd) { return bd.type == "horizontal"; })) {
            // Create list of items
            var newItems_1 = [];
            for (var _i = 0, _a = this.blockDef.items; _i < _a.length; _i++) {
                var item = _a[_i];
                if (item.type == "horizontal") {
                    newItems_1 = newItems_1.concat(item.items);
                }
                else {
                    newItems_1.push(item);
                }
            }
            return immer_1.default(this.blockDef, function (draft) {
                draft.items = newItems_1;
            });
        }
        return this.blockDef;
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
    HorizontalBlock.prototype.renderBlock = function (children, width) {
        var _this = this;
        var align = this.blockDef.align || "justify";
        var columnWidths = this.blockDef.columnWidths || [];
        var responsiveBreaks = this.blockDef.responsiveBreaks || [];
        // Determine alignment (vertical)
        var alignItems = "start";
        if (this.blockDef.verticalAlign == "middle") {
            alignItems = "center";
        }
        else if (this.blockDef.verticalAlign == "bottom") {
            alignItems = "end";
        }
        // Break items into rows based on responsive breaks
        var rows = [];
        var rowItems = [];
        var rowColumns = [];
        var addRow = function () {
            // Create CSS grid with style
            var containerStyle = {
                display: "grid",
                gridGap: 5,
                gridTemplateColumns: rowColumns.join(" "),
                justifyContent: _this.blockDef.align,
                alignItems: alignItems
            };
            rows.push(react_1.default.createElement("div", { style: containerStyle }, rowItems.map(function (child, index) { return react_1.default.createElement(react_1.default.Fragment, { key: index }, child); })));
            rowItems = [];
            rowColumns = [];
        };
        for (var index = 0; index < children.length; index++) {
            // Determine if break before
            if (index > 0 && responsiveBreaks[index - 1] && responsiveBreaks[index - 1] > width) {
                // Add break
                addRow();
            }
            // Add item
            rowItems.push(children[index]);
            rowColumns.push(align == "justify" ? columnWidths[index] || "1fr" : columnWidths[index] || "auto");
        }
        addRow();
        return react_1.default.createElement("div", null, rows);
    };
    HorizontalBlock.prototype.renderDesign = function (props) {
        var _this = this;
        return (react_1.default.createElement(AutoSizeComponent_1.default, { injectWidth: true }, function (size) { return (react_1.default.createElement("div", { style: { paddingTop: 5, paddingBottom: 5 } }, _this.renderBlock(_this.blockDef.items.map(function (childBlock) { return props.renderChildBlock(props, childBlock); }), size.width))); }));
    };
    HorizontalBlock.prototype.renderInstance = function (props) {
        var _this = this;
        return (react_1.default.createElement(AutoSizeComponent_1.default, { injectWidth: true }, function (size) { return _this.renderBlock(_this.blockDef.items.map(function (childBlockDef) { return props.renderChildBlock(props, childBlockDef); }), size.width); }));
    };
    HorizontalBlock.prototype.renderEditor = function (props) {
        var _this = this;
        var align = this.blockDef.align || "justify";
        return (react_1.default.createElement("div", null,
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Horizontal Alignment" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "align" }, function (value, onChange) {
                    return react_1.default.createElement(bootstrap_1.Toggle, { value: value || "justify", onChange: onChange, options: [
                            { value: "justify", label: react_1.default.createElement("i", { className: "fa fa-align-justify" }) },
                            { value: "left", label: react_1.default.createElement("i", { className: "fa fa-align-left" }) },
                            { value: "center", label: react_1.default.createElement("i", { className: "fa fa-align-center" }) },
                            { value: "right", label: react_1.default.createElement("i", { className: "fa fa-align-right" }) }
                        ] });
                })),
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Vertical Alignment" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "verticalAlign" }, function (value, onChange) {
                    return react_1.default.createElement(bootstrap_1.Toggle, { value: value || "top", onChange: onChange, options: [
                            { value: "top", label: "Top" },
                            { value: "middle", label: "Middle" },
                            { value: "bottom", label: "Bottom" }
                        ] });
                })),
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Column Widths" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "columnWidths" }, function (value, onChange) {
                    return react_1.default.createElement(ColumnWidthsEditor, { numColumns: _this.blockDef.items.length, defaultWidth: align == "justify" ? "1fr" : "auto", columnWidths: value || [], onChange: onChange });
                })),
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Responsive Breaks" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "responsiveBreaks" }, function (value, onChange) {
                    return react_1.default.createElement(ResponsiveBreaksEditor, { numBreaks: _this.blockDef.items.length - 1, breaks: value || [], onChange: onChange });
                }))));
    };
    HorizontalBlock.prototype.getLabel = function () { return ""; };
    return HorizontalBlock;
}(blocks_1.Block));
exports.HorizontalBlock = HorizontalBlock;
var ColumnWidthsEditor = function (props) {
    return react_1.default.createElement("ul", { className: "list-group" }, lodash_1.default.range(props.numColumns).map(function (colIndex) {
        return react_1.default.createElement("li", { className: "list-group-item", key: colIndex },
            react_1.default.createElement(ColumnWidthEditor, { label: "#" + (colIndex + 1) + ":", columnWidth: props.columnWidths[colIndex] || props.defaultWidth, onChange: function (width) { return props.onChange(immer_1.default(props.columnWidths, function (draft) {
                    draft[colIndex] = width;
                })); } }));
    }));
};
function ColumnWidthEditor(props) {
    return react_1.default.createElement("div", { style: { display: "grid", gridTemplateColumns: "40px 1fr", alignItems: "center", columnGap: 5 } },
        react_1.default.createElement("div", null, props.label),
        react_1.default.createElement(bootstrap_1.Select, { value: props.columnWidth, onChange: props.onChange, options: [
                { value: "auto", label: "Auto" },
                { value: "min-content", label: "Small as possible" },
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
                { value: "minmax(min-content, 500px)", label: "500px" },
                { value: "minmax(min-content, 600px)", label: "600px" },
                { value: "minmax(min-content, 700px)", label: "700px" },
                { value: "minmax(min-content, 800px)", label: "800px" }
            ] }));
}
var ResponsiveBreaksEditor = function (props) {
    return react_1.default.createElement("ul", { className: "list-group" }, lodash_1.default.range(props.numBreaks).map(function (breakIndex) {
        return react_1.default.createElement("li", { className: "list-group-item", key: breakIndex },
            react_1.default.createElement(ResponsiveBreakEditor, { label: breakIndex + 1 + " / " + (breakIndex + 2) + ":", width: props.breaks[breakIndex] || null, onChange: function (width) { return props.onChange(immer_1.default(props.breaks, function (draft) {
                    draft[breakIndex] = width;
                })); } }));
    }));
};
function ResponsiveBreakEditor(props) {
    return react_1.default.createElement("div", { style: { display: "grid", gridTemplateColumns: "40px 1fr", alignItems: "center", columnGap: 5 } },
        react_1.default.createElement("div", null, props.label),
        react_1.default.createElement(bootstrap_1.Select, { value: props.width, onChange: props.onChange, nullLabel: "Never break", options: [
                { value: 100, label: "< 100px" },
                { value: 200, label: "< 200px" },
                { value: 300, label: "< 300px" },
                { value: 400, label: "< 400px" },
                { value: 500, label: "< 500px" },
                { value: 600, label: "< 600px" },
                { value: 700, label: "< 700px" },
                { value: 800, label: "< 800px" },
                { value: 900, label: "< 900px" },
                { value: 1000, label: "< 1000px" },
                { value: 1100, label: "< 1100px" },
                { value: 1200, label: "< 1200px" }
            ] }));
}
