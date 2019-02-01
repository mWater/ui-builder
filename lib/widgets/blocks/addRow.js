"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
const propertyEditors_1 = require("../propertyEditors");
const columnValues_1 = require("../columnValues");
class AddRowBlock extends CompoundBlock_1.default {
    getChildren(contextVars) {
        if (this.blockDef.content) {
            const contextVar = this.createContextVar();
            return [{ blockDef: this.blockDef.content, contextVars: contextVar ? contextVars.concat([contextVar]) : contextVars }];
        }
        return [];
    }
    createContextVar() {
        if (this.blockDef.table) {
            return { type: "row", id: this.blockDef.id, name: this.blockDef.name || "Added row", table: this.blockDef.table };
        }
        return null;
    }
    validate(options) {
        let error;
        if (!this.blockDef.content) {
            return "Content required";
        }
        // Check that table is present
        if (!this.blockDef.table || !options.schema.getTable(this.blockDef.table)) {
            return "Table required";
        }
        // Check each column value
        for (const columnId of Object.keys(this.blockDef.columnValues)) {
            error = this.validateColumnValue(options, columnId);
            if (error) {
                return error;
            }
        }
        return null;
    }
    validateColumnValue(options, columnId) {
        // Check that column exists
        const column = options.schema.getColumn(this.blockDef.table, columnId);
        if (!column) {
            return "Column not found";
        }
        const exprValidator = new mwater_expressions_1.ExprValidator(options.schema, blocks_1.createExprVariables(options.contextVars));
        // Get type of column
        const columnType = (column.type === "join") ? "id" : column.type;
        // Check context var
        const contextVarExpr = this.blockDef.columnValues[columnId];
        let contextVar;
        if (contextVarExpr.contextVarId) {
            contextVar = options.contextVars.find(cv => cv.id === contextVarExpr.contextVarId);
            if (!contextVar || !contextVar.table) {
                return "Context variable not found";
            }
        }
        else {
            contextVar = undefined;
            // Must be literal
            if (contextVarExpr.expr && contextVarExpr.expr.type !== "literal") {
                return "Literal value required";
            }
        }
        // Validate expr
        let error;
        error = exprValidator.validateExpr(contextVarExpr.expr, { table: contextVar ? contextVar.table : undefined, types: [columnType] });
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
    /** Get context variable expressions needed to add */
    getContextVarExprs(contextVar) {
        // Get ones for the specified context var
        return Object.values(this.blockDef.columnValues).filter(cve => cve.contextVarId === contextVar.id).map(cve => cve.expr);
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
        return React.createElement(AddRowInstance, { blockDef: this.blockDef, contextVar: contextVar, createBlock: this.createBlock, database: props.database, renderInstanceProps: props, schema: props.schema });
    }
    renderEditor(props) {
        return (React.createElement("div", null,
            React.createElement("h3", null, "Add Row"),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Table" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "table" }, (value, onChange) => React.createElement(propertyEditors_1.TableSelect, { schema: props.schema, locale: props.locale, value: value, onChange: onChange }))),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Variable Name" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "name" }, (value, onChange) => React.createElement(bootstrap_1.TextInput, { value: value, onChange: onChange, placeholder: "Unnamed" }))),
            this.blockDef.table ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Column Values" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "columnValues" }, (value, onChange) => React.createElement(columnValues_1.ColumnValuesEditor, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, table: this.blockDef.table, contextVars: props.contextVars, locale: props.locale })))
                : null));
    }
}
exports.AddRowBlock = AddRowBlock;
/** Instance which adds a row and then injects as context variable */
class AddRowInstance extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            addedRowId: null
        };
    }
    componentDidMount() {
        this.performAdd();
    }
    performAdd() {
        return __awaiter(this, void 0, void 0, function* () {
            // Create row to insert
            const row = {};
            for (const columnId of Object.keys(this.props.blockDef.columnValues)) {
                const contextVarExpr = this.props.blockDef.columnValues[columnId];
                if (contextVarExpr.contextVarId != null) {
                    row[columnId] = this.props.renderInstanceProps.getContextVarExprValue(contextVarExpr.contextVarId, contextVarExpr.expr);
                }
                else {
                    row[columnId] = contextVarExpr.expr ? contextVarExpr.expr.value : null;
                }
            }
            const txn = this.props.database.transaction();
            const addedRowId = yield txn.addRow(this.props.blockDef.table, row);
            yield txn.commit();
            this.setState({ addedRowId });
        });
    }
    render() {
        // Render wait while adding
        if (!this.state.addedRowId) {
            return React.createElement("div", { style: { color: "#AAA", fontSize: 18, textAlign: "center" } },
                React.createElement("i", { className: "fa fa-circle-o-notch fa-spin" }));
        }
        // Inject context variable
        return React.createElement(ContextVarsInjector_1.default, { injectedContextVars: [this.props.contextVar], injectedContextVarValues: { [this.props.contextVar.id]: this.state.addedRowId }, createBlock: this.props.createBlock, database: this.props.database, innerBlock: this.props.blockDef.content, renderInstanceProps: this.props.renderInstanceProps, schema: this.props.schema }, (renderInstanceProps, loading, refreshing) => {
            if (loading) {
                return React.createElement("div", { style: { color: "#AAA", fontSize: 18, textAlign: "center" } },
                    React.createElement("i", { className: "fa fa-circle-o-notch fa-spin" }));
            }
            return (React.createElement("div", { style: { opacity: refreshing ? 0.6 : undefined } }, this.props.renderInstanceProps.renderChildBlock(renderInstanceProps, this.props.blockDef.content)));
        });
    }
}
//# sourceMappingURL=addRow.js.map