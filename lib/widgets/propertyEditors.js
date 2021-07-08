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
exports.ResponsiveWidthSelector = exports.TableColumnWidthEditor = exports.EmbeddedExprEditor = exports.EmbeddedExprsEditor = exports.EnumArrayEditor = exports.TableSelect = exports.DatetimeFormatEditor = exports.DateFormatEditor = exports.NumberFormatEditor = exports.OrderByEditor = exports.OrderByArrayEditor = exports.ActionDefEditor = exports.ContextVarExprPropertyEditor = exports.ContextVarPropertyEditor = exports.DropdownPropertyEditor = exports.LocalizedTextPropertyEditor = exports.PropertyEditor = exports.LabeledProperty = void 0;
const lodash_1 = __importDefault(require("lodash"));
const React = __importStar(require("react"));
const bootstrap_1 = require("react-library/lib/bootstrap");
const blocks_1 = require("./blocks");
const mwater_expressions_1 = require("mwater-expressions");
const ListEditor_1 = __importDefault(require("./ListEditor"));
const mwater_expressions_ui_1 = require("mwater-expressions-ui");
const PropTypes = __importStar(require("prop-types"));
const react_select_1 = __importDefault(require("react-select"));
const localization_1 = require("./localization");
const collapsible_1 = require("./blocks/collapsible");
/* Components to build property editors. These may use bootstrap 3 as needed. */
/** Labeled group */
exports.LabeledProperty = (props) => {
    return (React.createElement("div", { className: "form-group" },
        React.createElement("label", null,
            props.label,
            " ",
            props.hint ? React.createElement("span", { className: "text-muted", style: { fontWeight: "normal" } },
                " - ",
                props.hint) : null),
        React.createElement("div", { style: { paddingLeft: 5 } }, props.children),
        React.createElement("p", { className: "help-block", style: { marginLeft: 5 } }, props.help)));
};
/** Creates a property editor for a property */
class PropertyEditor extends React.Component {
    constructor() {
        super(...arguments);
        this.handleChange = (value) => {
            this.props.onChange(Object.assign({}, this.props.obj, { [this.props.property]: value }));
        };
    }
    render() {
        const value = this.props.obj[this.props.property];
        return this.props.children(value, this.handleChange);
    }
}
exports.PropertyEditor = PropertyEditor;
class LocalizedTextPropertyEditor extends React.Component {
    constructor() {
        super(...arguments);
        this.handleChange = (e) => {
            const locale = this.props.locale || "en";
            let str = e.target.value;
            if (!this.props.allowCR) {
                str = str.replace(/[\r\n]+/g, " ");
            }
            if (!str) {
                this.props.onChange(null);
                return;
            }
            const value = Object.assign({}, this.props.value || {});
            value._base = this.props.locale;
            value[locale] = str;
            this.props.onChange(value);
        };
    }
    render() {
        const value = this.props.value || { _base: "en" };
        const locale = this.props.locale || "en";
        let str = "";
        if (value[locale]) {
            str = value[locale];
        }
        return (this.props.multiline
            ?
                React.createElement("textarea", { className: "form-control", value: str, onChange: this.handleChange, placeholder: this.props.placeholder, rows: 5 })
            :
                React.createElement("input", { className: "form-control", type: "text", value: str, onChange: this.handleChange, placeholder: this.props.placeholder }));
    }
}
exports.LocalizedTextPropertyEditor = LocalizedTextPropertyEditor;
class DropdownPropertyEditor extends React.Component {
    constructor() {
        super(...arguments);
        this.handleChange = (value) => {
            this.props.onChange(Object.assign({}, this.props.obj, { [this.props.property]: value }));
        };
    }
    render() {
        const value = this.props.obj[this.props.property];
        return (React.createElement(bootstrap_1.Select, { value: value, onChange: this.handleChange, options: this.props.options, nullLabel: this.props.nullLabel }));
    }
}
exports.DropdownPropertyEditor = DropdownPropertyEditor;
/** Allows selecting a context variable */
class ContextVarPropertyEditor extends React.Component {
    render() {
        let contextVars = this.props.contextVars.filter(cv => !this.props.types || this.props.types.includes(cv.type));
        contextVars = contextVars.filter(cv => !this.props.table || this.props.table === cv.table);
        if (this.props.filter) {
            contextVars.filter(this.props.filter);
        }
        return React.createElement(bootstrap_1.Select, { value: this.props.value, onChange: this.props.onChange, nullLabel: this.props.nullLabel ? this.props.nullLabel : "Select...", options: contextVars.map(cv => ({ label: cv.name, value: cv.id })) });
    }
}
exports.ContextVarPropertyEditor = ContextVarPropertyEditor;
/** Edits both a context variable selection and a related expression */
exports.ContextVarExprPropertyEditor = (props) => {
    const contextVar = props.contextVars.find(cv => cv.id === props.contextVarId);
    // Get all context variables up to an including one above. All context variables if null
    // This is because an outer context var expr cannot reference an inner context variable
    const cvIndex = props.contextVars.findIndex(cv => cv.id === props.contextVarId);
    const availContextVars = cvIndex >= 0 ? lodash_1.default.take(props.contextVars, cvIndex + 1) : props.contextVars;
    return React.createElement("div", { style: { border: "solid 1px #DDD", borderRadius: 5, padding: 10 } },
        React.createElement(ContextVarPropertyEditor, { value: props.contextVarId, onChange: cv => { props.onChange(cv, null); }, nullLabel: "No Row/Rowset", contextVars: props.contextVars, types: ["row", "rowset"] }),
        React.createElement("div", { style: { paddingTop: 10 } },
            React.createElement(mwater_expressions_ui_1.ExprComponent, { value: props.expr, onChange: expr => { props.onChange(props.contextVarId, expr); }, schema: props.schema, dataSource: props.dataSource, aggrStatuses: props.aggrStatuses, types: props.types, variables: blocks_1.createExprVariables(availContextVars), table: contextVar ? contextVar.table || null : null, enumValues: props.enumValues, idTable: props.idTable })));
};
/** Edits an action definition, allowing selection of action */
class ActionDefEditor extends React.Component {
    constructor() {
        super(...arguments);
        this.handleChangeAction = (type) => {
            if (type) {
                this.props.onChange(this.props.designCtx.actionLibrary.createNewActionDef(type));
            }
            else {
                this.props.onChange(null);
            }
        };
    }
    render() {
        const action = this.props.value ? this.props.designCtx.actionLibrary.createAction(this.props.value) : null;
        return (React.createElement("div", null,
            React.createElement(bootstrap_1.Select, { nullLabel: "No Action", onChange: this.handleChangeAction, value: this.props.value ? this.props.value.type : null, options: this.props.designCtx.actionLibrary.getActionTypes().map(at => ({ label: at.name, value: at.type })) }),
            action ?
                React.createElement(collapsible_1.CollapsibleComponent, { label: "Details" },
                    React.createElement("div", { style: { paddingLeft: 10 } }, action.renderEditor({ ...this.props.designCtx, onChange: this.props.onChange })))
                : null));
    }
}
exports.ActionDefEditor = ActionDefEditor;
/** Edits an array of order by expressions */
class OrderByArrayEditor extends React.Component {
    constructor() {
        super(...arguments);
        this.handleAddOrderByExpr = () => {
            this.props.onChange((this.props.value || []).concat([{ expr: null, dir: "asc" }]));
        };
    }
    render() {
        return (React.createElement("div", null,
            React.createElement(ListEditor_1.default, { items: this.props.value || [], onItemsChange: this.props.onChange }, (orderBy, onOrderByChange) => (React.createElement(OrderByEditor, { value: orderBy, schema: this.props.schema, dataSource: this.props.dataSource, onChange: onOrderByChange, table: this.props.table, contextVars: this.props.contextVars }))),
            React.createElement("button", { type: "button", className: "btn btn-link btn-sm", onClick: this.handleAddOrderByExpr }, "+ Add Order By")));
    }
}
exports.OrderByArrayEditor = OrderByArrayEditor;
class OrderByEditor extends React.Component {
    constructor() {
        super(...arguments);
        this.handleExprChange = (expr) => {
            this.props.onChange({ ...this.props.value, expr: expr });
        };
        this.handleDirToggle = () => {
            this.props.onChange({ ...this.props.value, dir: (this.props.value.dir === "asc") ? "desc" : "asc" });
        };
    }
    render() {
        return (React.createElement("div", { style: { display: "grid", gridTemplateColumns: "auto 1fr" } },
            React.createElement("a", { onClick: this.handleDirToggle }, this.props.value.dir === "asc" ? React.createElement("i", { className: "fa fa-arrow-up" }) : React.createElement("i", { className: "fa fa-arrow-down" })),
            React.createElement(mwater_expressions_ui_1.ExprComponent, { schema: this.props.schema, dataSource: this.props.dataSource, types: ["text", "number", "enum", "boolean", "date", "datetime"], table: this.props.table, value: this.props.value.expr, variables: blocks_1.createExprVariables(this.props.contextVars), onChange: this.handleExprChange })));
    }
}
exports.OrderByEditor = OrderByEditor;
/** Edits a d3 format */
class NumberFormatEditor extends React.Component {
    render() {
        return (React.createElement(bootstrap_1.Select, { value: this.props.value || "", onChange: this.props.onChange, options: [
                { value: ",", label: "Normal: 1,234.567" },
                { value: "", label: "Plain: 1234.567" },
                { value: ",.0f", label: "Rounded: 1,234" },
                { value: ",.2f", label: "Two decimals: 1,234.56" },
                { value: "$,.2f", label: "Currency: $1,234.56" },
                { value: "$,.0f", label: "Currency rounded: $1,234" },
                { value: ".0%", label: "Percent rounded: 12%" },
                { value: ".1%", label: "Percent rounded: 12.3%" },
                { value: ".2%", label: "Percent rounded: 12.34%" }
            ] }));
    }
}
exports.NumberFormatEditor = NumberFormatEditor;
/** Edits a moment.js date format */
class DateFormatEditor extends React.Component {
    render() {
        return (React.createElement(bootstrap_1.Select, { value: this.props.value || "", onChange: this.props.onChange, nullLabel: "Short (Sep 4, 1986)", options: [
                { value: "LL", label: "Long (September 4, 1986)" },
                { value: "ll", label: "Short (Sep 4, 1986)" },
                { value: "YYYY-MM-DD", label: "YYYY-MM-DD (1986-04-09)" },
                { value: "YYYY-MM", label: "YYYY-MM (1986-04)" },
                { value: "MMM YYYY", label: "Month Year (Apr 1986)" },
                { value: "YYYY", label: "YYYY (1986)" },
            ] }));
    }
}
exports.DateFormatEditor = DateFormatEditor;
/** Edits a moment.js datetime format */
class DatetimeFormatEditor extends React.Component {
    render() {
        return (React.createElement(bootstrap_1.Select, { value: this.props.value || "", onChange: this.props.onChange, nullLabel: "Short (Sep 4, 1986 8:30 PM)", options: [
                { value: "llll", label: "Medium (Thu, Sep 4, 1986 8:30 PM)" },
                { value: "LLLL", label: "Long (Thursday, September 4, 1986 8:30 PM)" },
                { value: "ll", label: "Short Date (Sep 4, 1986)" },
                { value: "LL", label: "Long Date (September 4, 1986)" },
                { value: "YYYY-MM-DD", label: "YYYY-MM-DD (1986-04-09)" },
                { value: "YYYY-MM", label: "YYYY-MM (1986-04)" },
                { value: "MMM YYYY", label: "Month Year (Apr 1986)" },
                { value: "YYYY", label: "YYYY (1986)" },
            ] }));
    }
}
exports.DatetimeFormatEditor = DatetimeFormatEditor;
/** Allow selecting a table */
class TableSelect extends React.Component {
    constructor() {
        super(...arguments);
        this.handleTableChange = (table) => {
            this.props.onChange(table.id);
        };
        this.getOptionLabel = (table) => localization_1.localize(table.name, this.props.locale);
        this.getOptionValue = (table) => table.id;
    }
    render() {
        if (this.context.tableSelectElementFactory) {
            return this.context.tableSelectElementFactory({ schema: this.props.schema, value: this.props.value || null, onChange: this.props.onChange });
        }
        const tables = lodash_1.default.sortBy(this.props.schema.getTables(), (table) => localization_1.localize(table.name, this.props.locale));
        return React.createElement(react_select_1.default, { value: tables.find(t => t.id === this.props.value) || null, options: tables, onChange: this.handleTableChange, getOptionLabel: this.getOptionLabel, getOptionValue: this.getOptionValue, isClearable: this.props.allowNull, menuPortalTarget: document.body, styles: { menuPortal: style => ({ ...style, zIndex: 2000 }) } });
    }
}
exports.TableSelect = TableSelect;
TableSelect.contextTypes = {
    tableSelectElementFactory: PropTypes.func // Can be overridden by setting tableSelectElementFactory in context that takes ({ schema, value, onChange, filter, onFilterChange })
};
/** Edits an array of enum values */
exports.EnumArrayEditor = (props) => {
    // Map value to array
    let value = null;
    if (props.value) {
        value = lodash_1.default.compact((props.value || []).map((v) => props.enumValues.find(ev => ev.id === v)));
    }
    const getOptionLabel = (ev) => localization_1.localize(ev.name, props.locale);
    const getOptionValue = (ev) => ev.id;
    const handleChange = (evs) => {
        props.onChange(evs && evs.length > 0 ? evs.map(ev => ev.id) : null);
    };
    return React.createElement(react_select_1.default, { value: value, onChange: handleChange, options: props.enumValues, placeholder: props.placeholder, getOptionLabel: getOptionLabel, getOptionValue: getOptionValue, isClearable: true, isMulti: true, menuPortalTarget: document.body, styles: { menuPortal: style => ({ ...style, zIndex: 2000 }) } });
};
/** Edits embedded expressions. */
exports.EmbeddedExprsEditor = (props) => {
    const { value, onChange, schema, dataSource, contextVars } = props;
    const handleAddEmbeddedExpr = () => {
        const defaultContextVar = props.contextVars.find(cv => cv.type === "rowset" || cv.type === "row");
        onChange((value || []).concat([{ contextVarId: defaultContextVar ? defaultContextVar.id : null, expr: null, format: null }]));
    };
    return (React.createElement("div", null,
        React.createElement(ListEditor_1.default, { items: value || [], onItemsChange: onChange }, (item, onItemChange, index) => React.createElement(exports.EmbeddedExprEditor, { value: item, onChange: onItemChange, schema: schema, dataSource: dataSource, contextVars: contextVars, index: index })),
        React.createElement("button", { type: "button", className: "btn btn-link btn-sm", onClick: handleAddEmbeddedExpr }, "+ Add Embedded Expression")));
};
/** Allows editing of an embedded expression */
exports.EmbeddedExprEditor = (props) => {
    const { schema, dataSource, contextVars } = props;
    const handleChange = (contextVarId, expr) => {
        const exprType = new mwater_expressions_1.ExprUtils(schema, blocks_1.createExprVariables(contextVars)).getExprType(props.value.expr);
        const newExprType = new mwater_expressions_1.ExprUtils(schema, blocks_1.createExprVariables(contextVars)).getExprType(expr);
        if (newExprType !== exprType) {
            props.onChange({ ...props.value, contextVarId: contextVarId, expr: expr, format: null });
        }
        else {
            props.onChange({ ...props.value, contextVarId: contextVarId, expr: expr });
        }
    };
    const exprType = new mwater_expressions_1.ExprUtils(schema, blocks_1.createExprVariables(contextVars)).getExprType(props.value.expr);
    return (React.createElement("div", null,
        React.createElement(exports.LabeledProperty, { label: `Expression "{${props.index}}"` },
            React.createElement(exports.ContextVarExprPropertyEditor, { contextVarId: props.value.contextVarId, expr: props.value.expr, onChange: handleChange, schema: schema, dataSource: dataSource, contextVars: contextVars, aggrStatuses: ["individual", "aggregate", "literal"] })),
        exprType === "number" ?
            React.createElement(exports.LabeledProperty, { label: "Number Format" },
                React.createElement(PropertyEditor, { obj: props.value, onChange: props.onChange, property: "format" }, (value, onChange) => (React.createElement(NumberFormatEditor, { value: value, onChange: onChange }))))
            : null,
        exprType === "date" ?
            React.createElement(exports.LabeledProperty, { label: "Date Format" },
                React.createElement(PropertyEditor, { obj: props.value, onChange: props.onChange, property: "format" }, (value, onChange) => (React.createElement(DateFormatEditor, { value: value, onChange: onChange }))))
            : null,
        exprType === "datetime" ?
            React.createElement(exports.LabeledProperty, { label: "Date/time Format" },
                React.createElement(PropertyEditor, { obj: props.value, onChange: props.onChange, property: "format" }, (value, onChange) => (React.createElement(DatetimeFormatEditor, { value: value, onChange: onChange }))))
            : null));
};
/** Edits the width of a table column */
exports.TableColumnWidthEditor = (props) => {
    return React.createElement(bootstrap_1.Select, { value: props.columnWidth, onChange: props.onChange, options: [
            { value: "auto", label: "Auto" },
            { value: "1px", label: "Small as possible" },
            { value: "16%", label: "1/6" },
            { value: "25%", label: "1/4" },
            { value: "33%", label: "1/3" },
            { value: "50%", label: "1/2" },
            { value: "67%", label: "2/3" },
            { value: "75%", label: "3/4" },
            { value: "83%", label: "5/6" },
            { value: "100%", label: "100%" },
            { value: "100px", label: "100px" },
            { value: "150px", label: "150px" },
            { value: "200px", label: "200px" },
            { value: "250px", label: "250px" },
            { value: "300px", label: "300px" },
            { value: "400px", label: "400px" },
            { value: "500px", label: "500px" }
        ] });
};
/** For selecting common responsive widths */
function ResponsiveWidthSelector(props) {
    return React.createElement(bootstrap_1.Select, { value: props.value, onChange: v => props.onChange(v != null ? v : undefined), options: [
            { value: 400, label: `< 400px (Phone)` },
            { value: 600, label: `< 600px (Small tablet)` },
            { value: 800, label: `< 800px (Tablet)` },
            { value: 1000, label: `< 1000px (Laptop)` },
            { value: 1200, label: `< 1200px (Desktop)` },
            { value: 1600, label: `< 1600px (Wide Desktop)` }
        ], nullLabel: "None" });
}
exports.ResponsiveWidthSelector = ResponsiveWidthSelector;
