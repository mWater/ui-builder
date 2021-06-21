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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RowsetBlock = void 0;
const immer_1 = __importDefault(require("immer"));
const React = __importStar(require("react"));
const blocks_1 = require("../blocks");
const mwater_expressions_1 = require("mwater-expressions");
const ContextVarsInjector_1 = __importDefault(require("../ContextVarsInjector"));
const bootstrap_1 = require("react-library/lib/bootstrap");
const mwater_expressions_ui_1 = require("mwater-expressions-ui");
const propertyEditors_1 = require("../propertyEditors");
const localization_1 = require("../localization");
class RowsetBlock extends blocks_1.Block {
    getChildren(contextVars) {
        if (this.blockDef.content) {
            const contextVar = this.createContextVar();
            return [{ blockDef: this.blockDef.content, contextVars: contextVar ? contextVars.concat([contextVar]) : contextVars }];
        }
        return [];
    }
    createContextVar() {
        if (this.blockDef.table) {
            return { type: "rowset", id: this.blockDef.id, name: this.blockDef.name || "Unnamed", table: this.blockDef.table };
        }
        return null;
    }
    validate(options) {
        const exprValidator = new mwater_expressions_1.ExprValidator(options.schema, blocks_1.createExprVariables(options.contextVars));
        let error;
        if (!this.blockDef.table) {
            return "Missing table";
        }
        // Validate where
        error = exprValidator.validateExpr(this.blockDef.filter, { table: this.blockDef.table, types: ["boolean"] });
        if (error) {
            return error;
        }
        return null;
    }
    processChildren(action) {
        const content = action(this.blockDef.content);
        return immer_1.default(this.blockDef, draft => {
            draft.content = content;
        });
    }
    renderDesign(props) {
        const handleSetContent = (blockDef) => {
            props.store.alterBlock(this.id, immer_1.default((b) => {
                b.content = blockDef;
                return b;
            }), blockDef.id);
        };
        // Create props for child
        const contextVar = this.createContextVar();
        let contentProps = props;
        // Add context variable if knowable
        if (contextVar) {
            contentProps = Object.assign(Object.assign({}, contentProps), { contextVars: props.contextVars.concat([contextVar]) });
        }
        const contentNode = props.renderChildBlock(contentProps, this.blockDef.content, handleSetContent);
        return (React.createElement("div", { style: { paddingTop: 5, paddingBottom: 5, border: "dashed 1px #CCC" } }, contentNode));
    }
    renderInstance(props) {
        const contextVar = this.createContextVar();
        // Inject context variable
        return React.createElement(ContextVarsInjector_1.default, { injectedContextVars: [contextVar], injectedContextVarValues: { [contextVar.id]: this.blockDef.filter }, innerBlock: this.blockDef.content, instanceCtx: props }, (instanceCtx, loading, refreshing) => {
            if (loading) {
                return React.createElement("div", { style: { color: "#AAA", textAlign: "center" } },
                    React.createElement("i", { className: "fa fa-circle-o-notch fa-spin" }));
            }
            return props.renderChildBlock(instanceCtx, this.blockDef.content);
        });
    }
    renderEditor(props) {
        const handleTableChange = (tableId) => {
            const table = props.schema.getTable(tableId);
            props.store.replaceBlock(immer_1.default(this.blockDef, (bd) => {
                bd.table = tableId;
                bd.name = bd.name || ("List of " + localization_1.localize(table.name));
            }));
        };
        return (React.createElement("div", null,
            React.createElement("h3", null, "Rowset"),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Table" },
                React.createElement(propertyEditors_1.TableSelect, { schema: props.schema, locale: props.locale, value: this.blockDef.table || null, onChange: handleTableChange })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Name" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "name" }, (value, onChange) => React.createElement(bootstrap_1.TextInput, { value: value || null, onChange: onChange, placeholder: "Unnamed" }))),
            this.blockDef.table ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Filter" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "filter" }, (value, onChange) => React.createElement(mwater_expressions_ui_1.FilterExprComponent, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, table: this.blockDef.table, variables: blocks_1.createExprVariables(props.contextVars) })))
                : null));
    }
}
exports.RowsetBlock = RowsetBlock;
