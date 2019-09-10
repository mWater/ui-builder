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
var LeafBlock_1 = __importDefault(require("../LeafBlock"));
var blocks_1 = require("../blocks");
var ModalWindowComponent_1 = __importDefault(require("react-library/lib/ModalWindowComponent"));
var BlockPlaceholder_1 = __importDefault(require("../BlockPlaceholder"));
var react_1 = require("react");
var SearchBlockInstance_1 = require("./search/SearchBlockInstance");
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
                props.store.alterBlock(_this.blockDef.id, function (bd) {
                    return __assign(__assign({}, newBlockDef), { id: _this.blockDef.id });
                });
            }
            else {
                props.store.alterBlock(_this.blockDef.id, function (bd) { return null; });
            }
        };
        return (React.createElement(ModalWindowComponent_1.default, { isOpen: true, onRequestClose: function () { return handleSet(null); } },
            React.createElement(AddWizardPane, { blockPaletteEntries: props.blockPaletteEntries, createBlock: this.createBlock, schema: props.schema, dataSource: props.dataSource, onSelect: handleSet })));
    };
    AddWizardBlock.prototype.renderInstance = function (props) {
        return React.createElement("div", null);
    };
    return AddWizardBlock;
}(LeafBlock_1.default));
exports.AddWizardBlock = AddWizardBlock;
/** Pane with search and allowing clicking on a widget to add */
var AddWizardPane = function (props) {
    var _a = react_1.useState(""), search = _a[0], setSearch = _a[1];
    // Focus on load
    var searchControl = react_1.useRef(null);
    react_1.useEffect(function () {
        if (searchControl.current) {
            searchControl.current.focus();
        }
    }, []);
    // Compute visible entries
    var visibleEntries = props.blockPaletteEntries.filter(function (entry) {
        if (!search) {
            return true;
        }
        return entry.title.toLowerCase().includes(search.toLowerCase());
    });
    return React.createElement("div", null,
        React.createElement("div", null,
            React.createElement(SearchBlockInstance_1.SearchControl, { value: search, onChange: setSearch, ref: searchControl, placeholder: "Search widgets..." })),
        visibleEntries.map(function (entry) {
            return React.createElement(PaletteItem, { entry: entry, createBlock: props.createBlock, schema: props.schema, dataSource: props.dataSource, onSelect: function () { return props.onSelect(entry.blockDef); } });
        }));
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