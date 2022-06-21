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
exports.VariableBlock = void 0;
const immer_1 = __importDefault(require("immer"));
const React = __importStar(require("react"));
const blocks_1 = require("../blocks");
const mwater_expressions_1 = require("mwater-expressions");
const ContextVarsInjector_1 = __importDefault(require("../ContextVarsInjector"));
const bootstrap_1 = require("react-library/lib/bootstrap");
const propertyEditors_1 = require("../propertyEditors");
const __1 = require("../..");
class VariableBlock extends blocks_1.Block {
    getContextVarExprs(contextVar, ctx) {
        if (this.blockDef.contextVarExpr != null && this.blockDef.contextVarExpr.contextVarId == contextVar.id) {
            return [this.blockDef.contextVarExpr.expr];
        }
        return [];
    }
    getChildren(contextVars, schema) {
        if (this.blockDef.content) {
            const contextVar = this.createContextVar(contextVars, schema);
            return [
                { blockDef: this.blockDef.content, contextVars: contextVar ? contextVars.concat([contextVar]) : contextVars }
            ];
        }
        return [];
    }
    createContextVar(contextVars, schema) {
        if (!this.blockDef.contextVarExpr) {
            return null;
        }
        // Determine type of context variable
        const exprUtils = new mwater_expressions_1.ExprUtils(schema, (0, blocks_1.createExprVariables)(contextVars));
        const expr = this.blockDef.contextVarExpr.expr;
        const type = exprUtils.getExprType(expr);
        if (type) {
            // Type of variable matches the type of the expression
            return {
                type: type,
                id: this.blockDef.id,
                name: this.blockDef.name || "Unnamed",
                idTable: exprUtils.getExprIdTable(expr) || undefined,
                enumValues: exprUtils.getExprEnumValues(expr) || undefined
            };
        }
        return null;
    }
    validate(ctx) {
        if (!this.blockDef.contextVarExpr) {
            return "Expression required";
        }
        return (0, __1.validateContextVarExpr)({
            schema: ctx.schema,
            contextVars: ctx.contextVars,
            contextVarId: this.blockDef.contextVarExpr.contextVarId,
            expr: this.blockDef.contextVarExpr.expr
        });
    }
    processChildren(action) {
        const content = action(this.blockDef.content);
        return (0, immer_1.default)(this.blockDef, (draft) => {
            draft.content = content;
        });
    }
    renderDesign(ctx) {
        const handleSetContent = (blockDef) => {
            ctx.store.alterBlock(this.id, (0, immer_1.default)((b) => {
                b.content = blockDef;
                return b;
            }), blockDef.id);
        };
        // Create props for child
        const contextVar = this.createContextVar(ctx.contextVars, ctx.schema);
        let contentCtx = ctx;
        // Add context variable if knowable
        if (contextVar) {
            contentCtx = Object.assign(Object.assign({}, contentCtx), { contextVars: ctx.contextVars.concat([contextVar]) });
        }
        const contentNode = ctx.renderChildBlock(contentCtx, this.blockDef.content, handleSetContent);
        return React.createElement("div", { style: { paddingTop: 5, paddingBottom: 5, border: "dashed 1px #CCC" } }, contentNode);
    }
    renderInstance(ctx) {
        const contextVar = this.createContextVar(ctx.contextVars, ctx.schema);
        // Get the literal value
        const literalValue = ctx.getContextVarExprValue(this.blockDef.contextVarExpr.contextVarId, this.blockDef.contextVarExpr.expr);
        // Get the type of the context variable
        const exprUtils = new mwater_expressions_1.ExprUtils(ctx.schema, (0, blocks_1.createExprVariables)(ctx.contextVars));
        const literalType = exprUtils.getExprType(this.blockDef.contextVarExpr.expr);
        // Create literal value
        const literalExpr = { type: "literal", valueType: literalType, value: literalValue };
        // Inject context variable
        return (React.createElement(ContextVarsInjector_1.default, { injectedContextVars: [contextVar], injectedContextVarValues: { [contextVar.id]: literalExpr }, innerBlock: this.blockDef.content, instanceCtx: ctx }, (instanceCtx, loading, refreshing) => {
            if (loading) {
                return (React.createElement("div", { style: { color: "#AAA", textAlign: "center" } },
                    React.createElement("i", { className: "fa fa-circle-o-notch fa-spin" })));
            }
            return ctx.renderChildBlock(instanceCtx, this.blockDef.content);
        }));
    }
    renderEditor(props) {
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Expression to evaluate" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "contextVarExpr" }, (value, onChange) => React.createElement(__1.ContextVarExprPropertyEditor, { contextVarExpr: value, contextVars: props.contextVars, schema: props.schema, dataSource: props.dataSource, onChange: onChange }))),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Name of the variable" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "name" }, (value, onChange) => React.createElement(bootstrap_1.TextInput, { value: value || null, onChange: onChange, placeholder: "Unnamed" })))));
    }
}
exports.VariableBlock = VariableBlock;
