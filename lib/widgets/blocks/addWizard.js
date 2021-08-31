"use strict";
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddWizardBlock = void 0;
const lodash_1 = __importDefault(require("lodash"));
const React = __importStar(require("react"));
const LeafBlock_1 = __importDefault(require("../LeafBlock"));
const blocks_1 = require("../blocks");
const ModalWindowComponent_1 = __importDefault(require("react-library/lib/ModalWindowComponent"));
const BlockPlaceholder_1 = __importDefault(require("../BlockPlaceholder"));
const react_1 = require("react");
const SearchBlockInstance_1 = require("./search/SearchBlockInstance");
const TabbedComponent_1 = __importDefault(require("react-library/lib/TabbedComponent"));
const localization_1 = require("../localization");
const uuid = require("uuid");
const bootstrap_1 = require("react-library/lib/bootstrap");
/** Displays a popup and transforms into any other kind of block */
class AddWizardBlock extends LeafBlock_1.default {
    constructor(blockDef) {
        super(blockDef);
    }
    validate(options) {
        return null;
    }
    renderDesign(props) {
        const handleSet = (newBlockDef) => {
            if (newBlockDef) {
                // Duplicate but keep top level id so that selected
                const duplicatedBlockDef = (0, blocks_1.duplicateBlockDef)(newBlockDef, props.createBlock);
                duplicatedBlockDef.id = this.blockDef.id;
                props.store.alterBlock(this.blockDef.id, (bd) => duplicatedBlockDef);
            }
            else {
                props.store.alterBlock(this.blockDef.id, (bd) => null);
            }
        };
        return (React.createElement(ModalWindowComponent_1.default, { isOpen: true, onRequestClose: () => handleSet(null) },
            React.createElement(AddWizardPane, { designCtx: props, onSelect: handleSet, contextVars: props.contextVars })));
    }
    renderInstance(props) {
        return React.createElement("div", null);
    }
}
exports.AddWizardBlock = AddWizardBlock;
// Persist default tab
var defaultCurrentTabId = "palette";
// Persist expression mode
var defaultExpressionMode = "plain";
// Persist control mode
var defaultControlMode = "labelAbove";
/** Pane with search and allowing clicking on a widget to add */
const AddWizardPane = (props) => {
    const { designCtx } = props;
    const [search, setSearch] = (0, react_1.useState)("");
    const [currentTabId, setCurrentTabId] = (0, react_1.useState)(defaultCurrentTabId);
    const [expressionMode, setExpressionMode] = (0, react_1.useState)(defaultExpressionMode);
    const [controlMode, setControlMode] = (0, react_1.useState)(defaultControlMode);
    // Focus on load
    const searchControl = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        if (searchControl.current) {
            searchControl.current.focus();
        }
    }, []);
    /** Get entries that are controls based off of columns of first row context variable */
    const getControlEntries = () => {
        const allEntries = [];
        const wrapBlockDef = (label, blockDef) => {
            if (controlMode == "plain") {
                return blockDef;
            }
            else if (controlMode == "labelAbove") {
                return {
                    id: uuid(),
                    type: "labeled",
                    label: label,
                    child: blockDef
                };
            }
            else if (controlMode == "labelBefore") {
                return {
                    id: uuid(),
                    type: "labeled",
                    label: appendStr(label, ":"),
                    child: blockDef,
                    layout: "horizontal"
                };
            }
            throw new Error("Not implemented");
        };
        // Find context var of type row
        for (const contextVar of props.contextVars.filter(cv => cv.type == "row").reverse()) {
            // Get columns
            const columns = designCtx.schema.getColumns(contextVar.table);
            for (const column of columns) {
                const addBlock = (child) => {
                    allEntries.push({
                        title: (0, localization_1.localize)(column.name) || "",
                        blockDef: wrapBlockDef(column.name, child)
                    });
                };
                if (column.type == "text") {
                    addBlock({
                        id: uuid(),
                        type: "textbox",
                        rowContextVarId: contextVar.id,
                        column: column.id,
                        required: column.required
                    });
                }
                if (column.type == "number") {
                    addBlock({
                        id: uuid(),
                        type: "numberbox",
                        decimal: true,
                        rowContextVarId: contextVar.id,
                        column: column.id,
                        required: column.required
                    });
                }
                if (column.type == "date" || column.type == "datetime") {
                    addBlock({
                        id: uuid(),
                        type: "datefield",
                        rowContextVarId: contextVar.id,
                        column: column.id,
                        required: column.required
                    });
                }
                if (column.type === "enum"
                    || column.type === "enumset"
                    || column.type === "id"
                    || column.type === "id[]"
                    || column.type === "boolean") {
                    addBlock({
                        id: uuid(),
                        type: "dropdown",
                        rowContextVarId: contextVar.id,
                        column: column.id,
                        required: column.required
                    });
                }
            }
        }
        return allEntries;
    };
    /** Get entries that are expressions based off of columns of first row context variable */
    const getExpressionEntries = () => {
        const allEntries = [];
        const wrapBlockDef = (label, blockDef) => {
            if (expressionMode == "plain") {
                return blockDef;
            }
            else if (expressionMode == "labelAbove") {
                return {
                    id: uuid(),
                    type: "labeled",
                    label: label,
                    child: blockDef
                };
            }
            else if (expressionMode == "labelBefore") {
                return {
                    id: uuid(),
                    type: "labeled",
                    label: appendStr(label, ":"),
                    child: blockDef,
                    layout: "horizontal"
                };
            }
            throw new Error("Not implemented");
        };
        // Find context var of type row
        for (const contextVar of props.contextVars.filter(cv => cv.type == "row").reverse()) {
            // Get columns
            const columns = designCtx.schema.getColumns(contextVar.table);
            for (const column of columns) {
                // Skip id columns
                if (column.type == "id" || column.type == "id[]") {
                    continue;
                }
                allEntries.push({
                    title: (0, localization_1.localize)(column.name) || "",
                    blockDef: wrapBlockDef(column.name, {
                        id: uuid(),
                        type: "expression",
                        contextVarId: contextVar.id,
                        expr: { type: "field", table: contextVar.table, column: column.id },
                        format: column.type == "number" ? "," : null
                    })
                });
            }
        }
        return allEntries;
    };
    /** Get entries that are other embedded widgets */
    const getWidgetEntries = () => {
        const allEntries = [];
        for (const widgetId in props.designCtx.widgetLibrary.widgets) {
            const widget = props.designCtx.widgetLibrary.widgets[widgetId];
            // TODO Skip self 
            allEntries.push({
                title: widget.name,
                subtitle: widget.description,
                blockDef: {
                    id: uuid(),
                    type: "widget",
                    widgetId: widgetId,
                    contextVarMap: {}
                },
                elem: React.createElement("div", null)
            });
        }
        return allEntries;
    };
    const displayAndFilterEntries = (entries) => {
        // Compute visible entries
        const visibleEntries = entries.filter(entry => {
            return search ? entry.title.toLowerCase().includes(search.toLowerCase()) : true;
        });
        return React.createElement("div", null, visibleEntries.map((entry, index) => {
            return React.createElement(PaletteItem, { entry: entry, key: index, designCtx: designCtx, onSelect: () => props.onSelect(typeof entry.blockDef == "function" ? entry.blockDef(props.contextVars) : entry.blockDef) });
        }));
    };
    const renderExpressionOptions = () => {
        return React.createElement("div", { style: { float: "right", paddingRight: 10 } },
            React.createElement(bootstrap_1.Toggle, { value: expressionMode, onChange: (em) => {
                    setExpressionMode(em);
                    defaultExpressionMode = em;
                }, size: "sm", options: [
                    { value: "plain", label: "Plain" },
                    { value: "labelAbove", label: "Label Above" },
                    { value: "labelBefore", label: "Label Before" }
                ] }));
    };
    const renderControlOptions = () => {
        return React.createElement("div", { style: { float: "right", paddingRight: 10 } },
            React.createElement(bootstrap_1.Toggle, { value: controlMode, onChange: (em) => {
                    setControlMode(em);
                    defaultControlMode = em;
                }, size: "sm", options: [
                    { value: "plain", label: "Plain" },
                    { value: "labelAbove", label: "Label Above" },
                    { value: "labelBefore", label: "Label Before" }
                ] }));
    };
    return React.createElement("div", null,
        React.createElement("div", null,
            React.createElement(SearchBlockInstance_1.SearchControl, { value: search, onChange: setSearch, ref: searchControl, placeholder: "Search widgets..." }),
            currentTabId == "expressions" ? renderExpressionOptions() : null,
            currentTabId == "controls" ? renderControlOptions() : null),
        React.createElement(TabbedComponent_1.default, { tabId: currentTabId, onTabClick: tabId => {
                defaultCurrentTabId = tabId;
                setCurrentTabId(tabId);
            }, tabs: [
                { id: "palette", label: "Palette", elem: displayAndFilterEntries(designCtx.blockPaletteEntries) },
                { id: "controls", label: "Controls", elem: displayAndFilterEntries(getControlEntries()) },
                { id: "expressions", label: "Expressions", elem: displayAndFilterEntries(getExpressionEntries()) },
                { id: "widgets", label: "Widgets", elem: displayAndFilterEntries(getWidgetEntries()) }
            ] }));
};
/** Single item in the palette of block choices */
class PaletteItem extends React.Component {
    renderContents() {
        const designCtx = this.props.designCtx;
        if (this.props.entry.elem) {
            return this.props.entry.elem;
        }
        const entry = this.props.entry;
        const block = designCtx.createBlock(typeof entry.blockDef == "function" ? entry.blockDef(designCtx.contextVars) : entry.blockDef);
        return block.renderDesign(Object.assign(Object.assign({}, designCtx), { selectedId: null, contextVars: [], store: new blocks_1.NullBlockStore(), blockPaletteEntries: [], renderChildBlock: (props, childBlockDef) => {
                if (childBlockDef) {
                    const childBlock = designCtx.createBlock(childBlockDef);
                    return childBlock.renderDesign(props);
                }
                else {
                    return React.createElement(BlockPlaceholder_1.default, null);
                }
            } }));
    }
    render() {
        return (React.createElement("div", { className: "add-wizard-palette-item" },
            React.createElement("div", { className: "add-wizard-palette-item-title" }, this.props.entry.title),
            this.renderContents(),
            React.createElement("div", { className: "add-wizard-palette-item-subtitle" }, this.props.entry.subtitle),
            React.createElement("div", { onClick: this.props.onSelect, className: "add-wizard-palette-item-cover" })));
    }
}
/** Appends to a localized string */
function appendStr(str, append) {
    return lodash_1.default.mapValues(str, (v, k) => k == "_base" ? v : v + append);
}
