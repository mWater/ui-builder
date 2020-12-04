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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddRowBlock = void 0;
var immer_1 = __importDefault(require("immer"));
var React = __importStar(require("react"));
var blocks_1 = require("../blocks");
var mwater_expressions_1 = require("mwater-expressions");
var ContextVarsInjector_1 = __importDefault(require("../ContextVarsInjector"));
var bootstrap_1 = require("react-library/lib/bootstrap");
var propertyEditors_1 = require("../propertyEditors");
var columnValues_1 = require("../columnValues");
var AddRowBlock = /** @class */ (function (_super) {
    __extends(AddRowBlock, _super);
    function AddRowBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AddRowBlock.prototype.getChildren = function (contextVars) {
        if (this.blockDef.content) {
            var contextVar = this.createContextVar();
            return [{ blockDef: this.blockDef.content, contextVars: contextVar ? contextVars.concat([contextVar]) : contextVars }];
        }
        return [];
    };
    AddRowBlock.prototype.createContextVar = function () {
        // Don't create new context variable if reusing existing
        if (this.blockDef.table && !this.blockDef.existingContextVarId) {
            return { type: "row", id: this.blockDef.id, name: this.blockDef.name || "Added row", table: this.blockDef.table };
        }
        return null;
    };
    AddRowBlock.prototype.validate = function (options) {
        var _this = this;
        var error;
        // Check that table is present
        if (!this.blockDef.table || !options.schema.getTable(this.blockDef.table)) {
            return "Table required";
        }
        // Check that existing context variable from same table
        if (this.blockDef.table && this.blockDef.existingContextVarId) {
            var cv = options.contextVars.find(function (cv) { return cv.id == _this.blockDef.existingContextVarId; });
            if (!cv) {
                return "Existing context variable not found";
            }
            if (cv.table != this.blockDef.table) {
                return "Existing context variable from wrong table";
            }
        }
        // Check each column value
        for (var _i = 0, _a = Object.keys(this.blockDef.columnValues); _i < _a.length; _i++) {
            var columnId = _a[_i];
            error = this.validateColumnValue(options, columnId);
            if (error) {
                return error;
            }
        }
        return null;
    };
    AddRowBlock.prototype.validateColumnValue = function (options, columnId) {
        // Check that column exists
        var column = options.schema.getColumn(this.blockDef.table, columnId);
        if (!column) {
            return "Column not found";
        }
        var exprValidator = new mwater_expressions_1.ExprValidator(options.schema, blocks_1.createExprVariables(options.contextVars));
        var exprUtils = new mwater_expressions_1.ExprUtils(options.schema, blocks_1.createExprVariables(options.contextVars));
        // Check context var
        var contextVarExpr = this.blockDef.columnValues[columnId];
        var contextVar;
        if (contextVarExpr.contextVarId) {
            contextVar = options.contextVars.find(function (cv) { return cv.id === contextVarExpr.contextVarId; });
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
        // Validate expr
        var error;
        error = exprValidator.validateExpr(contextVarExpr.expr, { table: contextVar ? contextVar.table : undefined, types: [column.type] });
        if (error) {
            return error;
        }
        return null;
    };
    AddRowBlock.prototype.processChildren = function (action) {
        var content = action(this.blockDef.content);
        return immer_1.default(this.blockDef, function (draft) {
            draft.content = content;
        });
    };
    /** Get context variable expressions needed to add */
    AddRowBlock.prototype.getContextVarExprs = function (contextVar) {
        // Get ones for the specified context var
        return Object.values(this.blockDef.columnValues).filter(function (cve) { return cve.contextVarId === contextVar.id; }).map(function (cve) { return cve.expr; });
    };
    AddRowBlock.prototype.renderDesign = function (props) {
        var _this = this;
        var handleSetContent = function (blockDef) {
            props.store.alterBlock(_this.id, immer_1.default(function (b) {
                b.content = blockDef;
                return b;
            }), blockDef.id);
        };
        // Create props for child
        var contextVar = this.createContextVar();
        var contentProps = props;
        // Add context variable if knowable
        if (contextVar) {
            contentProps = __assign(__assign({}, contentProps), { contextVars: props.contextVars.concat([contextVar]) });
        }
        var contentNode = props.renderChildBlock(contentProps, this.blockDef.content, handleSetContent);
        return (React.createElement("div", { style: { paddingTop: 5, paddingBottom: 5, border: "dashed 1px #CCC" } }, contentNode));
    };
    AddRowBlock.prototype.renderInstance = function (props) {
        var _this = this;
        var contextVar = this.createContextVar() || props.contextVars.find(function (cv) { return cv.id == _this.blockDef.existingContextVarId; });
        return React.createElement(AddRowInstance, { blockDef: this.blockDef, contextVar: contextVar, instanceCtx: props });
    };
    AddRowBlock.prototype.renderEditor = function (props) {
        var _this = this;
        return (React.createElement("div", null,
            React.createElement("h3", null, "Add Row"),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Table" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "table" }, function (value, onChange) {
                    return React.createElement(propertyEditors_1.TableSelect, { schema: props.schema, locale: props.locale, value: value, onChange: function (t) { return onChange(t); } });
                })),
            this.blockDef.table ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Mode" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "existingContextVarId" }, function (value, onChange) {
                        return React.createElement("div", null,
                            React.createElement(bootstrap_1.Radio, { key: "null", radioValue: null, value: value || null, onChange: onChange }, "Always add new row"),
                            props.contextVars.filter(function (cv) { return cv.table == _this.blockDef.table && cv.type == "row"; }).map(function (cv) { return (React.createElement(bootstrap_1.Radio, { key: cv.id, radioValue: cv.id, value: value, onChange: onChange },
                                "Use ",
                                React.createElement("i", null, cv.name),
                                " if it has a value")); }));
                    }))
                : null,
            !this.blockDef.existingContextVarId ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Variable Name" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "name" }, function (value, onChange) { return React.createElement(bootstrap_1.TextInput, { value: value || null, onChange: onChange, placeholder: "Unnamed" }); }))
                : null,
            this.blockDef.table ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Column Values" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "columnValues" }, function (value, onChange) {
                        return React.createElement(columnValues_1.ColumnValuesEditor, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, table: _this.blockDef.table, contextVars: props.contextVars, locale: props.locale });
                    }))
                : null));
    };
    return AddRowBlock;
}(blocks_1.Block));
exports.AddRowBlock = AddRowBlock;
/** Instance which adds a row and then injects as context variable */
var AddRowInstance = /** @class */ (function (_super) {
    __extends(AddRowInstance, _super);
    function AddRowInstance(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            addedRowId: null
        };
        return _this;
    }
    AddRowInstance.prototype.componentDidMount = function () {
        // Only perform add if not reusing
        if (this.doesNeedAdd()) {
            this.performAdd();
        }
    };
    AddRowInstance.prototype.doesNeedAdd = function () {
        return !this.props.blockDef.existingContextVarId || !this.props.instanceCtx.contextVarValues[this.props.blockDef.existingContextVarId];
    };
    AddRowInstance.prototype.performAdd = function () {
        return __awaiter(this, void 0, void 0, function () {
            var row, _i, _a, columnId, contextVarExpr, txn, addedRowId, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        row = {};
                        for (_i = 0, _a = Object.keys(this.props.blockDef.columnValues); _i < _a.length; _i++) {
                            columnId = _a[_i];
                            contextVarExpr = this.props.blockDef.columnValues[columnId];
                            row[columnId] = this.props.instanceCtx.getContextVarExprValue(contextVarExpr.contextVarId, contextVarExpr.expr);
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        txn = this.props.instanceCtx.database.transaction();
                        return [4 /*yield*/, txn.addRow(this.props.blockDef.table, row)];
                    case 2:
                        addedRowId = _b.sent();
                        return [4 /*yield*/, txn.commit()];
                    case 3:
                        _b.sent();
                        this.setState({ addedRowId: addedRowId });
                        return [3 /*break*/, 5];
                    case 4:
                        err_1 = _b.sent();
                        // TODO localize
                        alert("Unable to add row: " + err_1.message);
                        return [2 /*return*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    AddRowInstance.prototype.render = function () {
        var _a;
        var _this = this;
        if (this.doesNeedAdd()) {
            // Render wait while adding
            if (!this.state.addedRowId) {
                return React.createElement("div", { style: { color: "#AAA", fontSize: 18, textAlign: "center" } },
                    React.createElement("i", { className: "fa fa-circle-o-notch fa-spin" }));
            }
            // Inject context variable
            return React.createElement(ContextVarsInjector_1.default, { injectedContextVars: [this.props.contextVar], injectedContextVarValues: (_a = {}, _a[this.props.contextVar.id] = this.state.addedRowId, _a), innerBlock: this.props.blockDef.content, instanceCtx: this.props.instanceCtx }, function (instanceCtx, loading, refreshing) {
                if (loading) {
                    return React.createElement("div", { style: { color: "#AAA", fontSize: 18, textAlign: "center" } },
                        React.createElement("i", { className: "fa fa-circle-o-notch fa-spin" }));
                }
                return (React.createElement("div", { style: { opacity: refreshing ? 0.6 : undefined } }, _this.props.instanceCtx.renderChildBlock(instanceCtx, _this.props.blockDef.content)));
            });
        }
        else {
            // Just render if add not needed
            return this.props.instanceCtx.renderChildBlock(this.props.instanceCtx, this.props.blockDef.content);
        }
    };
    return AddRowInstance;
}(React.Component));
