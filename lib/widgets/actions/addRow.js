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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddRowAction = void 0;
var React = __importStar(require("react"));
var actions_1 = require("../actions");
var mwater_expressions_1 = require("mwater-expressions");
var blocks_1 = require("../blocks");
var propertyEditors_1 = require("../propertyEditors");
var columnValues_1 = require("../columnValues");
var evalContextVarExpr_1 = require("../evalContextVarExpr");
var AddRowAction = /** @class */ (function (_super) {
    __extends(AddRowAction, _super);
    function AddRowAction() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AddRowAction.prototype.performAction = function (instanceCtx) {
        return __awaiter(this, void 0, void 0, function () {
            var row, _loop_1, this_1, _i, _a, columnId, txn;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        row = {};
                        _loop_1 = function (columnId) {
                            var contextVarExpr, contextVar, _a, _b;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        contextVarExpr = this_1.actionDef.columnValues[columnId];
                                        contextVar = contextVarExpr.contextVarId ? instanceCtx.contextVars.find(function (cv) { return cv.id == contextVarExpr.contextVarId; }) : null;
                                        _a = row;
                                        _b = columnId;
                                        return [4 /*yield*/, evalContextVarExpr_1.evalContextVarExpr({
                                                contextVar: contextVar,
                                                contextVarValue: contextVar ? instanceCtx.contextVarValues[contextVar.id] : null,
                                                ctx: instanceCtx,
                                                expr: contextVarExpr.expr
                                            })];
                                    case 1:
                                        _a[_b] = _c.sent();
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _i = 0, _a = Object.keys(this.actionDef.columnValues);
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        columnId = _a[_i];
                        return [5 /*yield**/, _loop_1(columnId)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        txn = instanceCtx.database.transaction();
                        return [4 /*yield*/, txn.addRow(this.actionDef.table, row)];
                    case 5:
                        _b.sent();
                        return [4 /*yield*/, txn.commit()];
                    case 6:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AddRowAction.prototype.validate = function (designCtx) {
        // Check that table is present
        if (!this.actionDef.table || !designCtx.schema.getTable(this.actionDef.table)) {
            return "Table required";
        }
        // Check each column value
        for (var _i = 0, _a = Object.keys(this.actionDef.columnValues); _i < _a.length; _i++) {
            var columnId = _a[_i];
            var error = this.validateColumnValue(designCtx, columnId);
            if (error) {
                return error;
            }
        }
        return null;
    };
    AddRowAction.prototype.validateColumnValue = function (designCtx, columnId) {
        // Check that column exists
        var column = designCtx.schema.getColumn(this.actionDef.table, columnId);
        if (!column) {
            return "Column not found";
        }
        var exprValidator = new mwater_expressions_1.ExprValidator(designCtx.schema, blocks_1.createExprVariables(designCtx.contextVars));
        var exprUtils = new mwater_expressions_1.ExprUtils(designCtx.schema, blocks_1.createExprVariables(designCtx.contextVars));
        // Check context var
        var contextVarExpr = this.actionDef.columnValues[columnId];
        var contextVar;
        if (contextVarExpr.contextVarId) {
            contextVar = designCtx.contextVars.find(function (cv) { return cv.id === contextVarExpr.contextVarId; });
            if (!contextVar || !contextVar.table) {
                return "Context variable not found";
            }
        }
        else {
            contextVar = undefined;
            // Must be literal
            var aggrStatus = exprUtils.getExprAggrStatus(contextVarExpr.expr);
            if (aggrStatus && aggrStatus !== "literal") {
                return "Literal value required";
            }
        }
        // Override for special case of allowing to set joins
        var idTable = column.type == "join" ? column.join.toTable : column.idTable;
        var type = column.type == "join" ? "id" : column.type;
        // Validate expr
        var error;
        error = exprValidator.validateExpr(contextVarExpr.expr, {
            table: contextVar ? contextVar.table : undefined,
            types: [type],
            idTable: idTable,
            aggrStatuses: contextVar && contextVar.type == "rowset" ? ["aggregate", "literal"] : ["individual", "literal"]
        });
        if (error) {
            return error;
        }
        return null;
    };
    AddRowAction.prototype.renderEditor = function (props) {
        var _this = this;
        var onChange = props.onChange;
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Table" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.actionDef, onChange: onChange, property: "table" }, function (value, onChange) {
                    return React.createElement(propertyEditors_1.TableSelect, { schema: props.schema, locale: props.locale, value: value, onChange: onChange });
                })),
            this.actionDef.table ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Column Values" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.actionDef, onChange: onChange, property: "columnValues" }, function (value, onChange) {
                        return React.createElement(columnValues_1.ColumnValuesEditor, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, table: _this.actionDef.table, contextVars: props.contextVars, locale: props.locale });
                    }))
                : null));
    };
    return AddRowAction;
}(actions_1.Action));
exports.AddRowAction = AddRowAction;
