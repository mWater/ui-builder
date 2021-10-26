"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChartRows = exports.GanttChartInstance = void 0;
const react_1 = require("react");
const contexts_1 = require("../../../contexts");
const Database_1 = require("../../../database/Database");
const canonical_json_1 = __importDefault(require("canonical-json"));
const react_2 = __importDefault(require("react"));
const GanttChart_1 = require("react-library/lib/GanttChart");
const moment_1 = __importDefault(require("moment"));
const immer_1 = require("immer");
const localization_1 = require("../../localization");
function GanttChartInstance(props) {
    const { block, ctx } = props;
    const blockDef = block.blockDef;
    const rowsetCV = ctx.contextVars.find((cv) => cv.id == blockDef.rowsetContextVarId);
    const rowCV = block.createRowContextVar(rowsetCV);
    /** Incremented when database changed */
    const dbChanged = (0, Database_1.useDatabaseChangeListener)(ctx.database);
    const table = rowsetCV.table;
    // Determine type of order column
    const orderType = ctx.schema.getColumn(table, blockDef.rowOrderColumn).type;
    /** Creates a query */
    const createQuery = () => {
        // Create query
        const query = {
            select: {
                id: { type: "id", table: table },
                label: blockDef.rowLabelExpr,
                startDate: blockDef.rowStartDateExpr,
                endDate: blockDef.rowEndDateExpr,
                order: blockDef.rowOrderColumn ? { type: "field", table: table, column: blockDef.rowOrderColumn } : null,
                parent: blockDef.rowParentColumn ? { type: "field", table: table, column: blockDef.rowParentColumn } : null
            },
            from: table,
            where: blockDef.filter
        };
        return query;
    };
    // Query data
    const performQuery = () => __awaiter(this, void 0, void 0, function* () {
        // Perform actual query
        const rows = yield ctx.database.query(createQuery(), ctx.contextVars, (0, contexts_1.getFilteredContextVarValues)(ctx));
        setRows(rows);
    });
    const [rows, setRows] = (0, react_1.useState)();
    // Perform query when database changed, or if context var values change
    (0, react_1.useEffect)(() => {
        performQuery();
    }, [dbChanged, (0, canonical_json_1.default)((0, contexts_1.getFilteredContextVarValues)(ctx))]);
    // Show spinner if not loaded
    if (!rows) {
        return (react_2.default.createElement("div", null,
            react_2.default.createElement("i", { className: "fa fa-spinner fa-spin" })));
    }
    // Gets the color of a row
    function getRowColor(row) {
        return row.startDate == row.endDate || !row.startDate || !row.endDate
            ? blockDef.milestoneColor || "#68cdee"
            : blockDef.barColor || "#68cdee";
    }
    // Create chart rows
    const chartRows = createChartRows({
        queryRows: rows,
        getColor: getRowColor,
        prefixNumber: blockDef.autoNumberRows || false
    });
    /** Create instance ctx for a clicked row */
    function createRowInstanceCtx(row) {
        const innerContextVars = ctx.contextVars.concat(rowCV);
        // Row context variable value
        const cvvalue = row.id;
        return Object.assign(Object.assign({}, ctx), { contextVars: innerContextVars, contextVarValues: Object.assign(Object.assign({}, ctx.contextVarValues), { [rowCV.id]: cvvalue }) });
    }
    /** Move a row logically down  */
    const handleMoveRowDown = (index) => {
        const chartRow = chartRows[index];
        // Find next sibling
        for (let i = index + 1; i < chartRows.length; i++) {
            // If up a level, ignore
            if (chartRows[i].level < chartRow.level) {
                return;
            }
            // If same level, use this one
            if (chartRows[i].level == chartRow.level) {
                // Swap orders
                const myRow = rows.find((r) => r.id == chartRow.id);
                const otherRow = rows.find((r) => r.id == chartRows[i].id);
                const txn = ctx.database.transaction();
                txn.updateRow(table, myRow.id, { order: otherRow.order });
                txn.updateRow(table, otherRow.id, { order: myRow.order });
                txn.commit();
                return;
            }
        }
    };
    const handleMoveRowUp = (index) => {
        const chartRow = chartRows[index];
        // Find previous sibling
        for (let i = index - 1; i >= 0; i--) {
            // If up a level, ignore
            if (chartRows[i].level < chartRow.level) {
                return;
            }
            // If same level, use this one
            if (chartRows[i].level == chartRow.level) {
                // Swap orders
                const myRow = rows.find((r) => r.id == chartRow.id);
                const otherRow = rows.find((r) => r.id == chartRows[i].id);
                const txn = ctx.database.transaction();
                txn.updateRow(table, myRow.id, { order: otherRow.order });
                txn.updateRow(table, otherRow.id, { order: myRow.order });
                txn.commit();
                return;
            }
        }
    };
    const handleMoveRowLeft = (index) => {
        const chartRow = chartRows[index];
        const myRow = rows.find((r) => r.id == chartRow.id);
        // Find parent
        const parentRow = rows.find((r) => r.id == myRow.parent);
        const txn = ctx.database.transaction();
        // Set own parent to parent's parent and and set order to parent + 1
        txn.updateRow(table, myRow.id, { parent: parentRow.parent, order: parentRow.order + 1 });
        // Decrement order of all siblings after self
        for (const r of rows) {
            if (r.parent == myRow.parent && r.order > myRow.order) {
                txn.updateRow(table, r.id, { order: r.order - 1 });
            }
        }
        // Increment order of all siblings after parent
        for (const r of rows) {
            if (r.parent == parentRow.parent && r.order > parentRow.order) {
                txn.updateRow(table, r.id, { order: r.order + 1 });
            }
        }
        txn.commit();
    };
    const handleMoveRowRight = (index) => {
        const chartRow = chartRows[index];
        const myRow = rows.find((r) => r.id == chartRow.id);
        // Find new parent (previous row)
        const parentRow = rows.find((r) => r.id == chartRows[index - 1].id);
        const txn = ctx.database.transaction();
        // Set own parent to previous row's parent and set order to 0
        txn.updateRow(table, myRow.id, { parent: parentRow.id, order: 0 });
        // Decrement order of all siblings after parent
        for (const r of rows) {
            if (r.parent == parentRow.parent && r.order > parentRow.order) {
                txn.updateRow(table, r.id, { order: r.order - 1 });
            }
        }
        txn.commit();
    };
    const handleInsertChildRow = (index) => {
        const chartRow = chartRows[index];
        const myRow = rows.find((r) => r.id == chartRow.id);
        // Determine max order of child rows
        let order = 0;
        for (const r of rows) {
            if (r.parent == myRow.id && r.order >= order) {
                order = r.order + 1;
            }
        }
        handleAddRow(myRow.id, order);
    };
    const handleInsertRowAbove = (index) => {
        const chartRow = chartRows[index];
        const myRow = rows.find((r) => r.id == chartRow.id);
        // Make room for new row
        const txn = ctx.database.transaction();
        // Increment order of all siblings including and after self
        for (const r of rows) {
            if (r.parent == myRow.parent && r.order >= myRow.order) {
                txn.updateRow(table, r.id, { order: r.order + 1 });
            }
        }
        txn.commit();
        handleAddRow(myRow.parent, myRow.order);
    };
    const handleInsertRowBelow = (index) => {
        const chartRow = chartRows[index];
        const myRow = rows.find((r) => r.id == chartRow.id);
        // Make room for new row
        const txn = ctx.database.transaction();
        // Increment order of all siblings after self
        for (const r of rows) {
            if (r.parent == myRow.parent && r.order > myRow.order) {
                txn.updateRow(table, r.id, { order: r.order + 1 });
            }
        }
        txn.commit();
        handleAddRow(myRow.parent, myRow.order + 1);
    };
    const handleRowClick = (chartRowIndex) => {
        // Lookup row
        const row = rows.find((r) => r.id == chartRows[chartRowIndex].id);
        // Create context with variables
        const rowClickAction = ctx.actionLibrary.createAction(blockDef.rowClickAction);
        rowClickAction.performAction(createRowInstanceCtx(row));
    };
    const handleAddRow = (parent, order) => {
        // Create context with additional variables
        const innerCtx = (0, immer_1.produce)(ctx, (draft) => {
            const rowOrderContextVar = block.createAddRowOrderContextVar(rowsetCV);
            const rowParentContextVar = block.createAddRowParentContextVar(rowsetCV);
            draft.contextVars.push(rowOrderContextVar);
            draft.contextVars.push(rowParentContextVar);
            draft.contextVarValues[rowOrderContextVar.id] = { type: "literal", valueType: "number", value: order };
            draft.contextVarValues[rowParentContextVar.id] = parent;
        });
        ctx.actionLibrary.createAction(blockDef.addRowAction).performAction(innerCtx);
    };
    const handleRemoveRow = (chartRowIndex) => {
        // Confirm if confirm message
        if (blockDef.removeConfirmMessage) {
            if (!confirm((0, localization_1.localize)(blockDef.removeConfirmMessage, ctx.locale))) {
                return;
            }
        }
        // Delete recursively
        const txn = ctx.database.transaction();
        function deleteDescendants(rowId) {
            // Lookup row
            const row = rows.find((r) => r.id == rowId);
            // Delete any children
            for (const child of rows) {
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
        let order = null;
        // Add order as next number of ordered column if type is number
        if (orderType == "number") {
            order = 0;
            for (const row of rows) {
                if (!row.parent && row.order >= order) {
                    order = row.order + 1;
                }
            }
        }
        handleAddRow(null, order);
    }
    let startDate;
    let endDate;
    // Use override if present
    if (blockDef.startDate) {
        startDate = blockDef.startDate;
    }
    else {
        // Go earliest with a buffer
        const minStartDate = rows.reduce((acc, row) => (!acc || (row.startDate && row.startDate < acc) ? row.startDate : acc), null);
        if (minStartDate) {
            startDate = (0, moment_1.default)(minStartDate, "YYYY-MM-DD").subtract(1, "month").format("YYYY-MM-DD");
        }
        else {
            // Start of year
            startDate = (0, moment_1.default)().startOf("year").format("YYYY-MM-DD");
        }
    }
    // Use override if present
    if (blockDef.endDate) {
        endDate = blockDef.endDate;
    }
    else {
        // Go earliest with a buffer
        const maxEndDate = rows.reduce((acc, row) => (!acc || (row.endDate && row.endDate > acc) ? row.endDate : acc), null);
        if (maxEndDate) {
            endDate = (0, moment_1.default)(maxEndDate, "YYYY-MM-DD").add(1, "month").format("YYYY-MM-DD");
        }
        else {
            // End of year
            endDate = (0, moment_1.default)().endOf("year").format("YYYY-MM-DD");
        }
    }
    const isOrdered = blockDef.rowOrderColumn != null;
    const isHierarchical = blockDef.rowParentColumn != null;
    return (react_2.default.createElement(GanttChart_1.GanttChart, { rows: chartRows, startDate: startDate, endDate: endDate, onMoveRowDown: isOrdered ? handleMoveRowDown : undefined, onMoveRowUp: isOrdered ? handleMoveRowUp : undefined, onMoveRowLeft: isOrdered && isHierarchical ? handleMoveRowLeft : undefined, onMoveRowRight: isOrdered && isHierarchical ? handleMoveRowRight : undefined, onInsertChildRow: isOrdered && isHierarchical ? handleInsertChildRow : undefined, onInsertRowAbove: isOrdered && isHierarchical ? handleInsertRowAbove : undefined, onInsertRowBelow: isOrdered && isHierarchical ? handleInsertRowBelow : undefined, onRowClick: blockDef.rowClickAction ? handleRowClick : undefined, onAddRow: blockDef.addRowAction ? handleAppendRow : undefined, addRowLabel: blockDef.addRowLabel
            ? [react_2.default.createElement("i", { className: "fa fa-plus" }), " ", (0, localization_1.localize)(blockDef.addRowLabel, ctx.locale)]
            : undefined, onRemoveRow: blockDef.allowRemove ? handleRemoveRow : undefined, T: ctx.T }));
}
exports.GanttChartInstance = GanttChartInstance;
/** Performs operation to convert from query rows to chart rows
 * which involves making the results into a sorted tree and then
 * returning the rows in depth-first order, adding any labels as
 * required.
 * prefixNumber adds 1.1, 1.2.3, etc before label
 */
function createChartRows(options) {
    const chartRows = [];
    /** Add all rows, sorted, that have this as a parent */
    function addRows(parent, level, prefix) {
        const childRows = options.queryRows.filter((r) => r.parent == parent);
        // Sort by order
        childRows.sort((a, b) => (a.order > b.order ? 1 : -1));
        // Add each row, then add its children
        childRows.forEach((row, index) => {
            chartRows.push({
                id: row.id,
                color: options.getColor(row),
                level: level,
                startDate: row.startDate,
                endDate: row.endDate,
                label: options.prefixNumber ? `${prefix}${index + 1}. ${row.label}` || "" : row.label || ""
            });
            addRows(row.id, level + 1, `${prefix}${index + 1}.`);
        });
    }
    addRows(null, 0, "");
    return chartRows;
}
exports.createChartRows = createChartRows;
