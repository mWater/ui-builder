"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
var lodash_1 = __importDefault(require("lodash"));
var React = __importStar(require("react"));
var bootstrap_1 = require("react-library/lib/bootstrap");
var blocks_1 = require("./blocks");
var mwater_expressions_1 = require("mwater-expressions");
var ListEditor_1 = __importDefault(require("./ListEditor"));
var mwater_expressions_ui_1 = require("mwater-expressions-ui");
var PropTypes = __importStar(require("prop-types"));
var react_select_1 = __importDefault(require("react-select"));
var localization_1 = require("./localization");
/* Components to build property editors. These may use bootstrap 3 as needed. */
var LabeledProperty = /** @class */ (function (_super) {
    __extends(LabeledProperty, _super);
    function LabeledProperty() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LabeledProperty.prototype.render = function () {
        return (React.createElement("div", { className: "form-group" },
            React.createElement("label", null, this.props.label),
            React.createElement("div", { style: { paddingLeft: 5 } }, this.props.children),
            React.createElement("p", { className: "help-block", style: { marginLeft: 5 } }, this.props.help)));
    };
    return LabeledProperty;
}(React.Component));
exports.LabeledProperty = LabeledProperty;
/** Creates a property editor for a property */
var PropertyEditor = /** @class */ (function (_super) {
    __extends(PropertyEditor, _super);
    function PropertyEditor() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handleChange = function (value) {
            var _a;
            _this.props.onChange(Object.assign({}, _this.props.obj, (_a = {}, _a[_this.props.property] = value, _a)));
        };
        return _this;
    }
    PropertyEditor.prototype.render = function () {
        var value = this.props.obj[this.props.property];
        return this.props.children(value, this.handleChange);
    };
    return PropertyEditor;
}(React.Component));
exports.PropertyEditor = PropertyEditor;
var LocalizedTextPropertyEditor = /** @class */ (function (_super) {
    __extends(LocalizedTextPropertyEditor, _super);
    function LocalizedTextPropertyEditor() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handleChange = function (e) {
            var locale = _this.props.locale || "en";
            var str = e.target.value;
            if (!_this.props.allowCR) {
                str = str.replace(/[\r\n]+/g, " ");
            }
            if (!str) {
                _this.props.onChange(null);
                return;
            }
            var value = Object.assign({}, _this.props.value || {});
            value._base = _this.props.locale;
            value[locale] = str;
            _this.props.onChange(value);
        };
        return _this;
    }
    LocalizedTextPropertyEditor.prototype.render = function () {
        var value = this.props.value || { _base: "en" };
        var locale = this.props.locale || "en";
        var str = "";
        if (value[locale]) {
            str = value[locale];
        }
        return (this.props.multiline
            ?
                React.createElement("textarea", { className: "form-control", value: str, onChange: this.handleChange, placeholder: this.props.placeholder, rows: 5 })
            :
                React.createElement("input", { className: "form-control", type: "text", value: str, onChange: this.handleChange, placeholder: this.props.placeholder }));
    };
    return LocalizedTextPropertyEditor;
}(React.Component));
exports.LocalizedTextPropertyEditor = LocalizedTextPropertyEditor;
var DropdownPropertyEditor = /** @class */ (function (_super) {
    __extends(DropdownPropertyEditor, _super);
    function DropdownPropertyEditor() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handleChange = function (value) {
            var _a;
            _this.props.onChange(Object.assign({}, _this.props.obj, (_a = {}, _a[_this.props.property] = value, _a)));
        };
        return _this;
    }
    DropdownPropertyEditor.prototype.render = function () {
        var value = this.props.obj[this.props.property];
        return (React.createElement(bootstrap_1.Select, { value: value, onChange: this.handleChange, options: this.props.options, nullLabel: this.props.nullLabel }));
    };
    return DropdownPropertyEditor;
}(React.Component));
exports.DropdownPropertyEditor = DropdownPropertyEditor;
/** Allows selecting a context variable */
var ContextVarPropertyEditor = /** @class */ (function (_super) {
    __extends(ContextVarPropertyEditor, _super);
    function ContextVarPropertyEditor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ContextVarPropertyEditor.prototype.render = function () {
        var _this = this;
        var contextVars = this.props.contextVars.filter(function (cv) { return !_this.props.types || _this.props.types.includes(cv.type); });
        contextVars = contextVars.filter(function (cv) { return !_this.props.table || _this.props.table === cv.table; });
        if (this.props.filter) {
            contextVars.filter(this.props.filter);
        }
        return React.createElement(bootstrap_1.Select, { value: this.props.value, onChange: this.props.onChange, nullLabel: this.props.nullLabel ? this.props.nullLabel : "Select...", options: contextVars.map(function (cv) { return ({ label: cv.name, value: cv.id }); }) });
    };
    return ContextVarPropertyEditor;
}(React.Component));
exports.ContextVarPropertyEditor = ContextVarPropertyEditor;
/** Edits both a context variable selection and a related expression */
exports.ContextVarExprPropertyEditor = function (props) {
    var contextVar = props.contextVars.find(function (cv) { return cv.id === props.contextVarId; });
    // Get all context variables up to an including one above. All context variables if null
    // This is because an outer context var expr cannot reference an inner context variable
    var cvIndex = props.contextVars.findIndex(function (cv) { return cv.id === props.contextVarId; });
    var availContextVars = cvIndex >= 0 ? lodash_1.default.take(props.contextVars, cvIndex + 1) : props.contextVars;
    return React.createElement("div", { style: { border: "solid 1px #DDD", borderRadius: 5, padding: 10 } },
        React.createElement(ContextVarPropertyEditor, { value: props.contextVarId, onChange: function (cv) { props.onChange(cv, null); }, nullLabel: "No Row/Rowset", contextVars: props.contextVars, types: ["row", "rowset"] }),
        React.createElement("div", { style: { paddingTop: 10 } },
            React.createElement(mwater_expressions_ui_1.ExprComponent, { value: props.expr, onChange: function (expr) { props.onChange(props.contextVarId, expr); }, schema: props.schema, dataSource: props.dataSource, aggrStatuses: props.aggrStatuses, types: props.types, variables: blocks_1.createExprVariables(availContextVars), table: contextVar ? contextVar.table || null : null, enumValues: props.enumValues, idTable: props.idTable })));
};
/** Edits an action definition, allowing selection of action */
var ActionDefEditor = /** @class */ (function (_super) {
    __extends(ActionDefEditor, _super);
    function ActionDefEditor() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handleChangeAction = function (type) {
            if (type) {
                _this.props.onChange(_this.props.designCtx.actionLibrary.createNewActionDef(type));
            }
            else {
                _this.props.onChange(null);
            }
        };
        return _this;
    }
    ActionDefEditor.prototype.render = function () {
        var action = this.props.value ? this.props.designCtx.actionLibrary.createAction(this.props.value) : null;
        return (React.createElement("div", null,
            React.createElement(bootstrap_1.Select, { nullLabel: "No Action", onChange: this.handleChangeAction, value: this.props.value ? this.props.value.type : null, options: this.props.designCtx.actionLibrary.getActionTypes().map(function (at) { return ({ label: at.name, value: at.type }); }) }),
            action
                ? action.renderEditor(__assign(__assign({}, this.props.designCtx), { onChange: this.props.onChange }))
                : null));
    };
    return ActionDefEditor;
}(React.Component));
exports.ActionDefEditor = ActionDefEditor;
/** Edits an array of order by expressions */
var OrderByArrayEditor = /** @class */ (function (_super) {
    __extends(OrderByArrayEditor, _super);
    function OrderByArrayEditor() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handleAddOrderByExpr = function () {
            _this.props.onChange((_this.props.value || []).concat([{ expr: null, dir: "asc" }]));
        };
        return _this;
    }
    OrderByArrayEditor.prototype.render = function () {
        var _this = this;
        return (React.createElement("div", null,
            React.createElement(ListEditor_1.default, { items: this.props.value || [], onItemsChange: this.props.onChange }, function (orderBy, onOrderByChange) { return (React.createElement(OrderByEditor, { value: orderBy, schema: _this.props.schema, dataSource: _this.props.dataSource, onChange: onOrderByChange, table: _this.props.table, contextVars: _this.props.contextVars })); }),
            React.createElement("button", { type: "button", className: "btn btn-link btn-sm", onClick: this.handleAddOrderByExpr }, "+ Add Order By")));
    };
    return OrderByArrayEditor;
}(React.Component));
exports.OrderByArrayEditor = OrderByArrayEditor;
var OrderByEditor = /** @class */ (function (_super) {
    __extends(OrderByEditor, _super);
    function OrderByEditor() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handleExprChange = function (expr) {
            _this.props.onChange(__assign(__assign({}, _this.props.value), { expr: expr }));
        };
        _this.handleDirToggle = function () {
            _this.props.onChange(__assign(__assign({}, _this.props.value), { dir: (_this.props.value.dir === "asc") ? "desc" : "asc" }));
        };
        return _this;
    }
    OrderByEditor.prototype.render = function () {
        return (React.createElement("div", null,
            React.createElement("div", { style: { float: "left" } },
                React.createElement("a", { onClick: this.handleDirToggle }, this.props.value.dir === "asc" ? React.createElement("i", { className: "fa fa-arrow-up" }) : React.createElement("i", { className: "fa fa-arrow-down" }))),
            React.createElement(mwater_expressions_ui_1.ExprComponent, { schema: this.props.schema, dataSource: this.props.dataSource, types: ["text", "number", "enum", "boolean", "date", "datetime"], table: this.props.table, value: this.props.value.expr, variables: blocks_1.createExprVariables(this.props.contextVars), onChange: this.handleExprChange })));
    };
    return OrderByEditor;
}(React.Component));
exports.OrderByEditor = OrderByEditor;
/** Edits a d3 format */
var NumberFormatEditor = /** @class */ (function (_super) {
    __extends(NumberFormatEditor, _super);
    function NumberFormatEditor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NumberFormatEditor.prototype.render = function () {
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
    };
    return NumberFormatEditor;
}(React.Component));
exports.NumberFormatEditor = NumberFormatEditor;
/** Edits a moment.js date format */
var DateFormatEditor = /** @class */ (function (_super) {
    __extends(DateFormatEditor, _super);
    function DateFormatEditor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DateFormatEditor.prototype.render = function () {
        return (React.createElement(bootstrap_1.Select, { value: this.props.value || "", onChange: this.props.onChange, nullLabel: "Short (Sep 4, 1986)", options: [
                { value: "LL", label: "Long (September 4, 1986)" },
                { value: "YYYY-MM-DD", label: "YYYY-MM-DD (1986-04-09)" },
            ] }));
    };
    return DateFormatEditor;
}(React.Component));
exports.DateFormatEditor = DateFormatEditor;
/** Edits a moment.js datetime format */
var DatetimeFormatEditor = /** @class */ (function (_super) {
    __extends(DatetimeFormatEditor, _super);
    function DatetimeFormatEditor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DatetimeFormatEditor.prototype.render = function () {
        return (React.createElement(bootstrap_1.Select, { value: this.props.value || "", onChange: this.props.onChange, nullLabel: "Short (Sep 4, 1986 8:30 PM)", options: [
                { value: "llll", label: "Medium (Thu, Sep 4, 1986 8:30 PM)" },
                { value: "LLLL", label: "Long (Thursday, September 4, 1986 8:30 PM)" },
                { value: "ll", label: "Short Date (Sep 4, 1986)" },
                { value: "LL", label: "Long Date (September 4, 1986)" },
            ] }));
    };
    return DatetimeFormatEditor;
}(React.Component));
exports.DatetimeFormatEditor = DatetimeFormatEditor;
/** Allow selecting a table */
var TableSelect = /** @class */ (function (_super) {
    __extends(TableSelect, _super);
    function TableSelect() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handleTableChange = function (table) {
            _this.props.onChange(table.id);
        };
        _this.getOptionLabel = function (table) { return localization_1.localize(table.name, _this.props.locale); };
        _this.getOptionValue = function (table) { return table.id; };
        return _this;
    }
    TableSelect.prototype.render = function () {
        var _this = this;
        if (this.context.tableSelectElementFactory) {
            return this.context.tableSelectElementFactory({ schema: this.props.schema, value: this.props.value || null, onChange: this.props.onChange });
        }
        var tables = lodash_1.default.sortBy(this.props.schema.getTables(), function (table) { return localization_1.localize(table.name, _this.props.locale); });
        return React.createElement(react_select_1.default, { value: tables.find(function (t) { return t.id === _this.props.value; }) || null, options: tables, onChange: this.handleTableChange, getOptionLabel: this.getOptionLabel, getOptionValue: this.getOptionValue });
    };
    TableSelect.contextTypes = {
        tableSelectElementFactory: PropTypes.func // Can be overridden by setting tableSelectElementFactory in context that takes ({ schema, value, onChange, filter, onFilterChange })
    };
    return TableSelect;
}(React.Component));
exports.TableSelect = TableSelect;
/** Edits an array of enum values */
exports.EnumArrayEditor = function (props) {
    // Map value to array
    var value = null;
    if (props.value) {
        value = lodash_1.default.compact((props.value || []).map(function (v) { return props.enumValues.find(function (ev) { return ev.id === v; }); }));
    }
    var getOptionLabel = function (ev) { return localization_1.localize(ev.name, props.locale); };
    var getOptionValue = function (ev) { return ev.id; };
    var handleChange = function (evs) {
        props.onChange(evs && evs.length > 0 ? evs.map(function (ev) { return ev.id; }) : null);
    };
    return React.createElement(react_select_1.default, { value: value, onChange: handleChange, options: props.enumValues, placeholder: props.placeholder, getOptionLabel: getOptionLabel, getOptionValue: getOptionValue, isClearable: true, isMulti: true, styles: {
            // Keep menu above other controls
            menu: function (style) { return (__assign(__assign({}, style), { zIndex: 2000 })); }
        } });
};
/** Edits embedded expressions. */
exports.EmbeddedExprsEditor = function (props) {
    var value = props.value, onChange = props.onChange, schema = props.schema, dataSource = props.dataSource, contextVars = props.contextVars;
    var handleAddEmbeddedExpr = function () {
        onChange((value || []).concat([{ contextVarId: contextVars.length > 0 ? contextVars[contextVars.length - 1].id : null, expr: null, format: null }]));
    };
    return (React.createElement("div", null,
        React.createElement(ListEditor_1.default, { items: value || [], onItemsChange: onChange }, function (item, onItemChange) {
            return React.createElement(exports.EmbeddedExprEditor, { value: item, onChange: onItemChange, schema: schema, dataSource: dataSource, contextVars: contextVars });
        }),
        React.createElement("button", { type: "button", className: "btn btn-link btn-sm", onClick: handleAddEmbeddedExpr }, "+ Add Embedded Expression")));
};
/** Allows editing of an embedded expression */
exports.EmbeddedExprEditor = function (props) {
    var schema = props.schema, dataSource = props.dataSource, contextVars = props.contextVars;
    var handleChange = function (contextVarId, expr) {
        var exprType = new mwater_expressions_1.ExprUtils(schema, blocks_1.createExprVariables(contextVars)).getExprType(props.value.expr);
        var newExprType = new mwater_expressions_1.ExprUtils(schema, blocks_1.createExprVariables(contextVars)).getExprType(expr);
        if (newExprType !== exprType) {
            props.onChange(__assign(__assign({}, props.value), { contextVarId: contextVarId, expr: expr, format: null }));
        }
        else {
            props.onChange(__assign(__assign({}, props.value), { contextVarId: contextVarId, expr: expr }));
        }
    };
    var exprType = new mwater_expressions_1.ExprUtils(schema, blocks_1.createExprVariables(contextVars)).getExprType(props.value.expr);
    return (React.createElement("div", null,
        React.createElement(LabeledProperty, { label: "Expression" },
            React.createElement(exports.ContextVarExprPropertyEditor, { contextVarId: props.value.contextVarId, expr: props.value.expr, onChange: handleChange, schema: schema, dataSource: dataSource, contextVars: contextVars, aggrStatuses: ["individual", "aggregate", "literal"] })),
        exprType === "number" ?
            React.createElement(LabeledProperty, { label: "Number Format" },
                React.createElement(PropertyEditor, { obj: props.value, onChange: props.onChange, property: "format" }, function (value, onChange) { return (React.createElement(NumberFormatEditor, { value: value, onChange: onChange })); }))
            : null,
        exprType === "date" ?
            React.createElement(LabeledProperty, { label: "Date Format" },
                React.createElement(PropertyEditor, { obj: props.value, onChange: props.onChange, property: "format" }, function (value, onChange) { return (React.createElement(DateFormatEditor, { value: value, onChange: onChange })); }))
            : null,
        exprType === "datetime" ?
            React.createElement(LabeledProperty, { label: "Date/time Format" },
                React.createElement(PropertyEditor, { obj: props.value, onChange: props.onChange, property: "format" }, function (value, onChange) { return (React.createElement(DatetimeFormatEditor, { value: value, onChange: onChange })); }))
            : null));
};
