"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const toc_1 = require("./toc");
const blocks_1 = require("../../blocks");
const react_1 = require("react");
const localization_1 = require("../../localization");
const SplitPane_1 = __importDefault(require("./SplitPane"));
const react_2 = __importDefault(require("react"));
const PageStackDisplay_1 = require("../../../PageStackDisplay");
const mwater_expressions_1 = require("mwater-expressions");
/** Instance component for TOC */
function TOCInstanceComp(props) {
    const { blockDef, instanceCtx } = props;
    // Ref to page stack to ensure closed properly
    const pageStackRef = react_1.useRef(null);
    // Select first item with widget by default
    const firstItem = toc_1.iterateItems(blockDef.items).find(item => item.widgetId);
    const [selectedId, setSelectedId] = react_1.useState(firstItem ? firstItem.id : null);
    // Store collapsed state for items. If not listed, is expanded
    const [collapsedItems, setCollapsedItems] = react_1.useState(() => {
        return toc_1.iterateItems(blockDef.items).filter(item => item.collapse == "startCollapsed").map(item => item.id);
    });
    // Select item
    const handleItemClick = (item) => {
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
    const renderItem = (items, index, depth) => {
        const item = items[index];
        // Determine if visible
        if (item.condition && item.condition.expr) {
            const conditionValue = instanceCtx.getContextVarExprValue(item.condition.contextVarId, item.condition.expr);
            if (conditionValue !== true) {
                return null;
            }
        }
        const collapsible = item.children.length > 0 && (item.collapse == "startCollapsed" || item.collapse == "startExpanded");
        const labelClasses = ["toc-item-label", `toc-item-label-level${depth}`];
        if (item.id === selectedId) {
            labelClasses.push(`toc-item-label-selected bg-primary`);
        }
        if (item.widgetId || collapsible) {
            labelClasses.push("toc-item-label-selectable");
        }
        // Determine if collapsed
        const collapsed = collapsedItems.includes(item.id);
        return react_2.default.createElement("div", { key: item.id, className: `toc-item toc-item-level${depth}` },
            react_2.default.createElement("div", { key: "label", className: labelClasses.join(" "), onClick: handleItemClick.bind(null, item) },
                react_2.default.createElement("div", { key: "expand", className: "chevron" }, collapsible ?
                    (collapsed ? react_2.default.createElement("i", { className: "fas fa-fw fa-caret-right" }) : react_2.default.createElement("i", { className: "fas fa-fw fa-caret-down" }))
                    : react_2.default.createElement("i", { className: "fas fa-fw fa-caret-right", style: { visibility: "hidden" } })),
                item.label != null ?
                    localization_1.localize(item.label, instanceCtx.locale) // Legacy support of label
                    :
                        instanceCtx.renderChildBlock(instanceCtx, item.labelBlock || null)),
            item.children.length > 0 && !collapsed ?
                react_2.default.createElement("div", { key: "children", className: "toc-item-children" }, item.children.map((child, index) => renderItem(item.children, index, depth + 1)))
                : null);
    };
    const renderLeft = () => {
        return react_2.default.createElement("div", null,
            react_2.default.createElement("div", { key: "header", style: { padding: 5 } }, instanceCtx.renderChildBlock(instanceCtx, blockDef.header)),
            blockDef.items.map((item, index) => renderItem(blockDef.items, index, 0)),
            react_2.default.createElement("div", { key: "footer", style: { padding: 5 } }, instanceCtx.renderChildBlock(instanceCtx, blockDef.footer)));
    };
    // Get selected item
    const selectedItem = toc_1.iterateItems(blockDef.items).find(item => item.id === selectedId);
    const selectedWidgetId = selectedItem ? selectedItem.widgetId : null;
    const renderRight = () => {
        if (!selectedId || !selectedWidgetId || !selectedItem) {
            return null;
        }
        // Get widget
        const widget = instanceCtx.widgetLibrary.widgets[selectedWidgetId];
        // Map context var values
        const mappedContextVarValues = {};
        // For each context variable that the widget needs
        for (const innerContextVar of widget.contextVars) {
            const outerContextVarId = (selectedItem.contextVarMap || {})[innerContextVar.id];
            if (outerContextVarId) {
                // Look up outer context variable
                const outerCV = instanceCtx.contextVars.find(cv => cv.id == outerContextVarId);
                if (!outerCV) {
                    throw new Error("Outer context variable not found");
                }
                // Get value 
                let outerCVValue = instanceCtx.contextVarValues[outerCV.id];
                // Add filters if rowset
                if (outerCV.type == "rowset") {
                    outerCVValue = {
                        type: "op",
                        op: "and",
                        table: outerCV.table,
                        exprs: lodash_1.default.compact([outerCVValue].concat(lodash_1.default.map(instanceCtx.getFilters(outerCV.id), f => f.expr)))
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
        }
        // Include global context variables
        for (const globalContextVar of props.instanceCtx.globalContextVars || []) {
            mappedContextVarValues[globalContextVar.id] = props.instanceCtx.contextVarValues[globalContextVar.id];
        }
        const page = {
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
