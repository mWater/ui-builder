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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RowBlock = void 0;
var immer_1 = __importDefault(require("immer"));
var React = __importStar(require("react"));
var blocks_1 = require("../blocks");
var mwater_expressions_1 = require("mwater-expressions");
var ContextVarsInjector_1 = __importDefault(require("../ContextVarsInjector"));
var bootstrap_1 = require("react-library/lib/bootstrap");
var mwater_expressions_ui_1 = require("mwater-expressions-ui");
var propertyEditors_1 = require("../propertyEditors");
var localization_1 = require("../localization");
var react_1 = require("react");
var contexts_1 = require("../../contexts");
var RowBlock = /** @class */ (function (_super) {
    __extends(RowBlock, _super);
    function RowBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RowBlock.prototype.getChildren = function (contextVars) {
        if (this.blockDef.content) {
            var contextVar = this.createContextVar();
            return [{ blockDef: this.blockDef.content, contextVars: contextVar ? contextVars.concat([contextVar]) : contextVars }];
        }
        return [];
    };
    RowBlock.prototype.createContextVar = function () {
        if (this.blockDef.table) {
            return { type: "row", id: this.blockDef.id, name: this.blockDef.name || "Unnamed", table: this.blockDef.table };
        }
        return null;
    };
    RowBlock.prototype.getContextVarExprs = function (contextVar, ctx) {
        if (this.blockDef.idContextVarExpr && contextVar.id == this.blockDef.idContextVarExpr.contextVarId) {
            return [this.blockDef.idContextVarExpr.expr];
        }
        return [];
    };
    RowBlock.prototype.validate = function (options) {
        var exprValidator = new mwater_expressions_1.ExprValidator(options.schema, blocks_1.createExprVariables(options.contextVars));
        var error;
        if (!this.blockDef.table) {
            return "Missing table";
        }
        var mode = this.blockDef.mode || "filter";
        // Validate filter
        if (mode == "filter") {
            error = exprValidator.validateExpr(this.blockDef.filter || null, { table: this.blockDef.table, types: ["boolean"] });
            if (error) {
                return error;
            }
        }
        // Validate idContextVarExpr
        if (mode == "id") {
            if (!this.blockDef.idContextVarExpr) {
                return "Id expression required";
            }
            error = blocks_1.validateContextVarExpr({
                contextVars: options.contextVars,
                schema: options.schema,
                contextVarId: this.blockDef.idContextVarExpr.contextVarId,
                expr: this.blockDef.idContextVarExpr.expr,
                idTable: this.blockDef.table,
                types: ["id"],
            });
            if (error) {
                return error;
            }
        }
        return null;
    };
    RowBlock.prototype.processChildren = function (action) {
        var content = action(this.blockDef.content);
        return immer_1.default(this.blockDef, function (draft) {
            draft.content = content;
        });
    };
    RowBlock.prototype.renderDesign = function (props) {
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
    RowBlock.prototype.renderInstance = function (props) {
        var contextVar = this.createContextVar();
        return React.createElement(RowInstance, { contextVar: contextVar, blockDef: this.blockDef, instanceProps: props });
    };
    RowBlock.prototype.renderEditor = function (props) {
        var _this = this;
        var handleTableChange = function (tableId) {
            var table = props.schema.getTable(tableId);
            props.store.replaceBlock(immer_1.default(_this.blockDef, function (bd) {
                bd.table = tableId;
                bd.name = bd.name || localization_1.localize(table.name);
            }));
        };
        var mode = this.blockDef.mode || "filter";
        return (React.createElement("div", null,
            React.createElement("h3", null, "Row"),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Table" },
                React.createElement(propertyEditors_1.TableSelect, { schema: props.schema, locale: props.locale, value: this.blockDef.table || null, onChange: handleTableChange })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Name" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "name" }, function (value, onChange) { return React.createElement(bootstrap_1.TextInput, { value: value || null, onChange: onChange, placeholder: "Unnamed" }); })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Mode", key: "mode" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "mode" }, function (value, onChange) {
                    return React.createElement(bootstrap_1.Toggle, { value: value || "filter", onChange: onChange, options: [
                            { value: "filter", label: "By Filter" },
                            { value: "id", label: "By ID" }
                        ] });
                })),
            this.blockDef.table && mode == "filter" ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Filter", help: "Should only match one row" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "filter" }, function (value, onChange) {
                        return React.createElement(mwater_expressions_ui_1.FilterExprComponent, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, table: _this.blockDef.table, variables: blocks_1.createExprVariables(props.contextVars) });
                    }))
                : null,
            this.blockDef.table && mode == "id" ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "ID of row" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "idContextVarExpr" }, function (value, onChange) {
                        return React.createElement(propertyEditors_1.ContextVarExprPropertyEditor, { contextVars: props.contextVars, contextVarId: value ? value.contextVarId : null, expr: value ? value.expr : null, onChange: function (contextVarId, expr) {
                                onChange({ contextVarId: contextVarId, expr: expr });
                            }, schema: props.schema, dataSource: props.dataSource, idTable: _this.blockDef.table, types: ["id"] });
                    }))
                : null));
    };
    return RowBlock;
}(blocks_1.Block));
exports.RowBlock = RowBlock;
var RowInstance = function (props) {
    var _a;
    var blockDef = props.blockDef, instanceProps = props.instanceProps, contextVar = props.contextVar;
    var db = instanceProps.database;
    var table = contextVar.table;
    var _b = react_1.useState(null), error = _b[0], setError = _b[1];
    var _c = react_1.useState(true), loading = _c[0], setLoading = _c[1];
    var _d = react_1.useState(), id = _d[0], setId = _d[1];
    var mode = blockDef.mode || "filter";
    react_1.useEffect(function () {
        if (mode == "filter") {
            // Query to get match
            db.query({
                select: { id: { type: "id", table: table } },
                from: table,
                where: blockDef.filter,
                limit: 1
            }, instanceProps.contextVars, contexts_1.getFilteredContextVarValues(instanceProps))
                .then(function (rows) {
                if (rows.length > 0) {
                    setId(rows[0].id);
                }
                else {
                    setId(null);
                }
                setLoading(false);
            })
                .catch(function (err) {
                setError(err);
                setLoading(false);
            });
        }
        else {
            // Just set id from context var
            var exprValue = instanceProps.getContextVarExprValue(blockDef.idContextVarExpr.contextVarId, blockDef.idContextVarExpr.expr);
            setId(exprValue);
            setLoading(false);
        }
    }, []);
    if (loading) {
        return React.createElement("div", { style: { color: "#AAA", fontSize: 18, textAlign: "center" } },
            React.createElement("i", { className: "fa fa-circle-o-notch fa-spin" }));
    }
    if (error) {
        return React.createElement("div", { className: "alert alert-danger" }, "Error loading results");
    }
    if (!id) {
        return React.createElement("div", { className: "alert alert-warning" }, "Not found");
    }
    // Inject context variable
    return React.createElement(ContextVarsInjector_1.default, { injectedContextVars: [contextVar], injectedContextVarValues: (_a = {}, _a[contextVar.id] = id, _a), innerBlock: blockDef.content, instanceCtx: instanceProps }, function (instanceCtx, loading, refreshing) {
        if (loading) {
            return React.createElement("div", { style: { color: "#AAA", fontSize: 18, textAlign: "center" } },
                React.createElement("i", { className: "fa fa-circle-o-notch fa-spin" }));
        }
        return (React.createElement("div", { style: { opacity: refreshing ? 0.6 : undefined } }, instanceProps.renderChildBlock(instanceCtx, blockDef.content)));
    });
};
