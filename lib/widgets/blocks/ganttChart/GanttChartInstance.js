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
exports.GanttChartInstance = void 0;
var lodash_1 = __importDefault(require("lodash"));
var react_1 = require("react");
var contexts_1 = require("../../../contexts");
var Database_1 = require("../../../database/Database");
var canonical_json_1 = __importDefault(require("canonical-json"));
var react_2 = __importDefault(require("react"));
var GanttChart_1 = require("react-library/lib/GanttChart");
var moment_1 = __importDefault(require("moment"));
var immer_1 = require("immer");
function GanttChartInstance(props) {
    var _this = this;
    var block = props.block, ctx = props.ctx;
    var blockDef = block.blockDef;
    var rowsetCV = ctx.contextVars.find(function (cv) { return cv.id == blockDef.rowsetContextVarId; });
    var rowCV = block.createRowContextVar(rowsetCV);
    /** Incremented when database changed */
    var dbChanged = Database_1.useDatabaseChangeListener(ctx.database);
    // Get row expressions that depend on rowCV
    var rowClickAction = blockDef.rowClickAction ? ctx.actionLibrary.createAction(blockDef.rowClickAction) : undefined;
    var rowExprs = rowClickAction ? rowClickAction.getContextVarExprs(rowCV) : [];
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
        // Add expressions for rowClickAction as e0, e1, etc.
        rowExprs.forEach(function (expr, index) {
            query.select["e" + index] = expr;
        });
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
    // Create chart
    var chartRows = rows.map(function (row) { return ({
        id: row.id,
        color: blockDef.barColor || "#68cdee",
        level: 0,
        startDate: row.startDate,
        endDate: row.endDate,
        label: row.label || ""
    }); });
    /** Create instance ctx for a clicked row */
    function createRowInstanceCtx(row) {
        var _a;
        var innerContextVars = ctx.contextVars.concat(rowCV);
        // Row context variable value
        var cvvalue = row.id;
        return __assign(__assign({}, ctx), { contextVars: innerContextVars, contextVarValues: __assign(__assign({}, ctx.contextVarValues), (_a = {}, _a[rowCV.id] = cvvalue, _a)), getContextVarExprValue: function (cvid, expr) {
                if (cvid !== rowCV.id) {
                    return ctx.getContextVarExprValue(cvid, expr);
                }
                // Look up expression
                var exprIndex = rowExprs.findIndex(function (rowExpr) { return lodash_1.default.isEqual(expr, rowExpr); });
                return row["e" + exprIndex];
            } });
    }
    var handleRowClick = function (chartRowIndex) {
        // Lookup row
        var row = rows.find(function (r) { return r.id == chartRows[chartRowIndex].id; });
        // Create context with variables 
        rowClickAction.performAction(createRowInstanceCtx(row));
    };
    var handleAddRow = function (parent, order) {
        // Create context with additional variables
        var innerCtx = immer_1.produce(ctx, function (draft) {
            var rowOrderContextVar = block.createAddRowOrderContextVar(rowsetCV);
            var rowParentContextVar = block.createAddRowParentContextVar(rowsetCV);
            draft.contextVars.push(rowOrderContextVar);
            draft.contextVars.push(rowParentContextVar);
            draft.contextVarValues[rowOrderContextVar.id] = order;
            draft.contextVarValues[rowParentContextVar.id] = parent;
        });
        ctx.actionLibrary.createAction(blockDef.addRowAction).performAction(innerCtx);
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
    // Determine start and end dates
    var startDate = blockDef.startDate || rows.reduce(function (acc, row) { return !acc || (row.startDate && row.startDate < acc) ? row.startDate : acc; }, null);
    var endDate = blockDef.endDate || rows.reduce(function (acc, row) { return !acc || (row.endDate && row.endDate > acc) ? row.endDate : acc; }, null);
    if (!startDate) {
        startDate = moment_1.default().startOf("year").format("YYYY-MM-DD");
    }
    if (!endDate) {
        endDate = moment_1.default().endOf("year").format("YYYY-MM-DD");
    }
    return react_2.default.createElement(GanttChart_1.GanttChart, { rows: chartRows, startDate: startDate, endDate: endDate, onRowClick: blockDef.rowClickAction ? handleRowClick : undefined, onAddRow: blockDef.addRowAction ? handleAppendRow : undefined, T: ctx.T });
}
exports.GanttChartInstance = GanttChartInstance;
