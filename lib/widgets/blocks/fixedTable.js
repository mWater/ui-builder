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
var React = __importStar(require("react"));
var _ = __importStar(require("lodash"));
var propertyEditors_1 = require("../propertyEditors");
var bootstrap_1 = require("react-library/lib/bootstrap");
var CompoundBlock_1 = __importDefault(require("../CompoundBlock"));
var immer_1 = __importDefault(require("immer"));
var FixedTableBlock = /** @class */ (function (_super) {
    __extends(FixedTableBlock, _super);
    function FixedTableBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FixedTableBlock.prototype.getChildren = function (contextVars) {
        // Get for all cells
        return _.compact(_.flatten(this.blockDef.rows.map(function (r) { return r.cells.map(function (c) { return c.content; }); }))).map(function (bd) { return ({ blockDef: bd, contextVars: contextVars }); });
    };
    FixedTableBlock.prototype.validate = function () { return null; };
    FixedTableBlock.prototype.processChildren = function (action) {
        return immer_1.default(this.blockDef, function (draft) {
            // For each row
            for (var _i = 0, _a = draft.rows; _i < _a.length; _i++) {
                var row = _a[_i];
                for (var _b = 0, _c = row.cells; _b < _c.length; _b++) {
                    var cell = _c[_b];
                    if (cell.content) {
                        cell.content = action(cell.content);
                    }
                }
            }
        });
    };
    FixedTableBlock.prototype.renderDesign = function (props) {
        var _this = this;
        // Handle setting of a cell contents
        var handleSet = function (rowIndex, columnIndex, content) {
            props.store.alterBlock(_this.id, immer_1.default(function (b) {
                b.rows[rowIndex].cells[columnIndex].content = content;
            }), content.id);
        };
        return (React.createElement("table", { className: this.blockDef.cellPadding === "condensed" ? "table table-bordered table-condensed" : "table table-bordered" },
            React.createElement("tbody", null, this.blockDef.rows.map(function (row, rowIndex) { return (React.createElement("tr", null, row.cells.map(function (cell, columnIndex) { return React.createElement("td", { key: columnIndex }, props.renderChildBlock(props, cell.content, handleSet.bind(null, rowIndex, columnIndex))); }))); }))));
    };
    FixedTableBlock.prototype.renderInstance = function (props) {
        return (React.createElement("table", { className: this.blockDef.cellPadding === "condensed" ? "table table-bordered table-condensed" : "table table-bordered" },
            React.createElement("tbody", null, this.blockDef.rows.map(function (row, rowIndex) { return (React.createElement("tr", null, row.cells.map(function (cell, columnIndex) { return React.createElement("td", { key: columnIndex }, props.renderChildBlock(props, cell.content)); }))); }))));
    };
    FixedTableBlock.prototype.renderEditor = function (props) {
        var _this = this;
        var handleNumRowsChange = function (numRows) {
            if (numRows < 1) {
                return;
            }
            props.onChange(setNumRows(_this.blockDef, numRows));
        };
        var handleNumColumnsChange = function (numColumns) {
            if (numColumns < 1) {
                return;
            }
            props.onChange(setNumColumns(_this.blockDef, numColumns));
        };
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Number of Rows" },
                React.createElement(bootstrap_1.NumberInput, { value: this.blockDef.numRows, onChange: handleNumRowsChange, decimal: false })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Number of Columns" },
                React.createElement(bootstrap_1.NumberInput, { value: this.blockDef.numColumns, onChange: handleNumColumnsChange, decimal: false })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Cell Padding" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "cellPadding" }, function (value, onChange) {
                    return React.createElement(bootstrap_1.Select, { value: value, onChange: onChange, options: [
                            { value: "default", label: "Normal" },
                            { value: "condensed", label: "Condensed" },
                        ] });
                }))));
    };
    return FixedTableBlock;
}(CompoundBlock_1.default));
exports.FixedTableBlock = FixedTableBlock;
/** Function to set the number of rows, adding/removing as necessary */
function setNumRows(blockDef, numRows) {
    return immer_1.default(blockDef, function (d) {
        // Add rows
        if (numRows > blockDef.numRows) {
            for (var i = 0; i < numRows - blockDef.numRows; i++) {
                d.rows.push({ cells: _.range(blockDef.numColumns).map(function () { return ({ content: null }); }) });
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
    return immer_1.default(blockDef, function (d) {
        // Add columns
        if (numColumns > blockDef.numColumns) {
            for (var _i = 0, _a = d.rows; _i < _a.length; _i++) {
                var row = _a[_i];
                for (var i = 0; i < numColumns - blockDef.numColumns; i++) {
                    row.cells.push({ content: null });
                }
            }
        }
        // Remove columns
        if (numColumns < blockDef.numColumns) {
            for (var _b = 0, _c = d.rows; _b < _c.length; _b++) {
                var row = _c[_b];
                row.cells.splice(numColumns, blockDef.numColumns - numColumns);
            }
        }
        d.numColumns = numColumns;
    });
}
exports.setNumColumns = setNumColumns;
