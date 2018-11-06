import * as React from "react";
import { Select } from "react-library/lib/bootstrap";
import { createExprVariables } from "./blocks";
import ListEditor from "./ListEditor";
import { ExprComponent } from "mwater-expressions-ui";
import * as PropTypes from 'prop-types';
import ReactSelect from "react-select";
import { localize } from "./localization";
/* Components to build property editors. These may use bootstrap 3 as needed. */
export class LabeledProperty extends React.Component {
    render() {
        return (React.createElement("div", { className: "form-group" },
            React.createElement("label", null, this.props.label),
            React.createElement("div", { style: { paddingLeft: 5 } }, this.props.children),
            React.createElement("p", { className: "help-block", style: { marginLeft: 5 } }, this.props.help)));
    }
}
/** Creates a property editor for a property */
export class PropertyEditor extends React.Component {
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
export class LocalizedTextPropertyEditor extends React.Component {
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
export class DropdownPropertyEditor extends React.Component {
    constructor() {
        super(...arguments);
        this.handleChange = (value) => {
            this.props.onChange(Object.assign({}, this.props.obj, { [this.props.property]: value }));
        };
    }
    render() {
        const value = this.props.obj[this.props.property];
        return (React.createElement(Select, { value: value, onChange: this.handleChange, options: this.props.options, nullLabel: this.props.nullLabel }));
    }
}
/** Allows selecting a context variable */
export class ContextVarPropertyEditor extends React.Component {
    render() {
        let contextVars = this.props.contextVars.filter(cv => !this.props.types || this.props.types.includes(cv.type));
        contextVars = contextVars.filter(cv => !this.props.table || this.props.table === cv.table);
        if (this.props.filter) {
            contextVars.filter(this.props.filter);
        }
        return React.createElement(Select, { value: this.props.value, onChange: this.props.onChange, nullLabel: this.props.allowNone ? "None" : "Select...", options: contextVars.map(cv => ({ label: cv.name, value: cv.id })) });
    }
}
/** Edits an action definition, allowing selection of action */
export class ActionDefEditor extends React.Component {
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
            React.createElement(Select, { nullLabel: "No Action", onChange: this.handleChangeAction, value: this.props.value ? this.props.value.type : null, options: this.props.actionLibrary.getActionTypes().map(at => ({ label: at.name, value: at.type })) }),
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
/** Edits an array of order by expressions */
export class OrderByArrayEditor extends React.Component {
    constructor() {
        super(...arguments);
        this.handleAddOrderByExpr = () => {
            this.props.onChange((this.props.value || []).concat([{ expr: null, dir: "asc" }]));
        };
    }
    render() {
        return (React.createElement("div", null,
            React.createElement(ListEditor, { items: this.props.value || [], onItemsChange: this.props.onChange }, (orderBy, onOrderByChange) => (React.createElement(OrderByEditor, { value: orderBy, schema: this.props.schema, dataSource: this.props.dataSource, onChange: onOrderByChange, table: this.props.table, contextVars: this.props.contextVars }))),
            React.createElement("button", { type: "button", className: "btn btn-link btn-sm", onClick: this.handleAddOrderByExpr }, "+ Add Order By")));
    }
}
export class OrderByEditor extends React.Component {
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
            React.createElement(ExprComponent, { schema: this.props.schema, dataSource: this.props.dataSource, types: ["text", "number", "enum", "boolean", "date", "datetime"], table: this.props.table, value: this.props.value.expr, variables: createExprVariables(this.props.contextVars), onChange: this.handleExprChange })));
    }
}
/** Edits a d3 format */
export class NumberFormatEditor extends React.Component {
    render() {
        return (React.createElement(Select, { value: this.props.value || "", onChange: this.props.onChange, options: [
                { value: ",", label: "Normal: 1,234.567" },
                { value: "", label: "Plain: 1234.567" },
                { value: ",.0f", label: "Rounded: 1,234" },
                { value: ",.2f", label: "Two decimals: 1,234.56" },
                { value: "$,.2f", label: "Currency: $1,234.56" },
                { value: "$,.0f", label: "Currency rounded: $1,234" },
                { value: ".0%", label: "Percent rounded: 12%" }
            ] }));
    }
}
/** Edits a moment.js date format */
export class DateFormatEditor extends React.Component {
    render() {
        return (React.createElement(Select, { value: this.props.value || "", onChange: this.props.onChange, nullLabel: "Short (Sep 4, 1986)", options: [
                { value: "LL", label: "Long (September 4, 1986)" },
                { value: "YYYY-MM-DD", label: "YYYY-MM-DD (1986-04-09)" },
            ] }));
    }
}
/** Edits a moment.js datetime format */
export class DatetimeFormatEditor extends React.Component {
    render() {
        return (React.createElement(Select, { value: this.props.value || "", onChange: this.props.onChange, nullLabel: "Short (Sep 4, 1986 8:30 PM)", options: [
                { value: "llll", label: "Medium (Thu, Sep 4, 1986 8:30 PM)" },
                { value: "LLLL", label: "Long (Thursday, September 4, 1986 8:30 PM)" },
                { value: "ll", label: "Short Date (Sep 4, 1986)" },
                { value: "LL", label: "Long Date (September 4, 1986)" },
            ] }));
    }
}
/** Allow selecting a table */
export class TableSelect extends React.Component {
    constructor() {
        super(...arguments);
        this.handleTableChange = (table) => {
            this.props.onChange(table.id);
        };
        this.getOptionLabel = (table) => localize(table.name, this.props.locale);
        this.getOptionValue = (table) => table.id;
    }
    render() {
        if (this.context.tableSelectElementFactory) {
            return this.context.tableSelectElementFactory({ schema: this.props.schema, value: this.props.value, onChange: this.props.onChange });
        }
        const tables = _.sortBy(this.props.schema.getTables(), (table) => localize(table.name, this.props.locale));
        return React.createElement(ReactSelect, { value: tables.find(t => t.id === this.props.value), options: tables, onChange: this.handleTableChange, getOptionLabel: this.getOptionLabel, getOptionValue: this.getOptionValue });
    }
}
TableSelect.contextTypes = {
    tableSelectElementFactory: PropTypes.func // Can be overridden by setting tableSelectElementFactory in context that takes ({ schema, value, onChange, filter, onFilterChange })
};
//# sourceMappingURL=propertyEditors.js.map