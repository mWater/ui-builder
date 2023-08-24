"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOCDesignRightPane = void 0;
const react_1 = __importDefault(require("react"));
const lodash_1 = __importDefault(require("lodash"));
const immer_1 = __importDefault(require("immer"));
const propertyEditors_1 = require("../../propertyEditors");
const bootstrap_1 = require("react-library/lib/bootstrap");
function TOCDesignRightPane(props) {
    const { item, onItemChange, renderProps } = props;
    const selectedWidgetId = item.widgetId;
    const handleLabelBlockChange = (labelBlock) => {
        onItemChange((0, immer_1.default)(item, (draft) => {
            draft.labelBlock = labelBlock;
        }));
    };
    const handleWidgetIdChange = (widgetId) => {
        onItemChange((0, immer_1.default)(item, (draft) => {
            draft.widgetId = widgetId;
        }));
    };
    const handleTitleChange = (title) => {
        onItemChange((0, immer_1.default)(item, (draft) => {
            draft.title = title;
        }));
    };
    const handleContextVarMapChange = (contextVarMap) => {
        onItemChange((0, immer_1.default)(item, (draft) => {
            draft.contextVarMap = contextVarMap;
        }));
    };
    const handleConditionChange = (condition) => {
        onItemChange((0, immer_1.default)(item, (draft) => {
            draft.condition = condition;
        }));
    };
    // Create widget options
    const widgetOptions = lodash_1.default.sortByAll(Object.values(renderProps.widgetLibrary.widgets), "group", "name").map((w) => ({
        label: (w.deprecated ? "Deprecated:" : "") + (w.group ? `${w.group}: ` : "") + w.name,
        value: w.id
    }));
    const renderContextVarValues = () => {
        if (!item.widgetId) {
            return null;
        }
        // Find the widget
        const widgetDef = renderProps.widgetLibrary.widgets[item.widgetId];
        if (!widgetDef) {
            return null;
        }
        const contextVarMap = item.contextVarMap || {};
        return (react_1.default.createElement("table", { className: "table table-bordered table-sm" },
            react_1.default.createElement("tbody", null, widgetDef.contextVars.map((contextVar) => {
                const cv = contextVarMap[contextVar.id];
                const handleCVChange = (contextVarId) => {
                    if (contextVarId) {
                        handleContextVarMapChange(Object.assign(Object.assign({}, contextVarMap), { [contextVar.id]: contextVarId }));
                    }
                    else {
                        handleContextVarMapChange((0, immer_1.default)(contextVarMap, (draft) => {
                            delete draft[contextVar.id];
                        }));
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
        item.title ? (react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Title embedded expressions", help: "Reference in text as {0}, {1}, etc." },
            react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: item, onChange: onItemChange, property: "titleEmbeddedExprs" }, (value, onChange) => (react_1.default.createElement(propertyEditors_1.EmbeddedExprsEditor, { value: value, onChange: onChange, schema: renderProps.schema, dataSource: renderProps.dataSource, contextVars: renderProps.contextVars }))))) : null,
        react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Variable Mappings" }, renderContextVarValues()),
        item.children.length > 0 ? (react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Collapse/Expand" },
            react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: item, onChange: onItemChange, property: "collapse" }, (value, onChange) => {
                return (react_1.default.createElement(bootstrap_1.Toggle, { value: value || "expanded", onChange: onChange, options: [
                        { value: "expanded", label: "Always Expanded" },
                        { value: "startExpanded", label: "Start Expanded" },
                        { value: "startCollapsed", label: "Start Collapsed" }
                    ] }));
            }))) : null,
        item.children.length > 0 && item.collapse == "startExpanded" ? (react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Collapse at width" },
            react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: item, onChange: onItemChange, property: "collapseWidth" }, (value, onChange) => react_1.default.createElement(propertyEditors_1.ResponsiveWidthSelector, { value: value, onChange: onChange })))) : null,
        react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Conditional display (optional)" },
            react_1.default.createElement(propertyEditors_1.ContextVarExprPropertyEditor, { schema: renderProps.schema, dataSource: renderProps.dataSource, contextVars: renderProps.contextVars, contextVarExpr: item.condition, onChange: handleConditionChange, types: ["boolean"] }))));
}
exports.TOCDesignRightPane = TOCDesignRightPane;
