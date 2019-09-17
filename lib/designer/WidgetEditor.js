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
var React = __importStar(require("react"));
var uuid_1 = require("uuid");
var propertyEditors_1 = require("../widgets/propertyEditors");
var localization_1 = require("../widgets/localization");
var immer_1 = require("immer");
var mwater_expressions_ui_1 = require("mwater-expressions-ui");
var ListEditor_1 = __importDefault(require("../widgets/ListEditor"));
var bootstrap_1 = require("react-library/lib/bootstrap");
var ActionCancelModalComponent_1 = __importDefault(require("react-library/lib/ActionCancelModalComponent"));
/** Edits the overall properties of a widget */
var WidgetEditor = /** @class */ (function (_super) {
    __extends(WidgetEditor, _super);
    function WidgetEditor() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handleContextVarsChange = function (contextVars) {
            _this.props.onWidgetDefChange(__assign(__assign({}, _this.props.widgetDef), { contextVars: contextVars }));
        };
        return _this;
    }
    WidgetEditor.prototype.render = function () {
        var _this = this;
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Name" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.props.widgetDef, onChange: this.props.onWidgetDefChange, property: "name" }, function (value, onChange) { return React.createElement(bootstrap_1.TextInput, { value: value, onChange: onChange }); })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Description" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.props.widgetDef, onChange: this.props.onWidgetDefChange, property: "description" }, function (value, onChange) { return React.createElement(bootstrap_1.TextInput, { value: value, onChange: onChange }); })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Variables" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.props.widgetDef, onChange: this.props.onWidgetDefChange, property: "contextVars" }, function (value, onChange) { return React.createElement(ContextVarsEditor, { contextVars: value, onChange: onChange, schema: _this.props.schema }); })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Preview Variable Values" }, this.props.widgetDef.contextVars.map(function (contextVar) {
                return React.createElement(ContextVarPreviewValue, { key: contextVar.id, contextVar: contextVar, widgetDef: _this.props.widgetDef, schema: _this.props.schema, dataSource: _this.props.dataSource, onWidgetDefChange: _this.props.onWidgetDefChange });
            })),
            React.createElement("div", { style: { color: "#EEE", fontSize: 9 } }, this.props.widgetDef.id)));
    };
    return WidgetEditor;
}(React.Component));
exports.WidgetEditor = WidgetEditor;
var ContextVarsEditor = /** @class */ (function (_super) {
    __extends(ContextVarsEditor, _super);
    function ContextVarsEditor() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handleAddContextVar = function (contextVar) {
            _this.props.onChange(_this.props.contextVars.concat(contextVar));
        };
        _this.handleOpenAdd = function () {
            _this.modalElem.show();
        };
        _this.handleModalRef = function (elem) {
            _this.modalElem = elem;
        };
        return _this;
    }
    ContextVarsEditor.prototype.render = function () {
        var _this = this;
        return (React.createElement("div", null,
            React.createElement(ListEditor_1.default, { items: this.props.contextVars, onItemsChange: this.props.onChange }, function (contextVar, onContextVarChange) { return React.createElement(ContextVarEditor, { contextVar: contextVar, onChange: onContextVarChange, schema: _this.props.schema }); }),
            React.createElement(AddContextVarModal, { schema: this.props.schema, locale: "en", ref: this.handleModalRef, onAdd: this.handleAddContextVar }),
            React.createElement("button", { type: "button", className: "btn btn-link", onClick: this.handleOpenAdd },
                React.createElement("i", { className: "fa fa-plus" }),
                " Add Variable")));
    };
    return ContextVarsEditor;
}(React.Component));
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
            "\u00A0(",
            desc,
            ")"));
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
            contextVar: { id: uuid_1.v4(), name: "Untitled", type: "row" }
        });
    };
    AddContextVarModal.prototype.render = function () {
        var _this = this;
        if (!this.state.visible) {
            return null;
        }
        var typeOptions = [
            { value: "row", label: "Row of a table" },
            { value: "rowset", label: "Set of rows of a table" },
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
/** Allows editing of the preview value for one context variable */
var ContextVarPreviewValue = /** @class */ (function (_super) {
    __extends(ContextVarPreviewValue, _super);
    function ContextVarPreviewValue() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handleChange = function (value) {
            _this.props.onWidgetDefChange(immer_1.produce(_this.props.widgetDef, function (draft) {
                draft.contextVarPreviewValues[_this.props.contextVar.id] = value;
            }));
        };
        return _this;
    }
    ContextVarPreviewValue.prototype.renderValue = function (value) {
        if (this.props.contextVar.type === "row") {
            return React.createElement(mwater_expressions_ui_1.IdLiteralComponent, { schema: this.props.schema, dataSource: this.props.dataSource, idTable: this.props.contextVar.table, value: value, onChange: this.handleChange });
        }
        if (this.props.contextVar.type === "rowset") {
            return React.createElement(mwater_expressions_ui_1.ExprComponent, { schema: this.props.schema, dataSource: this.props.dataSource, table: this.props.contextVar.table, types: ["boolean"], value: value, onChange: this.handleChange });
        }
        return React.createElement("i", null, "Not supported");
    };
    ContextVarPreviewValue.prototype.render = function () {
        var value = this.props.widgetDef.contextVarPreviewValues[this.props.contextVar.id];
        return (React.createElement("div", null,
            React.createElement("div", null,
                this.props.contextVar.name,
                ":"),
            this.renderValue(value)));
    };
    return ContextVarPreviewValue;
}(React.Component));
