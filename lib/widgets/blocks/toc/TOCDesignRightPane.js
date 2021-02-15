"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOCDesignRightPane = void 0;
var react_1 = __importDefault(require("react"));
var lodash_1 = __importDefault(require("lodash"));
var immer_1 = __importDefault(require("immer"));
var propertyEditors_1 = require("../../propertyEditors");
var bootstrap_1 = require("react-library/lib/bootstrap");
function TOCDesignRightPane(props) {
    var item = props.item, onItemChange = props.onItemChange, renderProps = props.renderProps;
    var selectedWidgetId = item.widgetId;
    var handleLabelBlockChange = function (labelBlock) {
        onItemChange(immer_1.default(item, function (draft) {
            draft.labelBlock = labelBlock;
        }));
    };
    var handleWidgetIdChange = function (widgetId) {
        onItemChange(immer_1.default(item, function (draft) {
            draft.widgetId = widgetId;
        }));
    };
    var handleTitleChange = function (title) {
        onItemChange(immer_1.default(item, function (draft) {
            draft.title = title;
        }));
    };
    var handleContextVarMapChange = function (contextVarMap) {
        onItemChange(immer_1.default(item, function (draft) {
            draft.contextVarMap = contextVarMap;
        }));
    };
    var handleConditionChange = function (condition) {
        onItemChange(immer_1.default(item, function (draft) {
            draft.condition = condition;
        }));
    };
    // Create widget options 
    var widgetOptions = lodash_1.default.sortByAll(Object.values(renderProps.widgetLibrary.widgets), "group", "name").map(function (w) { return ({ label: (w.group ? w.group + ": " : "") + w.name, value: w.id }); });
    var renderContextVarValues = function () {
        if (!item.widgetId) {
            return null;
        }
        // Find the widget
        var widgetDef = renderProps.widgetLibrary.widgets[item.widgetId];
        if (!widgetDef) {
            return null;
        }
        var contextVarMap = item.contextVarMap || {};
        return (react_1.default.createElement("table", { className: "table table-bordered table-condensed" },
            react_1.default.createElement("tbody", null, widgetDef.contextVars.map(function (contextVar) {
                var cv = contextVarMap[contextVar.id];
                var handleCVChange = function (contextVarId) {
                    var _a;
                    if (contextVarId) {
                        handleContextVarMapChange(__assign(__assign({}, contextVarMap), (_a = {}, _a[contextVar.id] = contextVarId, _a)));
                    }
                    else {
                        handleContextVarMapChange(immer_1.default(contextVarMap, function (draft) { delete draft[contextVar.id]; }));
                    }
                };
                return (react_1.default.createElement("tr", { key: contextVar.id },
                    react_1.default.createElement("td", { key: "name" }, contextVar.name),
                    react_1.default.createElement("td", { key: "value" },
                        react_1.default.createElement(propertyEditors_1.ContextVarPropertyEditor, { contextVars: renderProps.contextVars, types: [contextVar.type], table: contextVar.table, value: cv, onChange: handleCVChange }))));
            }))));
    };
    return (react_1.default.createElement("div", { style: { padding: 10 } },
        react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Label" }, renderProps.renderChildBlock(renderProps, item.labelBlock || null, handleLabelBlockChange)),
        react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Widget" },
            react_1.default.createElement(bootstrap_1.Select, { value: selectedWidgetId, onChange: handleWidgetIdChange, options: widgetOptions, nullLabel: "Select Widget" })),
        react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Page title (optional)" },
            react_1.default.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: item.title || null, onChange: handleTitleChange, locale: props.renderProps.locale })),
        react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Variable Mappings" }, renderContextVarValues()),
        item.children.length > 0 ?
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Collapse/Expand" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: item, onChange: onItemChange, property: "collapse" }, function (value, onChange) {
                    return react_1.default.createElement(bootstrap_1.Toggle, { value: value || "expanded", onChange: onChange, options: [
                            { value: "expanded", label: "Always Expanded" },
                            { value: "startExpanded", label: "Start Expanded" },
                            { value: "startCollapsed", label: "Start Collapsed" }
                        ] });
                }))
            : null,
        react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Conditional display (optional)" },
            react_1.default.createElement(propertyEditors_1.ContextVarExprPropertyEditor, { schema: renderProps.schema, dataSource: renderProps.dataSource, contextVars: renderProps.contextVars, contextVarId: item.condition ? item.condition.contextVarId : null, expr: item.condition ? item.condition.expr : null, onChange: function (contextVarId, expr) { handleConditionChange({ contextVarId: contextVarId, expr: expr }); }, types: ["boolean"] }))));
}
exports.TOCDesignRightPane = TOCDesignRightPane;
