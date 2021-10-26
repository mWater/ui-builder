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
exports.AddRowBlock = void 0;
const immer_1 = __importDefault(require("immer"));
const React = __importStar(require("react"));
const blocks_1 = require("../blocks");
const mwater_expressions_1 = require("mwater-expressions");
const ContextVarsInjector_1 = __importDefault(require("../ContextVarsInjector"));
const bootstrap_1 = require("react-library/lib/bootstrap");
const propertyEditors_1 = require("../propertyEditors");
const columnValues_1 = require("../columnValues");
class AddRowBlock extends blocks_1.Block {
    getChildren(contextVars) {
        if (this.blockDef.content) {
            const contextVar = this.createContextVar();
            return [
                { blockDef: this.blockDef.content, contextVars: contextVar ? contextVars.concat([contextVar]) : contextVars }
            ];
        }
        return [];
    }
    createContextVar() {
        // Don't create new context variable if reusing existing
        if (this.blockDef.table && !this.blockDef.existingContextVarId) {
            return { type: "row", id: this.blockDef.id, name: this.blockDef.name || "Added row", table: this.blockDef.table };
        }
        return null;
    }
    validate(options) {
        let error;
        // Check that table is present
        if (!this.blockDef.table || !options.schema.getTable(this.blockDef.table)) {
            return "Table required";
        }
        // Check that existing context variable from same table
        if (this.blockDef.table && this.blockDef.existingContextVarId) {
            const cv = options.contextVars.find((cv) => cv.id == this.blockDef.existingContextVarId);
            if (!cv) {
                return "Existing context variable not found";
            }
            if (cv.table != this.blockDef.table) {
                return "Existing context variable from wrong table";
            }
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
        const exprValidator = new mwater_expressions_1.ExprValidator(options.schema, (0, blocks_1.createExprVariables)(options.contextVars));
        const exprUtils = new mwater_expressions_1.ExprUtils(options.schema, (0, blocks_1.createExprVariables)(options.contextVars));
        // Check context var
        const contextVarExpr = this.blockDef.columnValues[columnId];
        let contextVar;
        if (contextVarExpr.contextVarId) {
            contextVar = options.contextVars.find((cv) => cv.id === contextVarExpr.contextVarId);
            if (!contextVar || !contextVar.table) {
                return "Context variable not found";
            }
        }
        else {
            contextVar = undefined;
            // Must be literal
            const aggrStatus = exprUtils.getExprAggrStatus(contextVarExpr.expr);
            if (aggrStatus && aggrStatus !== "literal") {
                return "Literal value required";
            }
        }
        // Override for special case of allowing to set joins
        const idTable = column.type == "join" ? column.join.toTable : column.idTable;
        const type = column.type == "join" ? "id" : column.type;
        // Validate expr
        let error;
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
    }
    processChildren(action) {
        const content = action(this.blockDef.content);
        return (0, immer_1.default)(this.blockDef, (draft) => {
            draft.content = content;
        });
    }
    /** Get context variable expressions needed to add */
    getContextVarExprs(contextVar) {
        // Get ones for the specified context var
        return Object.values(this.blockDef.columnValues)
            .filter((cve) => cve.contextVarId === contextVar.id)
            .map((cve) => cve.expr);
    }
    renderDesign(props) {
        const handleSetContent = (blockDef) => {
            props.store.alterBlock(this.id, (0, immer_1.default)((b) => {
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
        return React.createElement("div", { style: { paddingTop: 5, paddingBottom: 5, border: "dashed 1px #CCC" } }, contentNode);
    }
    renderInstance(props) {
        const contextVar = this.createContextVar() || props.contextVars.find((cv) => cv.id == this.blockDef.existingContextVarId);
        return React.createElement(AddRowInstance, { blockDef: this.blockDef, contextVar: contextVar, instanceCtx: props });
    }
    renderEditor(props) {
        return (React.createElement("div", null,
            React.createElement("h3", null, "Add Row"),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Table" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "table" }, (value, onChange) => (React.createElement(propertyEditors_1.TableSelect, { schema: props.schema, locale: props.locale, value: value, onChange: (t) => onChange(t) })))),
            this.blockDef.table ? (React.createElement(propertyEditors_1.LabeledProperty, { label: "Mode" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "existingContextVarId" }, (value, onChange) => (React.createElement("div", null,
                    React.createElement(bootstrap_1.Radio, { key: "null", radioValue: null, value: value || null, onChange: onChange }, "Always add new row"),
                    props.contextVars
                        .filter((cv) => cv.table == this.blockDef.table && cv.type == "row")
                        .map((cv) => (React.createElement(bootstrap_1.Radio, { key: cv.id, radioValue: cv.id, value: value, onChange: onChange },
                        "Use ",
                        React.createElement("i", null, cv.name),
                        " if it has a value")))))))) : null,
            !this.blockDef.existingContextVarId ? (React.createElement(propertyEditors_1.LabeledProperty, { label: "Variable Name" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "name" }, (value, onChange) => React.createElement(bootstrap_1.TextInput, { value: value || null, onChange: onChange, placeholder: "Unnamed" })))) : null,
            this.blockDef.table ? (React.createElement(propertyEditors_1.LabeledProperty, { label: "Column Values" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "columnValues" }, (value, onChange) => (React.createElement(columnValues_1.ColumnValuesEditor, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, table: this.blockDef.table, contextVars: props.contextVars, locale: props.locale }))))) : null));
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
        // Only perform add if not reusing
        if (this.doesNeedAdd()) {
            this.performAdd();
        }
    }
    doesNeedAdd() {
        return (!this.props.blockDef.existingContextVarId ||
            !this.props.instanceCtx.contextVarValues[this.props.blockDef.existingContextVarId]);
    }
    performAdd() {
        return __awaiter(this, void 0, void 0, function* () {
            // Create row to insert
            const row = {};
            for (const columnId of Object.keys(this.props.blockDef.columnValues)) {
                const contextVarExpr = this.props.blockDef.columnValues[columnId];
                row[columnId] = this.props.instanceCtx.getContextVarExprValue(contextVarExpr.contextVarId, contextVarExpr.expr);
            }
            try {
                const txn = this.props.instanceCtx.database.transaction();
                const addedRowId = yield txn.addRow(this.props.blockDef.table, row);
                yield txn.commit();
                this.setState({ addedRowId });
            }
            catch (err) {
                // TODO localize
                alert("Unable to add row: " + err.message);
                return;
            }
        });
    }
    render() {
        if (this.doesNeedAdd()) {
            // Render wait while adding
            if (!this.state.addedRowId) {
                return (React.createElement("div", { style: { color: "#AAA", textAlign: "center" } },
                    React.createElement("i", { className: "fa fa-circle-o-notch fa-spin" })));
            }
            // Re-inject all context variables if reusing, as a variable value will have changed (if the row was added)
            // which means that all other context variables that depend on that value may compute wrong
            // if evaluated by the injectors outside of this block
            let injectedContextVars = [];
            let injectedContextVarValues = {};
            if (this.props.blockDef.existingContextVarId) {
                injectedContextVars = this.props.instanceCtx.contextVars;
                injectedContextVarValues = Object.assign(Object.assign({}, this.props.instanceCtx.contextVarValues), { [this.props.contextVar.id]: this.state.addedRowId });
            }
            else {
                injectedContextVars.push(this.props.contextVar);
                injectedContextVarValues[this.props.contextVar.id] = this.state.addedRowId;
            }
            // Inject context variable
            return (React.createElement(ContextVarsInjector_1.default, { injectedContextVars: injectedContextVars, injectedContextVarValues: injectedContextVarValues, innerBlock: this.props.blockDef.content, instanceCtx: this.props.instanceCtx }, (instanceCtx, loading, refreshing) => {
                if (loading) {
                    return (React.createElement("div", { style: { color: "#AAA", textAlign: "center" } },
                        React.createElement("i", { className: "fa fa-circle-o-notch fa-spin" })));
                }
                return this.props.instanceCtx.renderChildBlock(instanceCtx, this.props.blockDef.content);
            }));
        }
        else {
            // Just render if add not needed
            return this.props.instanceCtx.renderChildBlock(this.props.instanceCtx, this.props.blockDef.content);
        }
    }
}
