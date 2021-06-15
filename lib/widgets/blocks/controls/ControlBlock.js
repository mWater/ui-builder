"use strict";
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
exports.ControlBlock = void 0;
const LeafBlock_1 = __importDefault(require("../../LeafBlock"));
const react_1 = __importDefault(require("react"));
const propertyEditors_1 = require("../../propertyEditors");
const bootstrap_1 = require("react-library/lib/bootstrap");
const localization_1 = require("../../localization");
const DataSourceDatabase_1 = require("../../../database/DataSourceDatabase");
const scrolling_1 = require("../../scrolling");
const collapsible_1 = require("../collapsible");
/** Abstract class for a control such as a dropdown, text field, etc that operates on a single column */
class ControlBlock extends LeafBlock_1.default {
    /** Implement this to render any editor parts that are not selecting the basic row cv and column */
    renderControlEditor(props) {
        return null;
    }
    renderDesign(designCtx) {
        const renderControlProps = {
            value: null,
            rowId: null,
            rowContextVar: designCtx.contextVars.find(cv => cv.id === this.blockDef.rowContextVarId),
            onChange: () => { return; },
            locale: designCtx.locale,
            database: new DataSourceDatabase_1.DataSourceDatabase(designCtx.schema, designCtx.dataSource),
            schema: designCtx.schema,
            dataSource: designCtx.dataSource,
            disabled: false,
            getFilters: () => [],
            contextVars: designCtx.contextVars,
            contextVarValues: {},
            formatLocale: designCtx.formatLocale
        };
        return this.renderControl(renderControlProps);
    }
    renderInstance(props) {
        return react_1.default.createElement(ControlInstance, { instanceCtx: props, block: this });
    }
    /** Allow subclasses to clear/update other fields on the column changing */
    processColumnChanged(blockDef) {
        // Default does nothing
        return blockDef;
    }
    renderEditor(props) {
        const contextVar = props.contextVars.find(cv => cv.id === this.blockDef.rowContextVarId);
        const handleColumnChanged = (blockDef) => {
            props.store.replaceBlock(this.processColumnChanged(blockDef));
        };
        return (react_1.default.createElement("div", null,
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Context Variable" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "rowContextVarId" }, (value, onChange) => react_1.default.createElement(propertyEditors_1.ContextVarPropertyEditor, { value: value, onChange: onChange, contextVars: props.contextVars, types: ["row"] }))),
            contextVar ?
                react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Column" },
                    react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: handleColumnChanged, property: "column" }, (value, onChange) => {
                        const columnOptions = props.schema.getColumns(contextVar.table)
                            .filter(c => this.filterColumn(c))
                            .map(c => ({ value: c.id, label: localization_1.localize(c.name) }));
                        return react_1.default.createElement(bootstrap_1.Select, { value: value, onChange: onChange, nullLabel: "Select column", options: columnOptions });
                    }))
                : null,
            react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "required" }, (value, onChange) => react_1.default.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange }, "Required")),
            this.blockDef.required ?
                react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Required Message" },
                    react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "requiredMessage" }, (value, onChange) => react_1.default.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale })))
                : null,
            this.renderControlEditor(props),
            react_1.default.createElement("br", null),
            react_1.default.createElement(collapsible_1.CollapsibleComponent, { label: "Optional Readonly Expression", initialCollapsed: true },
                react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Readonly", hint: "optional expression that makes read-only if true" },
                    react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "readonlyExpr" }, (value, onChange) => (react_1.default.createElement(propertyEditors_1.ContextVarExprPropertyEditor, { schema: props.schema, dataSource: props.dataSource, contextVars: props.contextVars, contextVarId: value ? value.contextVarId : null, expr: value ? value.expr : null, onChange: (contextVarId, expr) => { onChange({ contextVarId, expr }); }, types: ["boolean"] })))))));
    }
    getContextVarExprs(contextVar) {
        const exprs = [];
        if (this.blockDef.rowContextVarId && this.blockDef.rowContextVarId === contextVar.id && this.blockDef.column) {
            exprs.push({ type: "id", table: contextVar.table });
            exprs.push({ type: "field", table: contextVar.table, column: this.blockDef.column });
        }
        if (this.blockDef.readonlyExpr && this.blockDef.readonlyExpr.contextVarId == contextVar.id) {
            exprs.push(this.blockDef.readonlyExpr.expr);
        }
        return exprs;
    }
    /** Determine if block is valid. null means valid, string is error message. Does not validate children */
    validate(options) {
        // Validate row
        const rowCV = options.contextVars.find(cv => cv.id === this.blockDef.rowContextVarId && cv.type === "row");
        if (!rowCV) {
            return "Row required";
        }
        if (!this.blockDef.column || !options.schema.getColumn(rowCV.table, this.blockDef.column)) {
            return "Column required";
        }
        if (!this.filterColumn(options.schema.getColumn(rowCV.table, this.blockDef.column))) {
            return "Valid column required";
        }
        return null;
    }
}
exports.ControlBlock = ControlBlock;
class ControlInstance extends react_1.default.Component {
    constructor(props) {
        super(props);
        /** Validate the instance. Returns null if correct, message if not */
        this.validate = (isFirstError) => {
            // Check for null
            if (this.getValue() == null && this.props.block.blockDef.required) {
                this.setState({ requiredError: this.props.block.blockDef.requiredMessage ? localization_1.localize(this.props.block.blockDef.requiredMessage, this.props.instanceCtx.locale) : "" });
                // Scroll into view if first error
                if (isFirstError && this.controlRef.current && this.controlRef.current.scrollIntoView) {
                    this.controlRef.current.scrollIntoView(true);
                    // Add some padding
                    const scrollParent = scrolling_1.getScrollParent(this.controlRef.current);
                    if (scrollParent)
                        scrollParent.scrollBy(0, -30);
                }
                return "";
            }
            else {
                this.setState({ requiredError: null });
                return null;
            }
        };
        this.handleChange = (newValue) => __awaiter(this, void 0, void 0, function* () {
            const instanceCtx = this.props.instanceCtx;
            const blockDef = this.props.block.blockDef;
            const contextVar = instanceCtx.contextVars.find(cv => cv.id === blockDef.rowContextVarId);
            const id = instanceCtx.getContextVarExprValue(blockDef.rowContextVarId, { type: "id", table: contextVar.table });
            // Update database
            this.setState({ updating: true });
            try {
                const txn = this.props.instanceCtx.database.transaction();
                yield txn.updateRow(contextVar.table, id, { [blockDef.column]: newValue });
                yield txn.commit();
            }
            catch (err) {
                // TODO localize
                alert("Unable to save changes: " + err.message);
                console.error(err.message);
            }
            finally {
                this.setState({ updating: false });
            }
        });
        this.controlRef = react_1.default.createRef();
        this.state = {
            updating: false,
            requiredError: null
        };
    }
    componentDidMount() {
        this.unregisterValidation = this.props.instanceCtx.registerForValidation(this.validate);
    }
    componentWillUnmount() {
        this.unregisterValidation();
    }
    getValue() {
        const instanceCtx = this.props.instanceCtx;
        const blockDef = this.props.block.blockDef;
        const contextVar = instanceCtx.contextVars.find(cv => cv.id === blockDef.rowContextVarId);
        // Get current value
        return instanceCtx.getContextVarExprValue(blockDef.rowContextVarId, { type: "field", table: contextVar.table, column: blockDef.column });
    }
    render() {
        const instanceCtx = this.props.instanceCtx;
        const blockDef = this.props.block.blockDef;
        const contextVar = instanceCtx.contextVars.find(cv => cv.id === blockDef.rowContextVarId);
        const id = instanceCtx.getContextVarExprValue(blockDef.rowContextVarId, { type: "id", table: contextVar.table });
        const readonly = blockDef.readonlyExpr ? instanceCtx.getContextVarExprValue(blockDef.readonlyExpr.contextVarId, blockDef.readonlyExpr.expr) : false;
        const renderControlProps = {
            value: this.getValue(),
            onChange: readonly ? undefined : this.handleChange,
            rowId: id,
            schema: this.props.instanceCtx.schema,
            dataSource: this.props.instanceCtx.dataSource,
            database: this.props.instanceCtx.database,
            getFilters: this.props.instanceCtx.getFilters,
            locale: this.props.instanceCtx.locale,
            rowContextVar: contextVar,
            disabled: id == null,
            contextVars: this.props.instanceCtx.contextVars,
            contextVarValues: this.props.instanceCtx.contextVarValues
        };
        const style = {
            opacity: this.state.updating ? 0.6 : undefined
        };
        // Add red border if required
        if (this.state.requiredError != null) {
            style.border = "1px solid rgb(169, 68, 66)",
                style.padding = 3;
            style.backgroundColor = "rgb(169, 68, 66)";
        }
        return (react_1.default.createElement("div", null,
            react_1.default.createElement("div", { style: style, ref: this.controlRef, key: "control" }, this.props.block.renderControl(renderControlProps)),
            this.state.requiredError ?
                react_1.default.createElement("div", { key: "error", className: "text-danger" }, this.state.requiredError)
                : null));
    }
}
