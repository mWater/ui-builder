"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChartRows = exports.GanttChartInstance = void 0;
var react_1 = require("react");
var contexts_1 = require("../../../contexts");
var Database_1 = require("../../../database/Database");
var canonical_json_1 = __importDefault(require("canonical-json"));
var react_2 = __importDefault(require("react"));
var GanttChart_1 = require("react-library/lib/GanttChart");
var moment_1 = __importDefault(require("moment"));
var immer_1 = require("immer");
var localization_1 = require("../../localization");
function GanttChartInstance(props) {
    var _this = this;
    var block = props.block, ctx = props.ctx;
    var blockDef = block.blockDef;
    var rowsetCV = ctx.contextVars.find(function (cv) { return cv.id == blockDef.rowsetContextVarId; });
    var rowCV = block.createRowContextVar(rowsetCV);
    /** Incremented when database changed */
    var dbChanged = Database_1.useDatabaseChangeListener(ctx.database);
    var table = rowsetCV.table;
    // Determine type of order column
    var orderType = ctx.schema.getColumn(table, blockDef.rowOrderColumn).type;
    /** Creates a query */
    var createQuery = function () {
        // Create query
        var query = {
            select: {
                id: { type: "id", table: table },
                label: blockDef.rowLabelExpr,
                startDate: blockDef.rowStartDateExpr,
                endDate: blockDef.rowEndDateExpr,
                order: blockDef.rowOrderColumn ? { type: "field", table: table, column: blockDef.rowOrderColumn } : null,
                parent: blockDef.rowParentColumn ? { type: "field", table: table, column: blockDef.rowParentColumn } : null,
            },
            from: table,
            where: blockDef.filter
        };
        return query;
    };
    // Query data
    var performQuery = function () { return __awaiter(_this, void 0, void 0, function () {
        var rows;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, ctx.database.query(createQuery(), ctx.contextVars, contexts_1.getFilteredContextVarValues(ctx))];
                case 1:
                    rows = _a.sent();
                    setRows(rows);
                    return [2 /*return*/];
            }
        });
    }); };
    var _a = react_1.useState(), rows = _a[0], setRows = _a[1];
    // Perform query when database changed, or if context var values change
    react_1.useEffect(function () {
        performQuery();
    }, [dbChanged, canonical_json_1.default(contexts_1.getFilteredContextVarValues(ctx))]);
    // Show spinner if not loaded
    if (!rows) {
        return react_2.default.createElement("div", null,
            react_2.default.createElement("i", { className: "fa fa-spinner fa-spin" }));
    }
    // Gets the color of a row
    function getRowColor(row) {
        return row.startDate == row.endDate || !row.startDate || !row.endDate
            ? blockDef.milestoneColor || "#68cdee"
            : blockDef.barColor || "#68cdee";
    }
    // Create chart rows
    var chartRows = createChartRows({ queryRows: rows, getColor: getRowColor, prefixNumber: blockDef.autoNumberRows || false });
    /** Create instance ctx for a clicked row */
    function createRowInstanceCtx(row) {
        var _a;
        var innerContextVars = ctx.contextVars.concat(rowCV);
        // Row context variable value
        var cvvalue = row.id;
        return __assign(__assign({}, ctx), { contextVars: innerContextVars, contextVarValues: __assign(__assign({}, ctx.contextVarValues), (_a = {}, _a[rowCV.id] = cvvalue, _a)) });
    }
    /** Move a row logically down  */
    var handleMoveRowDown = function (index) {
        var chartRow = chartRows[index];
        var _loop_1 = function (i) {
            // If up a level, ignore
            if (chartRows[i].level < chartRow.level) {
                return { value: void 0 };
            }
            // If same level, use this one
            if (chartRows[i].level == chartRow.level) {
                // Swap orders
                var myRow = rows.find(function (r) { return r.id == chartRow.id; });
                var otherRow = rows.find(function (r) { return r.id == chartRows[i].id; });
                var txn = ctx.database.transaction();
                txn.updateRow(table, myRow.id, { order: otherRow.order });
                txn.updateRow(table, otherRow.id, { order: myRow.order });
                txn.commit();
                return { value: void 0 };
            }
        };
        // Find next sibling
        for (var i = index + 1; i < chartRows.length; i++) {
            var state_1 = _loop_1(i);
            if (typeof state_1 === "object")
                return state_1.value;
        }
    };
    var handleMoveRowUp = function (index) {
        var chartRow = chartRows[index];
        var _loop_2 = function (i) {
            // If up a level, ignore
            if (chartRows[i].level < chartRow.level) {
                return { value: void 0 };
            }
            // If same level, use this one
            if (chartRows[i].level == chartRow.level) {
                // Swap orders
                var myRow = rows.find(function (r) { return r.id == chartRow.id; });
                var otherRow = rows.find(function (r) { return r.id == chartRows[i].id; });
                var txn = ctx.database.transaction();
                txn.updateRow(table, myRow.id, { order: otherRow.order });
                txn.updateRow(table, otherRow.id, { order: myRow.order });
                txn.commit();
                return { value: void 0 };
            }
        };
        // Find previous sibling
        for (var i = index - 1; i >= 0; i--) {
            var state_2 = _loop_2(i);
            if (typeof state_2 === "object")
                return state_2.value;
        }
    };
    var handleMoveRowLeft = function (index) {
        var chartRow = chartRows[index];
        var myRow = rows.find(function (r) { return r.id == chartRow.id; });
        // Find parent
        var parentRow = rows.find(function (r) { return r.id == myRow.parent; });
        var txn = ctx.database.transaction();
        // Set own parent to parent's parent and and set order to parent + 1
        txn.updateRow(table, myRow.id, { parent: parentRow.parent, order: parentRow.order + 1 });
        // Decrement order of all siblings after self
        for (var _i = 0, rows_1 = rows; _i < rows_1.length; _i++) {
            var r = rows_1[_i];
            if (r.parent == myRow.parent && r.order > myRow.order) {
                txn.updateRow(table, r.id, { order: r.order - 1 });
            }
        }
        // Increment order of all siblings after parent
        for (var _a = 0, rows_2 = rows; _a < rows_2.length; _a++) {
            var r = rows_2[_a];
            if (r.parent == parentRow.parent && r.order > parentRow.order) {
                txn.updateRow(table, r.id, { order: r.order + 1 });
            }
        }
        txn.commit();
    };
    var handleMoveRowRight = function (index) {
        var chartRow = chartRows[index];
        var myRow = rows.find(function (r) { return r.id == chartRow.id; });
        // Find new parent (previous row)
        var parentRow = rows.find(function (r) { return r.id == chartRows[index - 1].id; });
        var txn = ctx.database.transaction();
        // Set own parent to previous row's parent and set order to 0
        txn.updateRow(table, myRow.id, { parent: parentRow.id, order: 0 });
        // Decrement order of all siblings after parent
        for (var _i = 0, rows_3 = rows; _i < rows_3.length; _i++) {
            var r = rows_3[_i];
            if (r.parent == parentRow.parent && r.order > parentRow.order) {
                txn.updateRow(table, r.id, { order: r.order - 1 });
            }
        }
        txn.commit();
    };
    var handleInsertChildRow = function (index) {
        var chartRow = chartRows[index];
        var myRow = rows.find(function (r) { return r.id == chartRow.id; });
        // Determine max order of child rows
        var order = 0;
        for (var _i = 0, rows_4 = rows; _i < rows_4.length; _i++) {
            var r = rows_4[_i];
            if (r.parent == myRow.id && r.order >= order) {
                order = r.order + 1;
            }
        }
        handleAddRow(myRow.id, order);
    };
    var handleInsertRowAbove = function (index) {
        var chartRow = chartRows[index];
        var myRow = rows.find(function (r) { return r.id == chartRow.id; });
        // Make room for new row
        var txn = ctx.database.transaction();
        // Increment order of all siblings including and after self
        for (var _i = 0, rows_5 = rows; _i < rows_5.length; _i++) {
            var r = rows_5[_i];
            if (r.parent == myRow.parent && r.order >= myRow.order) {
                txn.updateRow(table, r.id, { order: r.order + 1 });
            }
        }
        txn.commit();
        handleAddRow(myRow.parent, myRow.order);
    };
    var handleInsertRowBelow = function (index) {
        var chartRow = chartRows[index];
        var myRow = rows.find(function (r) { return r.id == chartRow.id; });
        // Make room for new row
        var txn = ctx.database.transaction();
        // Increment order of all siblings after self
        for (var _i = 0, rows_6 = rows; _i < rows_6.length; _i++) {
            var r = rows_6[_i];
            if (r.parent == myRow.parent && r.order > myRow.order) {
                txn.updateRow(table, r.id, { order: r.order + 1 });
            }
        }
        txn.commit();
        handleAddRow(myRow.parent, myRow.order + 1);
    };
    var handleRowClick = function (chartRowIndex) {
        // Lookup row
        var row = rows.find(function (r) { return r.id == chartRows[chartRowIndex].id; });
        // Create context with variables 
        var rowClickAction = ctx.actionLibrary.createAction(blockDef.rowClickAction);
        rowClickAction.performAction(createRowInstanceCtx(row));
    };
    var handleAddRow = function (parent, order) {
        // Create context with additional variables
        var innerCtx = immer_1.produce(ctx, function (draft) {
            var rowOrderContextVar = block.createAddRowOrderContextVar(rowsetCV);
            var rowParentContextVar = block.createAddRowParentContextVar(rowsetCV);
            draft.contextVars.push(rowOrderContextVar);
            draft.contextVars.push(rowParentContextVar);
            draft.contextVarValues[rowOrderContextVar.id] = { type: "literal", valueType: "number", value: order };
            draft.contextVarValues[rowParentContextVar.id] = { type: "literal", valueType: "id", idTable: rowsetCV.table, value: parent };
        });
        ctx.actionLibrary.createAction(blockDef.addRowAction).performAction(innerCtx);
    };
    var handleRemoveRow = function (chartRowIndex) {
        // Confirm if confirm message
        if (blockDef.removeConfirmMessage) {
            if (!confirm(localization_1.localize(blockDef.removeConfirmMessage, ctx.locale))) {
                return;
            }
        }
        // Delete recursively
        var txn = ctx.database.transaction();
        function deleteDescendants(rowId) {
            // Lookup row
            var row = rows.find(function (r) { return r.id == rowId; });
            // Delete any children
            for (var _i = 0, _a = rows; _i < _a.length; _i++) {
                var child = _a[_i];
                if (child.parent == row.id) {
                    deleteDescendants(child.id);
                }
                txn.removeRow(table, row.id);
            }
        }
        deleteDescendants(chartRows[chartRowIndex].id);
        txn.commit();
    };
    /** Append row to bottom of chart */
    function handleAppendRow() {
        var order = null;
        // Add order as next number of ordered column if type is number
        if (orderType == "number") {
            order = 0;
            for (var _i = 0, _a = rows; _i < _a.length; _i++) {
                var row = _a[_i];
                if (!row.parent && row.order >= order) {
                    order = row.order + 1;
                }
            }
        }
        handleAddRow(null, order);
    }
    var startDate;
    var endDate;
    // Use override if present
    if (blockDef.startDate) {
        startDate = blockDef.startDate;
    }
    else {
        // Go earliest with a buffer
        var minStartDate = rows.reduce(function (acc, row) { return !acc || (row.startDate && row.startDate < acc) ? row.startDate : acc; }, null);
        if (minStartDate) {
            startDate = moment_1.default(minStartDate, "YYYY-MM-DD").subtract(1, "month").format("YYYY-MM-DD");
        }
        else {
            // Start of year
            startDate = moment_1.default().startOf("year").format("YYYY-MM-DD");
        }
    }
    // Use override if present
    if (blockDef.endDate) {
        endDate = blockDef.endDate;
    }
    else {
        // Go earliest with a buffer
        var maxEndDate = rows.reduce(function (acc, row) { return !acc || (row.endDate && row.endDate > acc) ? row.endDate : acc; }, null);
        if (maxEndDate) {
            endDate = moment_1.default(maxEndDate, "YYYY-MM-DD").add(1, "month").format("YYYY-MM-DD");
        }
        else {
            // End of year
            endDate = moment_1.default().endOf("year").format("YYYY-MM-DD");
        }
    }
    var isOrdered = blockDef.rowOrderColumn != null;
    var isHierarchical = blockDef.rowParentColumn != null;
    return react_2.default.createElement(GanttChart_1.GanttChart, { rows: chartRows, startDate: startDate, endDate: endDate, onMoveRowDown: isOrdered ? handleMoveRowDown : undefined, onMoveRowUp: isOrdered ? handleMoveRowUp : undefined, onMoveRowLeft: isOrdered && isHierarchical ? handleMoveRowLeft : undefined, onMoveRowRight: isOrdered && isHierarchical ? handleMoveRowRight : undefined, onInsertChildRow: isOrdered && isHierarchical ? handleInsertChildRow : undefined, onInsertRowAbove: isOrdered && isHierarchical ? handleInsertRowAbove : undefined, onInsertRowBelow: isOrdered && isHierarchical ? handleInsertRowBelow : undefined, onRowClick: blockDef.rowClickAction ? handleRowClick : undefined, onAddRow: blockDef.addRowAction ? handleAppendRow : undefined, addRowLabel: blockDef.addRowLabel ? [react_2.default.createElement("i", { className: "fa fa-plus" }), " ", localization_1.localize(blockDef.addRowLabel, ctx.locale)] : undefined, onRemoveRow: blockDef.allowRemove ? handleRemoveRow : undefined, T: ctx.T });
}
exports.GanttChartInstance = GanttChartInstance;
/** Performs operation to convert from query rows to chart rows
 * which involves making the results into a sorted tree and then
 * returning the rows in depth-first order, adding any labels as
 * required.
 * prefixNumber adds 1.1, 1.2.3, etc before label
 */
function createChartRows(options) {
    var chartRows = [];
    /** Add all rows, sorted, that have this as a parent */
    function addRows(parent, level, prefix) {
        var childRows = options.queryRows.filter(function (r) { return r.parent == parent; });
        // Sort by order
        childRows.sort(function (a, b) { return a.order > b.order ? 1 : -1; });
        // Add each row, then add its children
        childRows.forEach(function (row, index) {
            chartRows.push({
                id: row.id,
                color: options.getColor(row),
                level: level,
                startDate: row.startDate,
                endDate: row.endDate,
                label: options.prefixNumber ? "" + prefix + (index + 1) + ". " + row.label || "" : row.label || ""
            });
            addRows(row.id, level + 1, "" + prefix + (index + 1) + ".");
        });
    }
    addRows(null, 0, "");
    return chartRows;
}
exports.createChartRows = createChartRows;
