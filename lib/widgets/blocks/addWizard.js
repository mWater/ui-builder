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
exports.AddWizardBlock = void 0;
var lodash_1 = __importDefault(require("lodash"));
var React = __importStar(require("react"));
var LeafBlock_1 = __importDefault(require("../LeafBlock"));
var blocks_1 = require("../blocks");
var ModalWindowComponent_1 = __importDefault(require("react-library/lib/ModalWindowComponent"));
var BlockPlaceholder_1 = __importDefault(require("../BlockPlaceholder"));
var react_1 = require("react");
var SearchBlockInstance_1 = require("./search/SearchBlockInstance");
var TabbedComponent_1 = __importDefault(require("react-library/lib/TabbedComponent"));
var localization_1 = require("../localization");
var uuid = require("uuid");
var bootstrap_1 = require("react-library/lib/bootstrap");
/** Displays a popup and transforms into any other kind of block */
var AddWizardBlock = /** @class */ (function (_super) {
    __extends(AddWizardBlock, _super);
    function AddWizardBlock(blockDef) {
        return _super.call(this, blockDef) || this;
    }
    AddWizardBlock.prototype.validate = function (options) {
        return null;
    };
    AddWizardBlock.prototype.renderDesign = function (props) {
        var _this = this;
        var handleSet = function (newBlockDef) {
            if (newBlockDef) {
                // Duplicate but keep top level id so that selected
                var duplicatedBlockDef_1 = blocks_1.duplicateBlockDef(newBlockDef, props.createBlock);
                duplicatedBlockDef_1.id = _this.blockDef.id;
                props.store.alterBlock(_this.blockDef.id, function (bd) { return duplicatedBlockDef_1; });
            }
            else {
                props.store.alterBlock(_this.blockDef.id, function (bd) { return null; });
            }
        };
        return (React.createElement(ModalWindowComponent_1.default, { isOpen: true, onRequestClose: function () { return handleSet(null); } },
            React.createElement(AddWizardPane, { designCtx: props, onSelect: handleSet, contextVars: props.contextVars })));
    };
    AddWizardBlock.prototype.renderInstance = function (props) {
        return React.createElement("div", null);
    };
    return AddWizardBlock;
}(LeafBlock_1.default));
exports.AddWizardBlock = AddWizardBlock;
// Persist default tab
var defaultCurrentTabId = "palette";
// Persist expression mode
var defaultExpressionMode = "plain";
// Persist control mode
var defaultControlMode = "labelAbove";
/** Pane with search and allowing clicking on a widget to add */
var AddWizardPane = function (props) {
    var designCtx = props.designCtx;
    var _a = react_1.useState(""), search = _a[0], setSearch = _a[1];
    var _b = react_1.useState(defaultCurrentTabId), currentTabId = _b[0], setCurrentTabId = _b[1];
    var _c = react_1.useState(defaultExpressionMode), expressionMode = _c[0], setExpressionMode = _c[1];
    var _d = react_1.useState(defaultControlMode), controlMode = _d[0], setControlMode = _d[1];
    // Focus on load
    var searchControl = react_1.useRef(null);
    react_1.useEffect(function () {
        if (searchControl.current) {
            searchControl.current.focus();
        }
    }, []);
    /** Get entries that are controls based off of columns of first row context variable */
    var getControlEntries = function () {
        var allEntries = [];
        var wrapBlockDef = function (label, blockDef) {
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
        for (var _i = 0, _a = props.contextVars.filter(function (cv) { return cv.type == "row"; }); _i < _a.length; _i++) {
            var contextVar = _a[_i];
            // Get columns
            var columns = designCtx.schema.getColumns(contextVar.table);
            var _loop_1 = function (column) {
                var addBlock = function (child) {
                    allEntries.push({
                        title: localization_1.localize(column.name) || "",
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
            };
            for (var _b = 0, columns_1 = columns; _b < columns_1.length; _b++) {
                var column = columns_1[_b];
                _loop_1(column);
            }
        }
        return allEntries;
    };
    /** Get entries that are expressions based off of columns of first row context variable */
    var getExpressionEntries = function () {
        var allEntries = [];
        var wrapBlockDef = function (label, blockDef) {
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
        for (var _i = 0, _a = props.contextVars.filter(function (cv) { return cv.type == "row"; }); _i < _a.length; _i++) {
            var contextVar = _a[_i];
            // Get columns
            var columns = designCtx.schema.getColumns(contextVar.table);
            for (var _b = 0, columns_2 = columns; _b < columns_2.length; _b++) {
                var column = columns_2[_b];
                // Skip id columns
                if (column.type == "id") {
                    continue;
                }
                allEntries.push({
                    title: localization_1.localize(column.name) || "",
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
    var getWidgetEntries = function () {
        var allEntries = [];
        for (var widgetId in props.designCtx.widgetLibrary.widgets) {
            var widget = props.designCtx.widgetLibrary.widgets[widgetId];
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
    var displayAndFilterEntries = function (entries) {
        // Compute visible entries
        var visibleEntries = entries.filter(function (entry) {
            return search ? entry.title.toLowerCase().includes(search.toLowerCase()) : true;
        });
        return React.createElement("div", null, visibleEntries.map(function (entry, index) {
            return React.createElement(PaletteItem, { entry: entry, key: index, designCtx: designCtx, onSelect: function () { return props.onSelect(typeof entry.blockDef == "function" ? entry.blockDef(props.contextVars) : entry.blockDef); } });
        }));
    };
    var renderExpressionOptions = function () {
        return React.createElement("div", { style: { float: "right", paddingRight: 10 } },
            React.createElement(bootstrap_1.Toggle, { value: expressionMode, onChange: function (em) {
                    setExpressionMode(em);
                    defaultExpressionMode = em;
                }, size: "sm", options: [
                    { value: "plain", label: "Plain" },
                    { value: "labelAbove", label: "Label Above" },
                    { value: "labelBefore", label: "Label Before" }
                ] }));
    };
    var renderControlOptions = function () {
        return React.createElement("div", { style: { float: "right", paddingRight: 10 } },
            React.createElement(bootstrap_1.Toggle, { value: controlMode, onChange: function (em) {
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
        React.createElement(TabbedComponent_1.default, { tabId: currentTabId, onTabClick: function (tabId) {
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
var PaletteItem = /** @class */ (function (_super) {
    __extends(PaletteItem, _super);
    function PaletteItem() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PaletteItem.prototype.renderContents = function () {
        var designCtx = this.props.designCtx;
        if (this.props.entry.elem) {
            return this.props.entry.elem;
        }
        var entry = this.props.entry;
        var block = designCtx.createBlock(typeof entry.blockDef == "function" ? entry.blockDef(designCtx.contextVars) : entry.blockDef);
        return block.renderDesign(__assign(__assign({}, designCtx), { selectedId: null, contextVars: [], store: new blocks_1.NullBlockStore(), blockPaletteEntries: [], renderChildBlock: function (props, childBlockDef) {
                if (childBlockDef) {
                    var childBlock = designCtx.createBlock(childBlockDef);
                    return childBlock.renderDesign(props);
                }
                else {
                    return React.createElement(BlockPlaceholder_1.default, null);
                }
            } }));
    };
    PaletteItem.prototype.render = function () {
        return (React.createElement("div", { className: "add-wizard-palette-item" },
            React.createElement("div", { className: "add-wizard-palette-item-title" }, this.props.entry.title),
            this.renderContents(),
            React.createElement("div", { className: "add-wizard-palette-item-subtitle" }, this.props.entry.subtitle),
            React.createElement("div", { onClick: this.props.onSelect, className: "add-wizard-palette-item-cover" })));
    };
    return PaletteItem;
}(React.Component));
/** Appends to a localized string */
function appendStr(str, append) {
    return lodash_1.default.mapValues(str, function (v, k) { return k == "_base" ? v : v + append; });
}
