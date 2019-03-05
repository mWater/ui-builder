"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
const _ = __importStar(require("lodash"));
const propertyEditors_1 = require("../propertyEditors");
const bootstrap_1 = require("react-library/lib/bootstrap");
const CompoundBlock_1 = __importDefault(require("../CompoundBlock"));
const immer_1 = __importDefault(require("immer"));
class FixedTableBlock extends CompoundBlock_1.default {
    getChildren(contextVars) {
        // Get for all cells
        return _.compact(_.flatten(this.blockDef.rows.map(r => r.cells.map(c => c.content)))).map(bd => ({ blockDef: bd, contextVars: contextVars }));
    }
    validate() { return null; }
    processChildren(action) {
        return immer_1.default(this.blockDef, (draft) => {
            // For each row
            for (const row of draft.rows) {
                for (const cell of row.cells) {
                    if (cell.content) {
                        cell.content = action(cell.content);
                    }
                }
            }
        });
    }
    renderDesign(props) {
        // Handle setting of a cell contents
        const handleSet = (rowIndex, columnIndex, content) => {
            props.store.alterBlock(this.id, immer_1.default((b) => {
                b.rows[rowIndex].cells[columnIndex].content = content;
            }), content.id);
        };
        return (React.createElement("table", { className: this.blockDef.cellPadding === "condensed" ? "table table-bordered table-condensed" : "table table-bordered" },
            React.createElement("tbody", null, this.blockDef.rows.map((row, rowIndex) => (React.createElement("tr", null, row.cells.map((cell, columnIndex) => React.createElement("td", { key: "index" }, props.renderChildBlock(props, cell.content, handleSet.bind(null, rowIndex, columnIndex))))))))));
    }
    renderInstance(props) {
        return (React.createElement("table", { className: this.blockDef.cellPadding === "condensed" ? "table table-bordered table-condensed" : "table table-bordered" },
            React.createElement("tbody", null, this.blockDef.rows.map((row, rowIndex) => (React.createElement("tr", null, row.cells.map((cell, columnIndex) => React.createElement("td", { key: "index" }, props.renderChildBlock(props, cell.content)))))))));
    }
    renderEditor(props) {
        const handleNumRowsChange = (numRows) => {
            if (numRows < 1) {
                return;
            }
            props.onChange(setNumRows(this.blockDef, numRows));
        };
        const handleNumColumnsChange = (numColumns) => {
            if (numColumns < 1) {
                return;
            }
            props.onChange(setNumColumns(this.blockDef, numColumns));
        };
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Number of Rows" },
                React.createElement(bootstrap_1.NumberInput, { value: this.blockDef.numRows, onChange: handleNumRowsChange, decimal: false })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Number of Columns" },
                React.createElement(bootstrap_1.NumberInput, { value: this.blockDef.numColumns, onChange: handleNumColumnsChange, decimal: false })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Cell Padding" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "cellPadding" }, (value, onChange) => React.createElement(bootstrap_1.Select, { value: value, onChange: onChange, options: [
                        { value: "default", label: "Normal" },
                        { value: "condensed", label: "Condensed" },
                    ] })))));
    }
}
exports.FixedTableBlock = FixedTableBlock;
/** Function to set the number of rows, adding/removing as necessary */
function setNumRows(blockDef, numRows) {
    return immer_1.default(blockDef, (d) => {
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
    return immer_1.default(blockDef, (d) => {
        // Add columns
        if (numColumns > blockDef.numColumns) {
            for (const row of d.rows) {
                for (let i = 0; i < numColumns - blockDef.numColumns; i++) {
                    row.cells.push({ content: null });
                }
            }
        }
        // Remove columns
        if (numColumns < blockDef.numColumns) {
            for (const row of d.rows) {
                row.cells.splice(numColumns, blockDef.numColumns - numColumns);
            }
        }
        d.numColumns = numColumns;
    });
}
exports.setNumColumns = setNumColumns;
//# sourceMappingURL=fixedTable.js.map