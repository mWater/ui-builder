"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = __importDefault(require("lodash"));
var toc_1 = require("./toc");
var blocks_1 = require("../../blocks");
var react_1 = require("react");
var localization_1 = require("../../localization");
var SplitPane_1 = __importDefault(require("./SplitPane"));
var react_2 = __importDefault(require("react"));
var PageStackDisplay_1 = require("../../../PageStackDisplay");
var mwater_expressions_1 = require("mwater-expressions");
/** Instance component for TOC */
function TOCInstanceComp(props) {
    var blockDef = props.blockDef, instanceCtx = props.instanceCtx;
    // Ref to page stack to ensure closed properly
    var pageStackRef = react_1.useRef(null);
    // Select first item with widget by default
    var firstItem = toc_1.iterateItems(blockDef.items).find(function (item) { return item.widgetId; });
    var _a = react_1.useState(firstItem ? firstItem.id : null), selectedId = _a[0], setSelectedId = _a[1];
    // Store collapsed state for items. If not listed, is expanded
    var _b = react_1.useState(function () {
        return toc_1.iterateItems(blockDef.items).filter(function (item) { return item.collapse == "startCollapsed"; }).map(function (item) { return item.id; });
    }), collapsedItems = _b[0], setCollapsedItems = _b[1];
    // Select item
    var handleItemClick = function (item) {
        // Toggle collapse
        if (item.children.length > 0 && (item.collapse == "startCollapsed" || item.collapse == "startExpanded")) {
            if (collapsedItems.includes(item.id)) {
                setCollapsedItems(lodash_1.default.without(collapsedItems, item.id));
            }
            else {
                setCollapsedItems(lodash_1.default.union(collapsedItems, [item.id]));
            }
        }
        // Only allow selecting with content
        if (!item.widgetId) {
            return;
        }
        // Do nothing if same id
        if (item.id == selectedId) {
            return;
        }
        // Close all pages
        if (pageStackRef.current) {
            if (!pageStackRef.current.closeAllPages()) {
                return;
            }
        }
        setSelectedId(item.id);
    };
    /** Render an item at a specified depth which starts at 0 */
    var renderItem = function (items, index, depth) {
        var item = items[index];
        // Determine if visible
        if (item.condition && item.condition.expr) {
            var conditionValue = instanceCtx.getContextVarExprValue(item.condition.contextVarId, item.condition.expr);
            if (conditionValue != true) {
                return null;
            }
        }
        var collapsible = item.children.length > 0 && (item.collapse == "startCollapsed" || item.collapse == "startExpanded");
        var labelClasses = ["toc-item-label", "toc-item-label-level" + depth];
        if (item.id === selectedId) {
            labelClasses.push("toc-item-label-selected bg-primary");
        }
        if (item.widgetId || collapsible) {
            labelClasses.push("toc-item-label-selectable");
        }
        // Determine if collapsed
        var collapsed = collapsedItems.includes(item.id);
        return react_2.default.createElement("div", { key: item.id, className: "toc-item toc-item-level" + depth },
            react_2.default.createElement("div", { key: "label", className: labelClasses.join(" "), onClick: handleItemClick.bind(null, item) },
                react_2.default.createElement("div", { key: "expand", className: "chevron" }, collapsible ?
                    (collapsed ? react_2.default.createElement("i", { className: "fas fa-fw fa-caret-right" }) : react_2.default.createElement("i", { className: "fas fa-fw fa-caret-down" }))
                    : react_2.default.createElement("i", { className: "fas fa-fw fa-caret-right", style: { visibility: "hidden" } })),
                item.label != null ?
                    localization_1.localize(item.label, instanceCtx.locale) // Legacy support of label
                    :
                        instanceCtx.renderChildBlock(instanceCtx, item.labelBlock || null)),
            item.children.length > 0 && !collapsed ?
                react_2.default.createElement("div", { key: "children", className: "toc-item-children" }, item.children.map(function (child, index) { return renderItem(item.children, index, depth + 1); }))
                : null);
    };
    var renderLeft = function () {
        return react_2.default.createElement("div", null,
            react_2.default.createElement("div", { key: "header", style: { padding: 5 } }, instanceCtx.renderChildBlock(instanceCtx, blockDef.header)),
            blockDef.items.map(function (item, index) { return renderItem(blockDef.items, index, 0); }),
            react_2.default.createElement("div", { key: "footer", style: { padding: 5 } }, instanceCtx.renderChildBlock(instanceCtx, blockDef.footer)));
    };
    // Get selected item
    var selectedItem = toc_1.iterateItems(blockDef.items).find(function (item) { return item.id === selectedId; });
    var selectedWidgetId = selectedItem ? selectedItem.widgetId : null;
    var renderRight = function () {
        if (!selectedId || !selectedWidgetId || !selectedItem) {
            return null;
        }
        // Get widget
        var widget = instanceCtx.widgetLibrary.widgets[selectedWidgetId];
        // Map context var values
        var mappedContextVarValues = {};
        var _loop_1 = function (innerContextVar) {
            var outerContextVarId = (selectedItem.contextVarMap || {})[innerContextVar.id];
            if (outerContextVarId) {
                // Look up outer context variable
                var outerCV = instanceCtx.contextVars.find(function (cv) { return cv.id == outerContextVarId; });
                if (!outerCV) {
                    throw new Error("Outer context variable not found");
                }
                // Get value 
                var outerCVValue = instanceCtx.contextVarValues[outerCV.id];
                // Add filters if rowset
                if (outerCV.type == "rowset") {
                    outerCVValue = {
                        type: "op",
                        op: "and",
                        table: outerCV.table,
                        exprs: lodash_1.default.compact([outerCVValue].concat(lodash_1.default.map(instanceCtx.getFilters(outerCV.id), function (f) { return f.expr; })))
                    };
                }
                // Inline variables used in rowsets as they may depend on context variables that aren't present in new page
                if (outerCV.type == "rowset") {
                    outerCVValue = new mwater_expressions_1.ExprUtils(instanceCtx.schema, blocks_1.createExprVariables(instanceCtx.contextVars)).inlineVariableValues(outerCVValue, blocks_1.createExprVariableValues(instanceCtx.contextVars, instanceCtx.contextVarValues));
                }
                mappedContextVarValues[innerContextVar.id] = outerCVValue;
            }
            else {
                mappedContextVarValues[innerContextVar.id] = null;
            }
        };
        // For each context variable that the widget needs
        for (var _i = 0, _a = widget.contextVars; _i < _a.length; _i++) {
            var innerContextVar = _a[_i];
            _loop_1(innerContextVar);
        }
        // Include global context variables
        for (var _b = 0, _c = props.instanceCtx.globalContextVars || []; _b < _c.length; _b++) {
            var globalContextVar = _c[_b];
            mappedContextVarValues[globalContextVar.id] = props.instanceCtx.contextVarValues[globalContextVar.id];
        }
        var page = {
            contextVarValues: mappedContextVarValues,
            database: instanceCtx.database,
            type: "normal",
            title: selectedItem.title ? localization_1.localize(selectedItem.title, instanceCtx.locale) : undefined,
            widgetId: selectedWidgetId
        };
        // Create page stack
        return react_2.default.createElement(PageStackDisplay_1.PageStackDisplay, { key: selectedId, baseCtx: props.instanceCtx, initialPage: page, ref: pageStackRef });
    };
    // Render overall structure
    return react_2.default.createElement(SplitPane_1.default, { left: renderLeft(), right: renderRight(), removePadding: blockDef.removePadding || false, theme: blockDef.theme || "light" });
}
exports.default = TOCInstanceComp;
