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
var blocks_1 = require("../blocks");
var propertyEditors_1 = require("../propertyEditors");
var bootstrap_1 = require("react-library/lib/bootstrap");
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
        var _this = this;
        return immer_1.default(this.blockDef, function (draft) {
            // For each row
            _this.blockDef.rows.forEach(function (row, rowIndex) {
                row.cells.forEach(function (cell, cellIndex) {
                    draft.rows[rowIndex].cells[cellIndex].content = action(cell.content);
                });
            });
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
        var className = "table";
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
            React.createElement("colgroup", null, _.range(this.blockDef.numColumns).map(function (colIndex) {
                // Determine width
                var columns = _this.blockDef.columns;
                var width = columns && columns[colIndex] ? columns[colIndex].columnWidth : "auto";
                return React.createElement("col", { key: colIndex, style: { width: width } });
            })),
            React.createElement("tbody", null, this.blockDef.rows.map(function (row, rowIndex) { return (React.createElement("tr", { key: rowIndex }, row.cells.map(function (cell, columnIndex) { return React.createElement("td", { key: columnIndex }, props.renderChildBlock(props, cell.content, handleSet.bind(null, rowIndex, columnIndex))); }))); }))));
    };
    FixedTableBlock.prototype.renderInstance = function (props) {
        var _this = this;
        var className = "table";
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
            _.range(this.blockDef.numColumns).map(function (colIndex) {
                // Determine width
                var columns = _this.blockDef.columns;
                var width = columns && columns[colIndex] ? columns[colIndex].columnWidth : "auto";
                return React.createElement("col", { key: colIndex, style: { width: width } });
            }),
            React.createElement("tbody", null, this.blockDef.rows.map(function (row, rowIndex) { return (React.createElement("tr", { key: rowIndex }, row.cells.map(function (cell, columnIndex) { return React.createElement("td", { key: columnIndex }, props.renderChildBlock(props, cell.content)); }))); }))));
    };
    FixedTableBlock.prototype.renderEditor = function (props) {
        var _this = this;
        var handleNumRowsChange = function (numRows) {
            if (numRows < 1) {
                return;
            }
            props.store.replaceBlock(setNumRows(_this.blockDef, numRows));
        };
        var handleNumColumnsChange = function (numColumns) {
            if (numColumns < 1) {
                return;
            }
            props.store.replaceBlock(setNumColumns(_this.blockDef, numColumns));
        };
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Number of Rows" },
                React.createElement(bootstrap_1.NumberInput, { value: this.blockDef.numRows, onChange: handleNumRowsChange, decimal: false })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Number of Columns" },
                React.createElement(bootstrap_1.NumberInput, { value: this.blockDef.numColumns, onChange: handleNumColumnsChange, decimal: false })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Borders" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "borders" }, function (value, onChange) { return React.createElement(bootstrap_1.Toggle, { value: value || "horizontal", onChange: onChange, options: [{ value: "none", label: "None" }, { value: "horizontal", label: "Horizontal" }, { value: "all", label: "All" }] }); })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Padding" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "padding" }, function (value, onChange) { return React.createElement(bootstrap_1.Toggle, { value: value || "normal", onChange: onChange, options: [{ value: "normal", label: "Normal" }, { value: "compact", label: "Compact" }] }); })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Columns" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "columns" }, function (value, onChange) { return React.createElement(ColumnsEditor, { value: value, onChange: onChange, numColumns: _this.blockDef.numColumns }); }))));
    };
    return FixedTableBlock;
}(blocks_1.Block));
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
        // Create columns if they don't exist
        if (!d.columns) {
            d.columns = _.range(blockDef.numColumns).map(function (c) { return ({ columnWidth: "auto" }); });
        }
        // Add columns
        if (numColumns > blockDef.numColumns) {
            // Add to each row
            for (var _i = 0, _a = d.rows; _i < _a.length; _i++) {
                var row = _a[_i];
                for (var i = 0; i < numColumns - blockDef.numColumns; i++) {
                    row.cells.push({ content: null });
                }
            }
            // Add to columns
            for (var i = 0; i < numColumns - blockDef.numColumns; i++) {
                d.columns.push({ columnWidth: "auto" });
            }
        }
        // Remove columns
        if (numColumns < blockDef.numColumns) {
            for (var _b = 0, _c = d.rows; _b < _c.length; _b++) {
                var row = _c[_b];
                row.cells.splice(numColumns, blockDef.numColumns - numColumns);
            }
            d.columns.splice(numColumns, blockDef.numColumns - numColumns);
        }
        d.numColumns = numColumns;
    });
}
exports.setNumColumns = setNumColumns;
/** Edits column info */
var ColumnsEditor = function (props) {
    var handleColumnWidthChange = function (colIndex, columnWidth) {
        props.onChange(immer_1.default(props.value || [], function (draft) {
            // Make sure exists
            draft[colIndex] = draft[colIndex] || { columnWidth: "auto" };
            draft[colIndex].columnWidth = columnWidth;
        }));
    };
    return React.createElement("ul", { className: "list-group" }, _.map(_.range(props.numColumns), function (colIndex) {
        return React.createElement("li", { className: "list-group-item", key: colIndex },
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Width", key: "width" },
                React.createElement(propertyEditors_1.TableColumnWidthEditor, { columnWidth: props.value && props.value[colIndex] ? props.value[colIndex].columnWidth : "auto", onChange: handleColumnWidthChange.bind(null, colIndex) })));
    }));
};
