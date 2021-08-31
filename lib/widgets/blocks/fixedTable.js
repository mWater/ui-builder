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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setNumColumns = exports.setNumRows = exports.FixedTableBlock = void 0;
const React = __importStar(require("react"));
const _ = __importStar(require("lodash"));
const blocks_1 = require("../blocks");
const propertyEditors_1 = require("../propertyEditors");
const bootstrap_1 = require("react-library/lib/bootstrap");
const immer_1 = __importDefault(require("immer"));
class FixedTableBlock extends blocks_1.Block {
    getChildren(contextVars) {
        // Get for all cells
        return _.compact(_.flatten(this.blockDef.rows.map(r => r.cells.map(c => c.content)))).map(bd => ({ blockDef: bd, contextVars: contextVars }));
    }
    validate() { return null; }
    processChildren(action) {
        return (0, immer_1.default)(this.blockDef, (draft) => {
            // For each row
            this.blockDef.rows.forEach((row, rowIndex) => {
                row.cells.forEach((cell, cellIndex) => {
                    draft.rows[rowIndex].cells[cellIndex].content = action(cell.content);
                });
            });
        });
    }
    renderDesign(props) {
        // Handle setting of a cell contents
        const handleSet = (rowIndex, columnIndex, content) => {
            props.store.alterBlock(this.id, (0, immer_1.default)((b) => {
                b.rows[rowIndex].cells[columnIndex].content = content;
            }), content.id);
        };
        let className = "table";
        switch (this.blockDef.borders || "horizontal") {
            case "all":
                className += " table-bordered";
                break;
            case "none":
                className += " table-borderless";
                break;
        }
        switch (this.blockDef.padding || "normal") {
            case "compact":
                className += " table-condensed";
                break;
        }
        return (React.createElement("table", { className: className },
            React.createElement("colgroup", null, _.range(this.blockDef.numColumns).map((colIndex) => {
                // Determine width
                const columns = this.blockDef.columns;
                const width = columns && columns[colIndex] ? columns[colIndex].columnWidth : "auto";
                return React.createElement("col", { key: colIndex, style: { width: width } });
            })),
            React.createElement("tbody", null, this.blockDef.rows.map((row, rowIndex) => (React.createElement("tr", { key: rowIndex }, row.cells.map((cell, columnIndex) => React.createElement("td", { key: columnIndex }, props.renderChildBlock(props, cell.content, handleSet.bind(null, rowIndex, columnIndex))))))))));
    }
    renderInstance(props) {
        let className = "table";
        switch (this.blockDef.borders || "horizontal") {
            case "all":
                className += " table-bordered";
                break;
            case "none":
                className += " table-borderless";
                break;
        }
        switch (this.blockDef.padding || "normal") {
            case "compact":
                className += " table-condensed";
                break;
        }
        return (React.createElement("table", { className: className },
            React.createElement("colgroup", null, _.range(this.blockDef.numColumns).map((colIndex) => {
                // Determine width
                const columns = this.blockDef.columns;
                const width = columns && columns[colIndex] ? columns[colIndex].columnWidth : "auto";
                return React.createElement("col", { key: colIndex, style: { width: width } });
            })),
            React.createElement("tbody", null, this.blockDef.rows.map((row, rowIndex) => (React.createElement("tr", { key: rowIndex }, row.cells.map((cell, columnIndex) => React.createElement("td", { key: columnIndex }, props.renderChildBlock(props, cell.content)))))))));
    }
    renderEditor(props) {
        const handleNumRowsChange = (numRows) => {
            if (numRows < 1) {
                return;
            }
            props.store.replaceBlock(setNumRows(this.blockDef, numRows));
        };
        const handleNumColumnsChange = (numColumns) => {
            if (numColumns < 1) {
                return;
            }
            props.store.replaceBlock(setNumColumns(this.blockDef, numColumns));
        };
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Number of Rows" },
                React.createElement(bootstrap_1.NumberInput, { value: this.blockDef.numRows, onChange: handleNumRowsChange, decimal: false })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Number of Columns" },
                React.createElement(bootstrap_1.NumberInput, { value: this.blockDef.numColumns, onChange: handleNumColumnsChange, decimal: false })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Borders" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "borders" }, (value, onChange) => React.createElement(bootstrap_1.Toggle, { value: value || "horizontal", onChange: onChange, options: [{ value: "none", label: "None" }, { value: "horizontal", label: "Horizontal" }, { value: "all", label: "All" }] }))),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Padding" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "padding" }, (value, onChange) => React.createElement(bootstrap_1.Toggle, { value: value || "normal", onChange: onChange, options: [{ value: "normal", label: "Normal" }, { value: "compact", label: "Compact" }] }))),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Columns" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "columns" }, (value, onChange) => React.createElement(ColumnsEditor, { value: value, onChange: onChange, numColumns: this.blockDef.numColumns })))));
    }
}
exports.FixedTableBlock = FixedTableBlock;
/** Function to set the number of rows, adding/removing as necessary */
function setNumRows(blockDef, numRows) {
    return (0, immer_1.default)(blockDef, (d) => {
        // Add rows
        if (numRows > blockDef.numRows) {
            for (let i = 0; i < numRows - blockDef.numRows; i++) {
                d.rows.push({ cells: _.range(blockDef.numColumns).map(() => ({ content: null })) });
            }
        }
        // Remove rows
        if (numRows < blockDef.numRows) {
            d.rows.splice(numRows, blockDef.numRows - numRows);
        }
        d.numRows = numRows;
    });
}
exports.setNumRows = setNumRows;
/** Function to set the number of columns, adding/removing as necessary */
function setNumColumns(blockDef, numColumns) {
    return (0, immer_1.default)(blockDef, (d) => {
        // Create columns if they don't exist
        if (!d.columns) {
            d.columns = _.range(blockDef.numColumns).map(c => ({ columnWidth: "auto" }));
        }
        // Add columns
        if (numColumns > blockDef.numColumns) {
            // Add to each row
            for (const row of d.rows) {
                for (let i = 0; i < numColumns - blockDef.numColumns; i++) {
                    row.cells.push({ content: null });
                }
            }
            // Add to columns
            for (let i = 0; i < numColumns - blockDef.numColumns; i++) {
                d.columns.push({ columnWidth: "auto" });
            }
        }
        // Remove columns
        if (numColumns < blockDef.numColumns) {
            for (const row of d.rows) {
                row.cells.splice(numColumns, blockDef.numColumns - numColumns);
            }
            d.columns.splice(numColumns, blockDef.numColumns - numColumns);
        }
        d.numColumns = numColumns;
    });
}
exports.setNumColumns = setNumColumns;
/** Edits column info */
const ColumnsEditor = (props) => {
    const handleColumnWidthChange = (colIndex, columnWidth) => {
        props.onChange((0, immer_1.default)(props.value || [], draft => {
            // Make sure exists
            draft[colIndex] = draft[colIndex] || { columnWidth: "auto" };
            draft[colIndex].columnWidth = columnWidth;
        }));
    };
    return React.createElement("ul", { className: "list-group" }, _.map(_.range(props.numColumns), colIndex => {
        return React.createElement("li", { className: "list-group-item", key: colIndex },
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Width", key: "width" },
                React.createElement(propertyEditors_1.TableColumnWidthEditor, { columnWidth: props.value && props.value[colIndex] ? props.value[colIndex].columnWidth : "auto", onChange: handleColumnWidthChange.bind(null, colIndex) })));
    }));
};
