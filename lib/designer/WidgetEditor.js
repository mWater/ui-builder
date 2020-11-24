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
exports.WidgetEditor = void 0;
var React = __importStar(require("react"));
var uuid_1 = require("uuid");
var propertyEditors_1 = require("../widgets/propertyEditors");
var blocks_1 = require("../widgets/blocks");
var localization_1 = require("../widgets/localization");
var immer_1 = require("immer");
var mwater_expressions_ui_1 = require("mwater-expressions-ui");
var ListEditor_1 = __importDefault(require("../widgets/ListEditor"));
var bootstrap_1 = require("react-library/lib/bootstrap");
var ActionCancelModalComponent_1 = __importDefault(require("react-library/lib/ActionCancelModalComponent"));
var react_1 = require("react");
/** Edits the overall properties of a widget */
var WidgetEditor = /** @class */ (function (_super) {
    __extends(WidgetEditor, _super);
    function WidgetEditor() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handleContextVarsChange = function (contextVars) {
            _this.props.onWidgetDefChange(__assign(__assign({}, _this.props.widgetDef), { contextVars: contextVars }));
        };
        _this.handleContextVarPreviewValues = function (contextVarPreviewValues) {
            _this.props.onWidgetDefChange(__assign(__assign({}, _this.props.widgetDef), { contextVarPreviewValues: contextVarPreviewValues }));
        };
        _this.handlePrivateContextVarValuesChange = function (privateContextVarValues) {
            _this.props.onWidgetDefChange(__assign(__assign({}, _this.props.widgetDef), { privateContextVarValues: privateContextVarValues }));
        };
        return _this;
    }
    WidgetEditor.prototype.render = function () {
        var _this = this;
        // Get list of all non-private context variables, including global
        var allContextVars = (this.props.designCtx.globalContextVars || [])
            .concat(this.props.widgetDef.contextVars);
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Name" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.props.widgetDef, onChange: this.props.onWidgetDefChange, property: "name" }, function (value, onChange) { return React.createElement(bootstrap_1.TextInput, { value: value, onChange: onChange }); })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Description" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.props.widgetDef, onChange: this.props.onWidgetDefChange, property: "description" }, function (value, onChange) { return React.createElement(bootstrap_1.TextInput, { value: value, onChange: onChange }); })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Variables", hint: "Define data sources (rowsets or rows)" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.props.widgetDef, onChange: this.props.onWidgetDefChange, property: "privateContextVars" }, function (value, onChange) { return React.createElement(ContextVarsEditor, { contextVars: value || [], onChange: onChange, contextVarValues: _this.props.widgetDef.privateContextVarValues || {}, onContextVarValuesChange: _this.handlePrivateContextVarValuesChange, schema: _this.props.designCtx.schema, dataSource: _this.props.designCtx.dataSource, availContextVars: allContextVars }); })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "External Variables", hint: "These are passed in to the widget from its parent. Values for preview only" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.props.widgetDef, onChange: this.props.onWidgetDefChange, property: "contextVars" }, function (value, onChange) { return React.createElement(ContextVarsEditor, { contextVars: value, onChange: onChange, contextVarValues: _this.props.widgetDef.contextVarPreviewValues, onContextVarValuesChange: _this.handleContextVarPreviewValues, schema: _this.props.designCtx.schema, dataSource: _this.props.designCtx.dataSource, availContextVars: allContextVars }); })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Global Variables", hint: "Values for preview only" }, (this.props.designCtx.globalContextVars || []).map(function (contextVar) {
                return React.createElement("div", { key: contextVar.id, style: { paddingBottom: 10 } },
                    React.createElement("div", null,
                        contextVar.name,
                        ":"),
                    React.createElement(ContextVarValueEditor, { contextVar: contextVar, contextVarValues: _this.props.widgetDef.contextVarPreviewValues, onContextVarValuesChange: _this.handleContextVarPreviewValues, schema: _this.props.designCtx.schema, dataSource: _this.props.designCtx.dataSource, availContextVars: allContextVars }));
            })),
            React.createElement(propertyEditors_1.PropertyEditor, { obj: this.props.widgetDef, onChange: this.props.onWidgetDefChange, property: "virtualizeDatabaseInPreview" }, function (value, onChange) { return React.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange }, "Prevent changes to database in Preview"); }),
            React.createElement("div", { style: { color: "#D8D8D8", fontSize: 9 } }, this.props.widgetDef.id)));
    };
    return WidgetEditor;
}(React.Component));
exports.WidgetEditor = WidgetEditor;
/** Edits a set of context variables and their values */
var ContextVarsEditor = function (props) {
    var _a = react_1.useState(null), modalElem = _a[0], setModalElem = _a[1];
    var handleAddContextVar = function (contextVar) {
        props.onChange(props.contextVars.concat(contextVar));
    };
    var handleOpenAdd = function () {
        modalElem.show();
    };
    var handleModalRef = function (elem) {
        setModalElem(elem);
    };
    return (React.createElement("div", null,
        React.createElement(ListEditor_1.default, { items: props.contextVars, onItemsChange: props.onChange }, function (contextVar, onContextVarChange) { return (React.createElement("div", null,
            React.createElement(ContextVarEditor, { contextVar: contextVar, onChange: onContextVarChange, schema: props.schema }),
            React.createElement(ContextVarValueEditor, { contextVar: contextVar, contextVarValues: props.contextVarValues, onContextVarValuesChange: props.onContextVarValuesChange, schema: props.schema, dataSource: props.dataSource, availContextVars: props.availContextVars }))); }),
        React.createElement(AddContextVarModal, { schema: props.schema, locale: "en", ref: handleModalRef, onAdd: handleAddContextVar }),
        React.createElement("button", { type: "button", className: "btn btn-link", onClick: handleOpenAdd },
            React.createElement("i", { className: "fa fa-plus" }),
            " Add Variable")));
};
/** Individual item of a context variable list */
var ContextVarEditor = /** @class */ (function (_super) {
    __extends(ContextVarEditor, _super);
    function ContextVarEditor() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handleNameChange = function () {
            var name = window.prompt("Enter name", _this.props.contextVar.name);
            if (name) {
                _this.props.onChange(__assign(__assign({}, _this.props.contextVar), { name: name }));
            }
        };
        return _this;
    }
    ContextVarEditor.prototype.render = function () {
        var desc = this.props.contextVar.type;
        if (this.props.contextVar.table) {
            desc += " of ";
            desc += this.props.schema.getTable(this.props.contextVar.table) ? localization_1.localize(this.props.schema.getTable(this.props.contextVar.table).name, "en") : this.props.contextVar.table;
        }
        return (React.createElement("div", null,
            React.createElement("a", { onClick: this.handleNameChange }, this.props.contextVar.name),
            "\u00A0 ",
            React.createElement("span", { className: "text-muted" },
                "- ",
                desc)));
    };
    return ContextVarEditor;
}(React.Component));
var AddContextVarModal = /** @class */ (function (_super) {
    __extends(AddContextVarModal, _super);
    function AddContextVarModal(props) {
        var _this = _super.call(this, props) || this;
        _this.handleAdd = function () {
            if (_this.state.contextVar.type === "row" || _this.state.contextVar.type === "rowset") {
                if (!_this.state.contextVar.table) {
                    alert("Table required");
                    return;
                }
            }
            _this.setState({ visible: false });
            _this.props.onAdd(_this.state.contextVar);
        };
        _this.handleCancel = function () {
            _this.setState({ visible: false });
        };
        _this.handleContextVarChange = function (contextVar) {
            // Clear table
            if (contextVar.type !== "row" && contextVar.type !== "rowset") {
                contextVar = { id: contextVar.id, type: contextVar.type, name: contextVar.name };
            }
            _this.setState({ contextVar: contextVar });
        };
        _this.state = { visible: false };
        return _this;
    }
    AddContextVarModal.prototype.show = function () {
        this.setState({
            visible: true,
            contextVar: { id: uuid_1.v4(), name: "Untitled", type: "rowset" }
        });
    };
    AddContextVarModal.prototype.render = function () {
        var _this = this;
        if (!this.state.visible) {
            return null;
        }
        var typeOptions = [
            { value: "rowset", label: "Set of rows of a table" },
            { value: "row", label: "Row of a table" },
            { value: "text", label: "Text" },
            { value: "number", label: "Number" },
            { value: "boolean", label: "Boolean" },
            { value: "date", label: "Date" },
            { value: "datetime", label: "Datetime" }
        ];
        return (React.createElement(ActionCancelModalComponent_1.default, { actionLabel: "Add", onAction: this.handleAdd, onCancel: this.handleCancel },
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Name" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.state.contextVar, property: "name", onChange: this.handleContextVarChange }, function (value, onChange) { return React.createElement(bootstrap_1.TextInput, { value: value, onChange: onChange }); })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Type" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.state.contextVar, property: "type", onChange: this.handleContextVarChange }, function (value, onChange) { return React.createElement(bootstrap_1.Select, { value: value, onChange: onChange, options: typeOptions }); })),
            this.state.contextVar.type === "row" || this.state.contextVar.type === "rowset" ?
                React.createElement("div", { style: { paddingBottom: 200 } },
                    React.createElement(propertyEditors_1.LabeledProperty, { label: "Table" },
                        React.createElement(propertyEditors_1.PropertyEditor, { obj: this.state.contextVar, property: "table", onChange: this.handleContextVarChange }, function (value, onChange) { return React.createElement(propertyEditors_1.TableSelect, { schema: _this.props.schema, value: value || null, onChange: onChange, locale: _this.props.locale }); })))
                : null));
    };
    return AddContextVarModal;
}(React.Component));
/** Allows editing of the value for one context variable */
var ContextVarValueEditor = /** @class */ (function (_super) {
    __extends(ContextVarValueEditor, _super);
    function ContextVarValueEditor() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handleChange = function (value) {
            _this.props.onContextVarValuesChange(immer_1.produce(_this.props.contextVarValues || {}, function (draft) {
                draft[_this.props.contextVar.id] = value;
            }));
        };
        return _this;
    }
    ContextVarValueEditor.prototype.renderValue = function (value) {
        if ((this.props.contextVar.type === "row" || this.props.contextVar.type === "id") && this.props.schema.getTable(this.props.contextVar.table)) {
            return React.createElement(mwater_expressions_ui_1.IdLiteralComponent, { schema: this.props.schema, dataSource: this.props.dataSource, idTable: this.props.contextVar.table, value: value, onChange: this.handleChange });
        }
        if (this.props.contextVar.type === "id[]" && this.props.schema.getTable(this.props.contextVar.table)) {
            return React.createElement(mwater_expressions_ui_1.IdLiteralComponent, { schema: this.props.schema, dataSource: this.props.dataSource, idTable: this.props.contextVar.table, value: value, onChange: this.handleChange, multi: true });
        }
        if (this.props.contextVar.type === "rowset") {
            return React.createElement(mwater_expressions_ui_1.ExprComponent, { schema: this.props.schema, dataSource: this.props.dataSource, table: this.props.contextVar.table, types: ["boolean"], value: value, onChange: this.handleChange, variables: blocks_1.createExprVariables(this.props.availContextVars) });
        }
        if (this.props.contextVar.type == "enum") {
            return React.createElement(bootstrap_1.Select, { nullLabel: "", value: value, onChange: this.handleChange, options: this.props.contextVar.enumValues.map(function (ev) { return ({ value: ev.id, label: localization_1.localize(ev.name) }); }) });
        }
        if (this.props.contextVar.type == "boolean") {
            return React.createElement(bootstrap_1.Select, { nullLabel: "", value: value, onChange: this.handleChange, options: [{ value: true, label: "True" }, { value: false, label: "False" }] });
        }
        return React.createElement("i", null, "Not supported");
    };
    ContextVarValueEditor.prototype.render = function () {
        var value = (this.props.contextVarValues || {})[this.props.contextVar.id];
        return this.renderValue(value);
    };
    return ContextVarValueEditor;
}(React.Component));
