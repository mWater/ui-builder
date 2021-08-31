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
const FillDownwardComponent_1 = __importDefault(require("react-library/lib/FillDownwardComponent"));
const hooks_1 = require("../../../hooks");
/** Instance component for TOC */
function TOCInstanceComp(props) {
    const { blockDef, instanceCtx } = props;
    // Store overall page width and update it
    const pageWidth = (0, hooks_1.usePageWidth)();
    // Ref to page stack to ensure closed properly
    const pageStackRef = (0, react_1.useRef)(null);
    const allItems = (0, toc_1.iterateItems)(blockDef.items);
    // Select first item with widget by default
    const firstItem = allItems.find(item => item.widgetId);
    const [selectedId, setSelectedId] = (0, react_1.useState)(firstItem ? firstItem.id : null);
    // Store collapsed state for items. If not listed, is expanded
    const [collapsedItems, setCollapsedItems] = (0, react_1.useState)(() => {
        return allItems
            .filter(item => item.collapse == "startCollapsed" || (item.collapse == "startExpanded" && item.collapseWidth != null && pageWidth <= item.collapseWidth))
            .map(item => item.id);
    });
    // When TOC selector is open in collapsed mode
    const [selectorOpen, setSelectorOpen] = (0, react_1.useState)(false);
    /** Only toggle item */
    function handleItemToggle(item, ev) {
        ev.stopPropagation();
        // Toggle collapse
        if (item.children.length > 0 && (item.collapse == "startCollapsed" || item.collapse == "startExpanded")) {
            if (collapsedItems.includes(item.id)) {
                setCollapsedItems(lodash_1.default.without(collapsedItems, item.id));
            }
            else {
                setCollapsedItems(lodash_1.default.union(collapsedItems, [item.id]));
            }
        }
    }
    // Select item
    function handleItemClick(item, ev) {
        ev.stopPropagation();
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
        setSelectorOpen(false);
    }
    function renderItem(item) {
        // Legacy support of label
        if (item.label != null) {
            return react_2.default.createElement("div", null, (0, localization_1.localize)(item.label, instanceCtx.locale));
        }
        return instanceCtx.renderChildBlock(instanceCtx, item.labelBlock || null);
    }
    /** Render an item at a specified depth which starts at 0 with children, taking into account visibility */
    const renderItemTree = (items, index, depth) => {
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
                react_2.default.createElement("div", { key: "expand", className: "chevron", onClick: handleItemToggle.bind(null, item) }, collapsible ?
                    (collapsed ? react_2.default.createElement("i", { className: "fas fa-fw fa-caret-right" }) : react_2.default.createElement("i", { className: "fas fa-fw fa-caret-down" }))
                    : react_2.default.createElement("i", { className: "fas fa-fw fa-caret-right", style: { visibility: "hidden" } })),
                renderItem(item)),
            item.children.length > 0 && !collapsed ?
                react_2.default.createElement("div", { key: "children", className: "toc-item-children" }, item.children.map((child, index) => renderItemTree(item.children, index, depth + 1)))
                : null);
    };
    function renderLeft() {
        return react_2.default.createElement("div", null,
            react_2.default.createElement("div", { key: "header", style: { padding: 5 } }, instanceCtx.renderChildBlock(instanceCtx, blockDef.header)),
            blockDef.items.map((item, index) => renderItemTree(blockDef.items, index, 0)),
            react_2.default.createElement("div", { key: "footer", style: { padding: 5 } }, instanceCtx.renderChildBlock(instanceCtx, blockDef.footer)));
    }
    // Get selected item
    const selectedItem = (0, toc_1.iterateItems)(blockDef.items).find(item => item.id === selectedId);
    const selectedWidgetId = selectedItem ? selectedItem.widgetId : null;
    /** Render the right pane (or only pane if collapsed)
     * @param noTitle do not render title even if item has one
     */
    function renderRight(noTitle) {
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
                    outerCVValue = new mwater_expressions_1.ExprUtils(instanceCtx.schema, (0, blocks_1.createExprVariables)(instanceCtx.contextVars)).inlineVariableValues(outerCVValue, (0, blocks_1.createExprVariableValues)(instanceCtx.contextVars, instanceCtx.contextVarValues));
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
            title: !noTitle && selectedItem.title ? (0, localization_1.localize)(selectedItem.title, instanceCtx.locale) : undefined,
            widgetId: selectedWidgetId
        };
        // Create page stack
        return react_2.default.createElement(PageStackDisplay_1.PageStackDisplay, { key: selectedId, baseCtx: props.instanceCtx, initialPage: page, ref: pageStackRef });
    }
    // If below minimum, use collapsed view
    if (blockDef.collapseWidth != null && pageWidth <= blockDef.collapseWidth) {
        if (selectedId == null) {
            return react_2.default.createElement("div", null);
        }
        const selectedItem = allItems.find(item => item.id == selectedId);
        if (!selectedItem) {
            return react_2.default.createElement("div", null);
        }
        const title = selectedItem.title ? (0, localization_1.localize)(selectedItem.title, instanceCtx.locale) : undefined;
        return react_2.default.createElement("div", { onClick: () => setSelectorOpen(false) },
            react_2.default.createElement(FillDownwardComponent_1.default, null,
                react_2.default.createElement("div", { key: "header" },
                    react_2.default.createElement("div", { key: "selected", onClick: ev => {
                            ev.stopPropagation();
                            setSelectorOpen(v => !v);
                        }, className: `toc-select-button${selectorOpen ? " open" : ""}` },
                        react_2.default.createElement("i", { className: "fa fa-bars" })),
                    " ",
                    react_2.default.createElement("div", { className: "toc-select-title" }, title),
                    selectorOpen ?
                        react_2.default.createElement("div", { className: "toc-selector" }, renderLeft())
                        : null),
                renderRight(true)));
    }
    // Render overall structure
    return react_2.default.createElement(SplitPane_1.default, { left: renderLeft(), right: renderRight(false), theme: blockDef.theme || "light" });
}
exports.default = TOCInstanceComp;
