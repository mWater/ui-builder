"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
const bootstrap_1 = require("react-library/lib/bootstrap");
const blocks_1 = require("./blocks");
const ListEditor_1 = __importDefault(require("./ListEditor"));
const mwater_expressions_ui_1 = require("mwater-expressions-ui");
const PropTypes = __importStar(require("prop-types"));
const react_select_1 = __importDefault(require("react-select"));
const localization_1 = require("./localization");
/* Components to build property editors. These may use bootstrap 3 as needed. */
class LabeledProperty extends React.Component {
    render() {
        return (React.createElement("div", { className: "form-group" },
            React.createElement("label", null, this.props.label),
            React.createElement("div", { style: { paddingLeft: 5 } }, this.props.children),
            React.createElement("p", { className: "help-block", style: { marginLeft: 5 } }, this.props.help)));
    }
}
exports.LabeledProperty = LabeledProperty;
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
                React.createElement("textarea", { className: "form-control", value: str, onChange: this.handleChange, placeholder: this.props.placeholder })
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
        return React.createElement(bootstrap_1.Select, { value: this.props.value, onChange: this.props.onChange, nullLabel: this.props.allowNone ? "None" : "Select...", options: contextVars.map(cv => ({ label: cv.name, value: cv.id })) });
    }
}
exports.ContextVarPropertyEditor = ContextVarPropertyEditor;
/** Edits an action definition, allowing selection of action */
class ActionDefEditor extends React.Component {
    constructor() {
        super(...arguments);
        this.handleChangeAction = (type) => {
            if (type) {
                this.props.onChange(this.props.actionLibrary.createNewActionDef(type));
            }
            else {
                this.props.onChange(null);
            }
        };
    }
    render() {
        const action = this.props.value ? this.props.actionLibrary.createAction(this.props.value) : null;
        return (React.createElement("div", null,
            React.createElement(bootstrap_1.Select, { nullLabel: "No Action", onChange: this.handleChangeAction, value: this.props.value ? this.props.value.type : null, options: this.props.actionLibrary.getActionTypes().map(at => ({ label: at.name, value: at.type })) }),
            action
                ? action.renderEditor({
                    widgetLibrary: this.props.widgetLibrary,
                    locale: this.props.locale,
                    contextVars: this.props.contextVars,
                    onChange: this.props.onChange,
                    schema: this.props.schema,
                    dataSource: this.props.dataSource
                })
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
            this.props.onChange(Object.assign({}, this.props.value, { expr: expr }));
        };
        this.handleDirToggle = () => {
            this.props.onChange(Object.assign({}, this.props.value, { dir: (this.props.value.dir === "asc") ? "desc" : "asc" }));
        };
    }
    render() {
        return (React.createElement("div", null,
            React.createElement("div", { style: { float: "left" } },
                React.createElement("a", { onClick: this.handleDirToggle }, this.props.value.dir === "asc" ? React.createElement("i", { className: "fa fa-arrow-up" }) : React.createElement("i", { className: "fa fa-arrow-down" }))),
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
                { value: "YYYY-MM-DD", label: "YYYY-MM-DD (1986-04-09)" },
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
            return this.context.tableSelectElementFactory({ schema: this.props.schema, value: this.props.value, onChange: this.props.onChange });
        }
        const tables = _.sortBy(this.props.schema.getTables(), (table) => localization_1.localize(table.name, this.props.locale));
        return React.createElement(react_select_1.default, { value: tables.find(t => t.id === this.props.value) || null, options: tables, onChange: this.handleTableChange, getOptionLabel: this.getOptionLabel, getOptionValue: this.getOptionValue });
    }
}
TableSelect.contextTypes = {
    tableSelectElementFactory: PropTypes.func // Can be overridden by setting tableSelectElementFactory in context that takes ({ schema, value, onChange, filter, onFilterChange })
};
exports.TableSelect = TableSelect;
//# sourceMappingURL=propertyEditors.js.map