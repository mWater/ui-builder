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
const LeafBlock_1 = __importDefault(require("../../LeafBlock"));
const React = __importStar(require("react"));
const propertyEditors_1 = require("../../propertyEditors");
const bootstrap_1 = require("react-library/lib/bootstrap");
const localization_1 = require("../../localization");
class ControlBlock extends LeafBlock_1.default {
    renderDesign(props) {
        const renderControlProps = {
            value: null,
            rowContextVar: props.contextVars.find(cv => cv.id === this.blockDef.rowContextVarId),
            onChange: () => { return; },
            locale: props.locale,
            schema: props.schema,
            dataSource: props.dataSource,
            disabled: false
        };
        return (React.createElement("div", null,
            this.blockDef.required ? React.createElement("div", { className: "required-control" }, "*") : null,
            this.renderControl(renderControlProps)));
    }
    renderInstance(props) {
        return React.createElement(ControlInstance, { renderInstanceProps: props, block: this });
    }
    /** Allow subclasses to clear/update other fields on the column changing */
    processColumnChanged(blockDef) {
        // Default does nothing
        return blockDef;
    }
    renderEditor(props) {
        const contextVar = props.contextVars.find(cv => cv.id === this.blockDef.rowContextVarId);
        const handleColumnChanged = (blockDef) => {
            props.onChange(this.processColumnChanged(blockDef));
        };
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Context Variable" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "rowContextVarId" }, (value, onChange) => React.createElement(propertyEditors_1.ContextVarPropertyEditor, { value: value, onChange: onChange, contextVars: props.contextVars, types: ["row"] }))),
            contextVar ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Column" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: handleColumnChanged, property: "column" }, (value, onChange) => {
                        const columnOptions = props.schema.getColumns(contextVar.table)
                            .filter(c => this.filterColumn(c))
                            .map(c => ({ value: c.id, label: localization_1.localize(c.name) }));
                        return React.createElement(bootstrap_1.Select, { value: value, onChange: onChange, nullLabel: "Select column", options: columnOptions });
                    }))
                : null,
            React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "required" }, (value, onChange) => React.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange }, "Required")),
            this.blockDef.required ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Required Message" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "requiredMessage" }, (value, onChange) => React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale })))
                : null,
            this.renderControlEditor(props)));
    }
    getContextVarExprs(contextVar) {
        if (this.blockDef.rowContextVarId && this.blockDef.rowContextVarId === contextVar.id && this.blockDef.column) {
            return [
                { type: "id", table: contextVar.table },
                { type: "field", table: contextVar.table, column: this.blockDef.column },
            ];
        }
        else {
            return [];
        }
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
        if (this.blockDef.required && !this.blockDef.requiredMessage) {
            return "Required message required";
        }
        return null;
    }
}
exports.ControlBlock = ControlBlock;
class ControlInstance extends React.Component {
    constructor(props) {
        super(props);
        /** Validate the instance. Returns null if correct, message if not */
        this.validate = () => {
            // Check for null
            if (this.getValue() == null && this.props.block.blockDef.required) {
                return localization_1.localize(this.props.block.blockDef.requiredMessage, this.props.renderInstanceProps.locale);
            }
            return null;
        };
        this.handleChange = (newValue) => __awaiter(this, void 0, void 0, function* () {
            const renderInstanceProps = this.props.renderInstanceProps;
            const blockDef = this.props.block.blockDef;
            const contextVar = renderInstanceProps.contextVars.find(cv => cv.id === blockDef.rowContextVarId);
            const id = renderInstanceProps.getContextVarExprValue(blockDef.rowContextVarId, { type: "id", table: contextVar.table });
            // Update database
            this.setState({ updating: true });
            try {
                const txn = this.props.renderInstanceProps.database.transaction();
                yield txn.updateRow(contextVar.table, id, { [blockDef.column]: newValue });
                yield txn.commit();
                // TODO error handling
            }
            finally {
                this.setState({ updating: false });
            }
        });
        this.state = {
            updating: false
        };
    }
    getValue() {
        const renderInstanceProps = this.props.renderInstanceProps;
        const blockDef = this.props.block.blockDef;
        const contextVar = renderInstanceProps.contextVars.find(cv => cv.id === blockDef.rowContextVarId);
        // Get current value
        return renderInstanceProps.getContextVarExprValue(blockDef.rowContextVarId, { type: "field", table: contextVar.table, column: blockDef.column });
    }
    renderRequired() {
        return this.props.block.blockDef.required ? React.createElement("div", { className: "required-control" }, "*") : null;
    }
    render() {
        const renderInstanceProps = this.props.renderInstanceProps;
        const blockDef = this.props.block.blockDef;
        const contextVar = renderInstanceProps.contextVars.find(cv => cv.id === blockDef.rowContextVarId);
        const id = renderInstanceProps.getContextVarExprValue(blockDef.rowContextVarId, { type: "id", table: contextVar.table });
        const renderControlProps = {
            value: this.getValue(),
            onChange: this.handleChange,
            schema: this.props.renderInstanceProps.schema,
            dataSource: this.props.renderInstanceProps.dataSource,
            locale: this.props.renderInstanceProps.locale,
            rowContextVar: contextVar,
            disabled: id == null
        };
        return (React.createElement("div", { style: { opacity: this.state.updating ? 0.6 : undefined } },
            this.renderRequired(),
            this.props.block.renderControl(renderControlProps)));
    }
}
//# sourceMappingURL=ControlBlock.js.map