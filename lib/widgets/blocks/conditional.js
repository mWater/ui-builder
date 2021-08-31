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
exports.ConditionalBlock = void 0;
const immer_1 = __importDefault(require("immer"));
const React = __importStar(require("react"));
const blocks_1 = require("../blocks");
const propertyEditors_1 = require("../propertyEditors");
class ConditionalBlock extends blocks_1.Block {
    getChildren(contextVars) {
        if (this.blockDef.content) {
            return [{ blockDef: this.blockDef.content, contextVars: contextVars }];
        }
        return [];
    }
    validate(ctx) {
        return (0, blocks_1.validateContextVarExpr)({
            schema: ctx.schema,
            contextVars: ctx.contextVars,
            contextVarId: this.blockDef.contextVarId,
            expr: this.blockDef.expr,
            types: ["boolean"]
        });
    }
    processChildren(action) {
        const content = action(this.blockDef.content);
        return (0, immer_1.default)(this.blockDef, draft => {
            draft.content = content;
        });
    }
    /** Get context variable expressions needed to add */
    getContextVarExprs(contextVar) {
        return (contextVar.id === this.blockDef.contextVarId && this.blockDef.expr) ? [this.blockDef.expr] : [];
    }
    renderDesign(props) {
        const handleSetContent = (blockDef) => {
            props.store.alterBlock(this.id, (0, immer_1.default)((b) => {
                b.content = blockDef;
                return b;
            }), blockDef.id);
        };
        const contentNode = props.renderChildBlock(props, this.blockDef.content, handleSetContent);
        return (React.createElement("div", { style: { paddingTop: 5, paddingBottom: 5, border: "dashed 1px #CCC" } }, contentNode));
    }
    renderInstance(props) {
        // Check expression value
        const value = props.getContextVarExprValue(this.blockDef.contextVarId, this.blockDef.expr);
        if (!value) {
            return React.createElement("div", null);
        }
        return React.createElement("div", null, props.renderChildBlock(props, this.blockDef.content));
    }
    renderEditor(props) {
        return (React.createElement("div", null,
            React.createElement("h3", null, "Conditional"),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Conditional Expression" },
                React.createElement(propertyEditors_1.ContextVarExprPropertyEditor, { contextVars: props.contextVars, schema: props.schema, dataSource: props.dataSource, aggrStatuses: ["individual", "aggregate", "literal"], types: ["boolean"], contextVarId: this.blockDef.contextVarId, expr: this.blockDef.expr, onChange: (contextVarId, expr) => {
                        props.store.replaceBlock(Object.assign(Object.assign({}, this.blockDef), { contextVarId, expr }));
                    } }))));
    }
}
exports.ConditionalBlock = ConditionalBlock;
