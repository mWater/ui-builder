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
var LeafBlock_1 = __importDefault(require("../LeafBlock"));
var blocks_1 = require("../blocks");
var ModalWindowComponent_1 = __importDefault(require("react-library/lib/ModalWindowComponent"));
var BlockPlaceholder_1 = __importDefault(require("../BlockPlaceholder"));
var react_1 = require("react");
var SearchBlockInstance_1 = require("./search/SearchBlockInstance");
var TabbedComponent_1 = __importDefault(require("react-library/lib/TabbedComponent"));
var localization_1 = require("../localization");
var uuid = require("uuid");
/** Displays a popup and transforms into any other kind of block */
var AddWizardBlock = /** @class */ (function (_super) {
    __extends(AddWizardBlock, _super);
    function AddWizardBlock(blockDef, createBlock) {
        var _this = _super.call(this, blockDef) || this;
        _this.createBlock = createBlock;
        return _this;
    }
    AddWizardBlock.prototype.validate = function (options) {
        return null;
    };
    AddWizardBlock.prototype.renderDesign = function (props) {
        var _this = this;
        var handleSet = function (newBlockDef) {
            if (newBlockDef) {
                // Duplicate but keep top level id so that selected
                var duplicatedBlockDef_1 = blocks_1.duplicateBlockDef(newBlockDef, _this.createBlock);
                duplicatedBlockDef_1.id = newBlockDef.id;
                props.store.alterBlock(_this.blockDef.id, function (bd) { return duplicatedBlockDef_1; });
            }
            else {
                props.store.alterBlock(_this.blockDef.id, function (bd) { return null; });
            }
        };
        return (React.createElement(ModalWindowComponent_1.default, { isOpen: true, onRequestClose: function () { return handleSet(null); } },
            React.createElement(AddWizardPane, { blockPaletteEntries: props.blockPaletteEntries, createBlock: this.createBlock, schema: props.schema, dataSource: props.dataSource, onSelect: handleSet, contextVars: props.contextVars })));
    };
    AddWizardBlock.prototype.renderInstance = function (props) {
        return React.createElement("div", null);
    };
    return AddWizardBlock;
}(LeafBlock_1.default));
exports.AddWizardBlock = AddWizardBlock;
// Persist default tab
var defaultCurrentTabId = "palette";
/** Pane with search and allowing clicking on a widget to add */
var AddWizardPane = function (props) {
    var _a = react_1.useState(""), search = _a[0], setSearch = _a[1];
    var _b = react_1.useState(defaultCurrentTabId), currentTabId = _b[0], setCurrentTabId = _b[1];
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
        // Find context var of type row
        for (var _i = 0, _a = props.contextVars.filter(function (cv) { return cv.type == "row"; }); _i < _a.length; _i++) {
            var contextVar = _a[_i];
            // Get columns
            var columns = props.schema.getColumns(contextVar.table);
            var _loop_1 = function (column) {
                var createLabeledBlock = function (child) {
                    allEntries.push({
                        title: localization_1.localize(column.name),
                        blockDef: {
                            id: uuid(),
                            type: "labeled",
                            label: column.name,
                            child: child
                        }
                    });
                };
                if (column.type == "text") {
                    createLabeledBlock({
                        id: uuid(),
                        type: "textbox",
                        rowContextVarId: contextVar.id,
                        column: column.id
                    });
                }
                if (column.type == "number") {
                    createLabeledBlock({
                        id: uuid(),
                        type: "numberbox",
                        rowContextVarId: contextVar.id,
                        column: column.id
                    });
                }
                if (column.type == "date" || column.type == "datetime") {
                    createLabeledBlock({
                        id: uuid(),
                        type: "datefield",
                        rowContextVarId: contextVar.id,
                        column: column.id
                    });
                }
                if (column.type === "enum" || column.type === "enumset" || (column.type === "join" && column.join.type === "n-1")) {
                    createLabeledBlock({
                        id: uuid(),
                        type: "dropdown",
                        rowContextVarId: contextVar.id,
                        column: column.id
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
        // Find context var of type row
        for (var _i = 0, _a = props.contextVars.filter(function (cv) { return cv.type == "row"; }); _i < _a.length; _i++) {
            var contextVar = _a[_i];
            // Get columns
            var columns = props.schema.getColumns(contextVar.table);
            for (var _b = 0, columns_2 = columns; _b < columns_2.length; _b++) {
                var column = columns_2[_b];
                allEntries.push({
                    title: localization_1.localize(column.name),
                    blockDef: {
                        id: uuid(),
                        type: "expression",
                        contextVarId: contextVar.id,
                        expr: { type: "field", table: contextVar.table, column: column.id }
                    }
                });
            }
        }
        return allEntries;
    };
    var displayAndFilterEntries = function (entries) {
        // Compute visible entries
        var visibleEntries = entries.filter(function (entry) {
            return search ? entry.title.toLowerCase().includes(search.toLowerCase()) : true;
        });
        return React.createElement("div", null, visibleEntries.map(function (entry) {
            return React.createElement(PaletteItem, { entry: entry, createBlock: props.createBlock, schema: props.schema, dataSource: props.dataSource, onSelect: function () { return props.onSelect(entry.blockDef); } });
        }));
    };
    return React.createElement("div", null,
        React.createElement("div", null,
            React.createElement(SearchBlockInstance_1.SearchControl, { value: search, onChange: setSearch, ref: searchControl, placeholder: "Search widgets..." })),
        React.createElement(TabbedComponent_1.default, { tabId: currentTabId, onTabClick: function (tabId) {
                defaultCurrentTabId = tabId;
                setCurrentTabId(tabId);
            }, tabs: [
                { id: "palette", label: "Palette", elem: displayAndFilterEntries(props.blockPaletteEntries) },
                { id: "controls", label: "Controls", elem: displayAndFilterEntries(getControlEntries()) },
                { id: "expressions", label: "Expressions", elem: displayAndFilterEntries(getExpressionEntries()) }
            ] }));
};
/** Single item in the palette of block choices */
var PaletteItem = /** @class */ (function (_super) {
    __extends(PaletteItem, _super);
    function PaletteItem() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PaletteItem.prototype.renderContents = function () {
        var _this = this;
        if (this.props.entry.elem) {
            return this.props.entry.elem;
        }
        var block = this.props.createBlock(this.props.entry.blockDef);
        return block.renderDesign({
            selectedId: null,
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            locale: "en",
            widgetLibrary: { widgets: {} },
            contextVars: [],
            store: new blocks_1.NullBlockStore(),
            blockPaletteEntries: [],
            renderChildBlock: function (props, childBlockDef) {
                if (childBlockDef) {
                    var childBlock = _this.props.createBlock(childBlockDef);
                    return childBlock.renderDesign(props);
                }
                else {
                    return React.createElement(BlockPlaceholder_1.default, null);
                }
            },
        });
    };
    PaletteItem.prototype.render = function () {
        return (React.createElement("div", { className: "add-wizard-palette-item" },
            React.createElement("div", { className: "add-wizard-palette-item-title" }, this.props.entry.title),
            this.renderContents(),
            React.createElement("div", { onClick: this.props.onSelect, className: "add-wizard-palette-item-cover" })));
    };
    return PaletteItem;
}(React.Component));
