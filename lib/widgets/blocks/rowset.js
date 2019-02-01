"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const immer_1 = __importDefault(require("immer"));
const React = __importStar(require("react"));
const CompoundBlock_1 = __importDefault(require("../CompoundBlock"));
const blocks_1 = require("../blocks");
const mwater_expressions_1 = require("mwater-expressions");
const ContextVarsInjector_1 = __importDefault(require("../ContextVarsInjector"));
const bootstrap_1 = require("react-library/lib/bootstrap");
const mwater_expressions_ui_1 = require("mwater-expressions-ui");
const propertyEditors_1 = require("../propertyEditors");
class RowsetBlock extends CompoundBlock_1.default {
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
        if (!this.blockDef.content) {
            return "Content required";
        }
        // Validate where
        error = exprValidator.validateExpr(this.blockDef.filter, { table: this.blockDef.table, types: ["boolean"] });
        if (error) {
            return error;
        }
        return null;
    }
    processChildren(action) {
        return immer_1.default(this.blockDef, draft => {
            if (draft.content) {
                draft.content = action(draft.content);
            }
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
            contentProps = Object.assign({}, contentProps, { contextVars: props.contextVars.concat([contextVar]) });
        }
        const contentNode = props.renderChildBlock(contentProps, this.blockDef.content, handleSetContent);
        return (React.createElement("div", { style: { paddingTop: 5, paddingBottom: 5, border: "dashed 1px #CCC" } }, contentNode));
    }
    renderInstance(props) {
        const contextVar = this.createContextVar();
        // Inject context variable
        return React.createElement(ContextVarsInjector_1.default, { injectedContextVars: [contextVar], injectedContextVarValues: { [contextVar.id]: this.blockDef.filter }, createBlock: this.createBlock, database: props.database, innerBlock: this.blockDef.content, renderInstanceProps: props, schema: props.schema }, (renderInstanceProps, loading, refreshing) => {
            if (loading) {
                return React.createElement("div", { style: { color: "#AAA", fontSize: 18, textAlign: "center" } },
                    React.createElement("i", { className: "fa fa-circle-o-notch fa-spin" }));
            }
            return (React.createElement("div", { style: { opacity: refreshing ? 0.6 : undefined } }, props.renderChildBlock(renderInstanceProps, this.blockDef.content)));
        });
    }
    renderEditor(props) {
        return (React.createElement("div", null,
            React.createElement("h3", null, "Rowset"),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Table" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "table" }, (value, onChange) => React.createElement(propertyEditors_1.TableSelect, { schema: props.schema, locale: props.locale, value: value, onChange: onChange }))),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Name" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "name" }, (value, onChange) => React.createElement(bootstrap_1.TextInput, { value: value, onChange: onChange, placeholder: "Unnamed" }))),
            this.blockDef.table ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Filter" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "filter" }, (value, onChange) => React.createElement(mwater_expressions_ui_1.FilterExprComponent, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, table: this.blockDef.table, variables: blocks_1.createExprVariables(props.contextVars) })))
                : null));
    }
}
exports.RowsetBlock = RowsetBlock;
//# sourceMappingURL=rowset.js.map