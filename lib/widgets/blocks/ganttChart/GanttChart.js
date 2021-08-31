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
exports.GanttChartBlock = void 0;
const React = __importStar(require("react"));
const blocks_1 = require("../../blocks");
const LeafBlock_1 = __importDefault(require("../../LeafBlock"));
const GanttChart_1 = require("react-library/lib/GanttChart");
const mwater_expressions_1 = require("mwater-expressions");
const propertyEditors_1 = require("../../propertyEditors");
const mwater_expressions_ui_1 = require("mwater-expressions-ui");
const localization_1 = require("../../localization");
const bootstrap_1 = require("react-library/lib/bootstrap");
const react_datepicker_1 = __importDefault(require("react-datepicker"));
const moment_1 = __importDefault(require("moment"));
const GanttChartInstance_1 = require("./GanttChartInstance");
class GanttChartBlock extends LeafBlock_1.default {
    validate(designCtx) {
        // Validate rowset
        const rowsetCV = designCtx.contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId && cv.type === "rowset");
        if (!rowsetCV) {
            return "Rowset required";
        }
        const exprValidator = new mwater_expressions_1.ExprValidator(designCtx.schema, (0, blocks_1.createExprVariables)(designCtx.contextVars));
        let error;
        // Validate filter
        error = exprValidator.validateExpr(this.blockDef.filter, { table: rowsetCV.table, types: ["boolean"] });
        if (error) {
            return error;
        }
        // Validate rowStartDateExpr
        error = exprValidator.validateExpr(this.blockDef.rowStartDateExpr, { table: rowsetCV.table, types: ["date", "datetime"] });
        if (error) {
            return error;
        }
        // Validate rowEndDateExpr
        error = exprValidator.validateExpr(this.blockDef.rowEndDateExpr, { table: rowsetCV.table, types: ["date", "datetime"] });
        if (error) {
            return error;
        }
        // Validate rowLabelExpr
        error = exprValidator.validateExpr(this.blockDef.rowLabelExpr, { table: rowsetCV.table, types: ["text"] });
        if (error) {
            return error;
        }
        // Validate rowOrderColumn
        if (this.blockDef.rowOrderColumn) {
            const col = designCtx.schema.getColumn(rowsetCV.table, this.blockDef.rowOrderColumn);
            if (!col) {
                return "Order column not found";
            }
        }
        else {
            return "Order column required";
        }
        // Validate rowParentColumn
        if (this.blockDef.rowParentColumn) {
            const col = designCtx.schema.getColumn(rowsetCV.table, this.blockDef.rowParentColumn);
            if (!col) {
                return "Parent column not found";
            }
            if (col.type != "id" || col.idTable != rowsetCV.table) {
                return "Parent column invalid";
            }
        }
        // Validate actions
        if (this.blockDef.rowClickAction) {
            const action = designCtx.actionLibrary.createAction(this.blockDef.rowClickAction);
            // Create row context variable
            const rowCV = this.createRowContextVar(rowsetCV);
            error = action.validate(Object.assign(Object.assign({}, designCtx), { contextVars: designCtx.contextVars.concat(rowCV) }));
            if (error) {
                return error;
            }
        }
        if (this.blockDef.addRowAction) {
            const action = designCtx.actionLibrary.createAction(this.blockDef.addRowAction);
            error = action.validate(Object.assign(Object.assign({}, designCtx), { contextVars: designCtx.contextVars.concat([
                    this.createAddRowOrderContextVar(rowsetCV),
                    this.createAddRowParentContextVar(rowsetCV),
                ]) }));
            if (error) {
                return error;
            }
        }
        return null;
    }
    /** Create the context variable used */
    createRowContextVar(rowsetCV) {
        return { id: this.blockDef.id + "_row", name: `GANTT Row of ${rowsetCV.name}`, type: "row", table: rowsetCV.table };
    }
    /** Create context variables that add row action receives */
    createAddRowOrderContextVar(rowsetCV) {
        return { id: this.blockDef.id + "_add_order", name: `Order of new GANTT row`, type: "number" };
    }
    /** Create context variables that add row action receives */
    createAddRowParentContextVar(rowsetCV) {
        return { id: this.blockDef.id + "_add_parent", name: `Parent of new GANTT row`, type: "row", table: rowsetCV.table };
    }
    renderDesign(ctx) {
        const barColor = this.blockDef.barColor || "#68cdee";
        const milestoneColor = this.blockDef.milestoneColor || "#68cdee";
        return React.createElement(GanttChart_1.GanttChart, { rows: [
                { color: barColor, level: 0, startDate: "2020-01-14", endDate: "2020-05-23", label: "Activity 1" },
                { color: barColor, level: 1, startDate: "2020-02-14", endDate: "2020-06-23", label: "Activity 2" },
                { color: milestoneColor, level: 2, startDate: "2020-04-12", endDate: null, label: "Activity 3" }
            ], startDate: "2020-01-01", endDate: "2020-07-01", T: ctx.T });
    }
    renderInstance(ctx) {
        return React.createElement(GanttChartInstance_1.GanttChartInstance, { block: this, ctx: ctx });
    }
    renderEditor(props) {
        // Get rowset context variable
        const rowsetCV = props.contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId);
        const rowCV = rowsetCV ? this.createRowContextVar(rowsetCV) : null;
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Rowset" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "rowsetContextVarId" }, (value, onChange) => React.createElement(propertyEditors_1.ContextVarPropertyEditor, { value: value, onChange: onChange, contextVars: props.contextVars, types: ["rowset"] }))),
            rowsetCV ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Label" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "rowLabelExpr" }, (value, onChange) => (React.createElement(mwater_expressions_ui_1.ExprComponent, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, types: ["text"], variables: (0, blocks_1.createExprVariables)(props.contextVars), table: rowsetCV.table }))))
                : null,
            rowsetCV ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Start Date of Rows" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "rowStartDateExpr" }, (value, onChange) => (React.createElement(mwater_expressions_ui_1.ExprComponent, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, types: ["date", "datetime"], variables: (0, blocks_1.createExprVariables)(props.contextVars), table: rowsetCV.table }))))
                : null,
            rowsetCV ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "End Date of Rows" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "rowEndDateExpr" }, (value, onChange) => (React.createElement(mwater_expressions_ui_1.ExprComponent, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, types: ["date", "datetime"], variables: (0, blocks_1.createExprVariables)(props.contextVars), table: rowsetCV.table }))))
                : null,
            rowsetCV ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Filter" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "filter" }, (value, onChange) => (React.createElement(mwater_expressions_ui_1.ExprComponent, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, types: ["boolean"], variables: (0, blocks_1.createExprVariables)(props.contextVars), table: rowsetCV.table }))))
                : null,
            rowsetCV ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Order By Column" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "rowOrderColumn" }, (value, onChange) => {
                        const columnOptions = props.schema.getColumns(rowsetCV.table)
                            .filter(c => c.type == "date" || c.type == "datetime" || c.type == "number")
                            .map(c => ({ value: c.id, label: (0, localization_1.localize)(c.name) }));
                        return React.createElement(bootstrap_1.Select, { value: value, onChange: onChange, nullLabel: "Select column", options: columnOptions });
                    }))
                : null,
            rowsetCV ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Parent Column", hint: "Optional column to make hierarchical" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "rowParentColumn" }, (value, onChange) => {
                        const columnOptions = props.schema.getColumns(rowsetCV.table)
                            .filter(c => c.type == "id" && c.idTable == rowsetCV.table)
                            .map(c => ({ value: c.id, label: (0, localization_1.localize)(c.name) }));
                        return React.createElement(bootstrap_1.Select, { value: value, onChange: onChange, nullLabel: "None", options: columnOptions });
                    }))
                : null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Override Start Date" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "startDate" }, (value, onChange) => (React.createElement(react_datepicker_1.default, { selected: value ? (0, moment_1.default)(value, "YYYY-MM-DD") : null, onChange: (momentDate) => { onChange(momentDate.format("YYYY-MM-DD")); }, dateFormat: "ll", isClearable: true, className: "form-control" })))),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Override End Date" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "endDate" }, (value, onChange) => (React.createElement(react_datepicker_1.default, { selected: value ? (0, moment_1.default)(value, "YYYY-MM-DD") : null, onChange: (momentDate) => { onChange(momentDate.format("YYYY-MM-DD")); }, dateFormat: "ll", isClearable: true, className: "form-control" })))),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Bar color", hint: "CSS format" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "barColor" }, (value, onChange) => (React.createElement(bootstrap_1.TextInput, { value: value, onChange: onChange, emptyNull: true, placeholder: "#68cdee" })))),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Milestone color", hint: "CSS format" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "milestoneColor" }, (value, onChange) => (React.createElement(bootstrap_1.TextInput, { value: value, onChange: onChange, emptyNull: true, placeholder: "#68cdee" })))),
            React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "autoNumberRows" }, (value, onChange) => (React.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange }, "Autonumber Rows"))),
            rowCV ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "When row clicked" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "rowClickAction" }, (value, onChange) => (React.createElement(propertyEditors_1.ActionDefEditor, { value: value, onChange: onChange, designCtx: Object.assign(Object.assign({}, props), { contextVars: props.contextVars.concat(rowCV) }) }))))
                : null,
            rowCV && rowsetCV ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "When row added" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "addRowAction" }, (value, onChange) => (React.createElement(propertyEditors_1.ActionDefEditor, { value: value, onChange: onChange, designCtx: Object.assign(Object.assign({}, props), { contextVars: props.contextVars.concat([this.createAddRowOrderContextVar(rowsetCV), this.createAddRowParentContextVar(rowsetCV)]) }) }))))
                : null,
            this.blockDef.addRowAction ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Add row link text" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "addRowLabel" }, (value, onChange) => React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale })))
                : null,
            React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "allowRemove" }, (value, onChange) => (React.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange }, "Allow removing rows"))),
            this.blockDef.allowRemove ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Remove confirm message" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "removeConfirmMessage" }, (value, onChange) => React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale })))
                : null));
    }
}
exports.GanttChartBlock = GanttChartBlock;
