"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HorizontalBlock = void 0;
const lodash_1 = __importDefault(require("lodash"));
const immer_1 = __importDefault(require("immer"));
const react_1 = __importDefault(require("react"));
const blocks_1 = require("../blocks");
const bootstrap_1 = require("react-library/lib/bootstrap");
const propertyEditors_1 = require("../propertyEditors");
const AutoSizeComponent_1 = __importDefault(require("react-library/lib/AutoSizeComponent"));
class HorizontalBlock extends blocks_1.Block {
    get id() { return this.blockDef.id; }
    getChildren(contextVars) {
        return this.blockDef.items.map(bd => ({ blockDef: bd, contextVars: contextVars }));
    }
    validate() { return null; }
    canonicalize() {
        // Remove if zero items
        if (this.blockDef.items.length === 0) {
            return null;
        }
        // Collapse if one item
        if (this.blockDef.items.length === 1) {
            return this.blockDef.items[0];
        }
        // Flatten out nested horizontal blocks
        if (this.blockDef.items.some(bd => bd.type == "horizontal")) {
            // Create list of items
            let newItems = [];
            for (const item of this.blockDef.items) {
                if (item.type == "horizontal") {
                    newItems = newItems.concat(item.items);
                }
                else {
                    newItems.push(item);
                }
            }
            return immer_1.default(this.blockDef, (draft) => {
                draft.items = newItems;
            });
        }
        return this.blockDef;
    }
    processChildren(action) {
        const newItems = [];
        for (const item of this.blockDef.items) {
            const newItem = action(item);
            if (newItem) {
                newItems.push(newItem);
            }
        }
        // Apply action to all children, discarding null ones
        return immer_1.default(this.blockDef, draft => { draft.items = newItems; });
    }
    renderBlock(children, width) {
        const align = this.blockDef.align || "justify";
        const columnWidths = this.blockDef.columnWidths || [];
        const responsiveBreaks = this.blockDef.responsiveBreaks || [];
        // Determine alignment (vertical)
        let alignItems = "start";
        if (this.blockDef.verticalAlign == "middle") {
            alignItems = "center";
        }
        else if (this.blockDef.verticalAlign == "bottom") {
            alignItems = "end";
        }
        // Break items into rows based on responsive breaks
        const rows = [];
        /** Items in current row being build */
        let rowItems = [];
        /** Widths of column in current row being built */
        let rowColumns = [];
        const addRow = () => {
            // Create CSS grid with style
            const containerStyle = {
                display: "grid",
                gridGap: 5,
                gridTemplateColumns: rowColumns.join(" "),
                justifyContent: this.blockDef.align,
                alignItems
            };
            rows.push(react_1.default.createElement("div", { style: containerStyle }, rowItems.map((child, index) => react_1.default.createElement(react_1.default.Fragment, { key: index }, child))));
            rowItems = [];
            rowColumns = [];
        };
        for (let index = 0; index < children.length; index++) {
            // Determine if break before
            if (index > 0 && responsiveBreaks[index - 1] && responsiveBreaks[index - 1] > width) {
                // Add break
                addRow();
            }
            // Add item
            rowItems.push(children[index]);
            // Create grid size
            let size = align == "justify" ? columnWidths[index] || "1fr" : columnWidths[index] || "auto";
            // Due to strange css grid issue, always use minmax(0px, 1fr) rather than 1fr
            if (!size.startsWith("minmax")) {
                size = `minmax(0px, ${size})`;
            }
            rowColumns.push(size);
        }
        addRow();
        return react_1.default.createElement("div", null, rows);
    }
    renderDesign(props) {
        return (react_1.default.createElement(AutoSizeComponent_1.default, { injectWidth: true }, size => (react_1.default.createElement("div", { style: { paddingTop: 5, paddingBottom: 5 } }, this.renderBlock(this.blockDef.items.map(childBlock => props.renderChildBlock(props, childBlock)), size.width)))));
    }
    renderInstance(props) {
        return (react_1.default.createElement(AutoSizeComponent_1.default, { injectWidth: true }, size => this.renderBlock(this.blockDef.items.map(childBlockDef => props.renderChildBlock(props, childBlockDef)), size.width)));
    }
    renderEditor(props) {
        const align = this.blockDef.align || "justify";
        /** Warn user if using responsive break with fixed widths */
        const renderResponsiveWarning = () => {
            if (this.blockDef.responsiveBreaks && this.blockDef.responsiveBreaks.some(br => br != null)) {
                if (this.blockDef.columnWidths && this.blockDef.columnWidths.some(cw => cw != null && cw.includes("%"))) {
                    return react_1.default.createElement("div", { className: "text-warning" },
                        react_1.default.createElement("i", { className: "fa fa-exclamation-circle" }),
                        " Using fixed widths percentages with responsive breaks can cause unexpected behaviour. It is recommended to use responsive column widths.");
                }
            }
            return null;
        };
        return (react_1.default.createElement("div", null,
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Horizontal Alignment" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "align" }, (value, onChange) => react_1.default.createElement(bootstrap_1.Toggle, { value: value || "justify", onChange: onChange, options: [
                        { value: "justify", label: react_1.default.createElement("i", { className: "fa fa-align-justify" }) },
                        { value: "left", label: react_1.default.createElement("i", { className: "fa fa-align-left" }) },
                        { value: "center", label: react_1.default.createElement("i", { className: "fa fa-align-center" }) },
                        { value: "right", label: react_1.default.createElement("i", { className: "fa fa-align-right" }) }
                    ] }))),
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Vertical Alignment" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "verticalAlign" }, (value, onChange) => react_1.default.createElement(bootstrap_1.Toggle, { value: value || "top", onChange: onChange, options: [
                        { value: "top", label: "Top" },
                        { value: "middle", label: "Middle" },
                        { value: "bottom", label: "Bottom" }
                    ] }))),
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Column Widths" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "columnWidths" }, (value, onChange) => react_1.default.createElement(ColumnWidthsEditor, { numColumns: this.blockDef.items.length, defaultWidth: align == "justify" ? "1fr" : "auto", columnWidths: value || [], onChange: onChange }))),
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Responsive Breaks" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "responsiveBreaks" }, (value, onChange) => react_1.default.createElement(ResponsiveBreaksEditor, { numBreaks: this.blockDef.items.length - 1, breaks: value || [], onChange: onChange })),
                renderResponsiveWarning())));
    }
    getLabel() { return ""; }
}
exports.HorizontalBlock = HorizontalBlock;
const ColumnWidthsEditor = (props) => {
    return react_1.default.createElement("ul", { className: "list-group" }, lodash_1.default.range(props.numColumns).map((colIndex) => {
        return react_1.default.createElement("li", { className: "list-group-item", key: colIndex },
            react_1.default.createElement(ColumnWidthEditor, { label: `#${colIndex + 1}:`, columnWidth: props.columnWidths[colIndex] || props.defaultWidth, onChange: width => props.onChange(immer_1.default(props.columnWidths, draft => {
                    draft[colIndex] = width;
                })) }));
    }));
};
function ColumnWidthEditor(props) {
    return react_1.default.createElement("div", { style: { display: "grid", gridTemplateColumns: "40px 1fr", alignItems: "center", columnGap: 5 } },
        react_1.default.createElement("div", null, props.label),
        react_1.default.createElement("select", { className: "form-control", value: props.columnWidth, onChange: ev => props.onChange(ev.target.value) },
            react_1.default.createElement("optgroup", { label: "Responsive" },
                react_1.default.createElement("option", { value: "auto" }, "Automatic"),
                react_1.default.createElement("option", { value: "min-content" }, "Small as possible"),
                react_1.default.createElement("option", { value: "1fr" }, "1 share of remaining width"),
                react_1.default.createElement("option", { value: "2fr" }, "2 shares of remaining width"),
                react_1.default.createElement("option", { value: "3fr" }, "3 shares of remaining width"),
                react_1.default.createElement("option", { value: "4fr" }, "4 shares of remaining width"),
                react_1.default.createElement("option", { value: "5fr" }, "5 shares of remaining width"),
                react_1.default.createElement("option", { value: "6fr" }, "6 shares of remaining width")),
            react_1.default.createElement("optgroup", { label: "Fixed" },
                react_1.default.createElement("option", { value: "minmax(min-content, 16%)" }, "17% (1/6)"),
                react_1.default.createElement("option", { value: "minmax(min-content, 25%)" }, "25% (1/4)"),
                react_1.default.createElement("option", { value: "minmax(min-content, 33%)" }, "33% (1/3)"),
                react_1.default.createElement("option", { value: "minmax(min-content, 50%)" }, "50% (1/2)"),
                react_1.default.createElement("option", { value: "minmax(min-content, 67%)" }, "67% (2/3)"),
                react_1.default.createElement("option", { value: "minmax(min-content, 75%)" }, "75% (3/4)"),
                react_1.default.createElement("option", { value: "minmax(min-content, 83%)" }, "83% (5/6)"),
                react_1.default.createElement("option", { value: "minmax(min-content, 100px)" }, "100 pixels"),
                react_1.default.createElement("option", { value: "minmax(min-content, 200px)" }, "200 pixels"),
                react_1.default.createElement("option", { value: "minmax(min-content, 300px)" }, "300 pixels"),
                react_1.default.createElement("option", { value: "minmax(min-content, 400px)" }, "400 pixels"),
                react_1.default.createElement("option", { value: "minmax(min-content, 500px)" }, "500 pixels"),
                react_1.default.createElement("option", { value: "minmax(min-content, 600px)" }, "600 pixels"),
                react_1.default.createElement("option", { value: "minmax(min-content, 700px)" }, "700 pixels"),
                react_1.default.createElement("option", { value: "minmax(min-content, 800px)" }, "800 pixels"))));
}
const ResponsiveBreaksEditor = (props) => {
    return react_1.default.createElement("ul", { className: "list-group" }, lodash_1.default.range(props.numBreaks).map((breakIndex) => {
        return react_1.default.createElement("li", { className: "list-group-item", key: breakIndex },
            react_1.default.createElement(ResponsiveBreakEditor, { label: `${breakIndex + 1} / ${breakIndex + 2}:`, width: props.breaks[breakIndex] || null, onChange: width => props.onChange(immer_1.default(props.breaks, draft => {
                    draft[breakIndex] = width;
                })) }));
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
