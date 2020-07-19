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
var lodash_1 = __importDefault(require("lodash"));
var BlockWrapper_1 = __importDefault(require("./BlockWrapper"));
var React = __importStar(require("react"));
var blocks_1 = require("../widgets/blocks");
var BlockPlaceholder_1 = __importDefault(require("../widgets/BlockPlaceholder"));
require("./WidgetDesigner.css");
var bootstrap_1 = require("react-library/lib/bootstrap");
var WidgetEditor_1 = require("./WidgetEditor");
var PageStackDisplay_1 = require("../PageStackDisplay");
var ErrorBoundary_1 = __importDefault(require("./ErrorBoundary"));
var VirtualDatabase_1 = __importDefault(require("../database/VirtualDatabase"));
var AddWizardPalette_1 = __importDefault(require("./AddWizardPalette"));
var ClipboardPalette_1 = __importDefault(require("./ClipboardPalette"));
var Mode;
(function (Mode) {
    Mode[Mode["Design"] = 0] = "Design";
    Mode[Mode["Preview"] = 1] = "Preview";
})(Mode || (Mode = {}));
/** Design mode for a single widget */
var WidgetDesigner = /** @class */ (function (_super) {
    __extends(WidgetDesigner, _super);
    function WidgetDesigner(props) {
        var _this = _super.call(this, props) || this;
        _this.handleSelect = function (blockId) {
            _this.setState({ selectedBlockId: blockId });
        };
        /** Handle change including undo stack  */
        _this.handleWidgetDefChange = function (widgetDef) {
            _this.setState({ undoStack: _this.state.undoStack.concat([_this.props.widgetDef]), redoStack: [] });
            _this.props.onWidgetDefChange(widgetDef);
        };
        _this.handleUndo = function () {
            if (_this.state.undoStack.length === 0) {
                return;
            }
            var undoValue = lodash_1.default.last(_this.state.undoStack);
            _this.setState({ undoStack: lodash_1.default.initial(_this.state.undoStack), redoStack: _this.state.redoStack.concat([_this.props.widgetDef]) });
            _this.props.onWidgetDefChange(undoValue);
        };
        _this.handleRedo = function () {
            if (_this.state.redoStack.length === 0) {
                return;
            }
            var redoValue = lodash_1.default.last(_this.state.redoStack);
            _this.setState({ redoStack: lodash_1.default.initial(_this.state.redoStack), undoStack: _this.state.undoStack.concat([_this.props.widgetDef]) });
            _this.props.onWidgetDefChange(redoValue);
        };
        // Set the widget block
        _this.handleBlockDefChange = function (blockDef) {
            // Canonicalize
            if (blockDef) {
                blockDef = _this.props.baseCtx.createBlock(blockDef).process(_this.props.baseCtx.createBlock, function (b) {
                    return _this.props.baseCtx.createBlock(b).canonicalize();
                });
            }
            _this.handleWidgetDefChange(__assign(__assign({}, _this.props.widgetDef), { blockDef: blockDef }));
        };
        _this.handleUnselect = function () { _this.setState({ selectedBlockId: null }); };
        _this.handleRemoveBlock = function (blockId) {
            var block = _this.props.baseCtx.createBlock(_this.props.widgetDef.blockDef);
            _this.handleBlockDefChange(block.process(_this.props.baseCtx.createBlock, function (b) { return (b.id === blockId) ? null : b; }));
        };
        _this.handleSetMode = function (mode) {
            if (!_this.props.widgetDef.blockDef) {
                return;
            }
            // Verify before allowing preview
            if (mode === Mode.Preview) {
                var contextVars = (_this.props.baseCtx.globalContextVars || [])
                    .concat(_this.props.widgetDef.contextVars)
                    .concat(_this.props.widgetDef.privateContextVars || []);
                for (var _i = 0, _a = blocks_1.getBlockTree(_this.props.widgetDef.blockDef, _this.props.baseCtx.createBlock, contextVars); _i < _a.length; _i++) {
                    var childBlock = _a[_i];
                    var block = _this.props.baseCtx.createBlock(childBlock.blockDef);
                    // Use context vars for the block
                    var designCtx = __assign(__assign({}, _this.createDesignCtx()), { contextVars: childBlock.contextVars });
                    if (block.validate(designCtx)) {
                        alert("Correct errors first");
                        return;
                    }
                }
            }
            _this.setState({ mode: mode });
        };
        _this.state = {
            mode: Mode.Design,
            selectedBlockId: null,
            undoStack: [],
            redoStack: []
        };
        return _this;
    }
    WidgetDesigner.prototype.createBlockStore = function () {
        var _this = this;
        var alterBlock = function (blockId, action, removeBlockId) {
            var newBlockDef;
            var block = _this.props.baseCtx.createBlock(_this.props.widgetDef.blockDef);
            // Do not allow self-removal in drag
            if (removeBlockId === _this.props.widgetDef.blockDef.id) {
                return;
            }
            // Remove source block
            if (removeBlockId) {
                newBlockDef = block.process(_this.props.baseCtx.createBlock, function (b) { return (b.id === removeBlockId) ? null : b; });
            }
            else {
                newBlockDef = block.blockDef;
            }
            // If nothing left
            if (!newBlockDef) {
                _this.handleBlockDefChange(null);
                return;
            }
            newBlockDef = _this.props.baseCtx.createBlock(newBlockDef).process(_this.props.baseCtx.createBlock, function (b) { return (b.id === blockId) ? action(b) : b; });
            _this.handleBlockDefChange(newBlockDef);
        };
        var replaceBlock = function (blockDef) {
            alterBlock(blockDef.id, function () { return blockDef; });
        };
        return { alterBlock: alterBlock, replaceBlock: replaceBlock };
    };
    WidgetDesigner.prototype.createDesignCtx = function () {
        var _this = this;
        // Create block store
        var store = this.createBlockStore();
        var widgetContextVars = (this.props.baseCtx.globalContextVars || [])
            .concat(this.props.widgetDef.contextVars)
            .concat(this.props.widgetDef.privateContextVars || []);
        var designCtx = __assign(__assign({}, this.props.baseCtx), { dataSource: this.props.dataSource, selectedId: this.state.selectedBlockId, contextVars: widgetContextVars, store: store, blockPaletteEntries: this.props.blockPaletteEntries, 
            // Will be set below
            renderChildBlock: {} });
        // Create renderChildBlock
        var renderChildBlock = function (childDesignCtx, childBlockDef, onSet) {
            if (childBlockDef) {
                var childBlock = _this.props.baseCtx.createBlock(childBlockDef);
                var validationError = childBlock.validate(childDesignCtx);
                // Gets the label of the block which is displayed on hover
                var label = childBlock.getLabel();
                return (React.createElement(BlockWrapper_1.default, { blockDef: childBlockDef, selectedBlockId: _this.state.selectedBlockId, onSelect: _this.handleSelect.bind(null, childBlockDef.id), onRemove: _this.handleRemoveBlock.bind(null, childBlockDef.id), store: store, validationError: validationError, label: label }, childBlock.renderDesign(childDesignCtx)));
            }
            else {
                return React.createElement(BlockPlaceholder_1.default, { onSet: onSet });
            }
        };
        designCtx.renderChildBlock = renderChildBlock;
        return designCtx;
    };
    WidgetDesigner.prototype.renderDesignBlock = function () {
        // If there is an existing block, render it
        if (this.props.widgetDef.blockDef) {
            var block = this.props.baseCtx.createBlock(this.props.widgetDef.blockDef);
            var designCtx = this.createDesignCtx();
            return designCtx.renderChildBlock(designCtx, block.blockDef, this.handleBlockDefChange);
        }
        else {
            // Create placeholder
            return React.createElement(BlockPlaceholder_1.default, { onSet: this.handleBlockDefChange });
        }
    };
    WidgetDesigner.prototype.renderEditor = function () {
        if (this.props.widgetDef.blockDef && this.state.selectedBlockId) {
            // Find selected block ancestry
            var contextVars = (this.props.baseCtx.globalContextVars || [])
                .concat(this.props.widgetDef.contextVars)
                .concat(this.props.widgetDef.privateContextVars || []);
            var selectedBlockAncestry = blocks_1.findBlockAncestry(this.props.widgetDef.blockDef, this.props.baseCtx.createBlock, contextVars, this.state.selectedBlockId);
            // Create props
            if (selectedBlockAncestry) {
                var selectedChildBlock = selectedBlockAncestry[selectedBlockAncestry.length - 1];
                // Create block
                var selectedBlock = this.props.baseCtx.createBlock(selectedChildBlock.blockDef);
                // Use context variables for the block
                var designCtx = __assign(__assign({}, this.createDesignCtx()), { contextVars: selectedChildBlock.contextVars });
                // Check for errors
                var validationError = selectedBlock.validate(designCtx);
                return (React.createElement("div", { key: "editor", className: "widget-designer-editor" },
                    validationError ?
                        React.createElement("div", { className: "text-danger" },
                            React.createElement("i", { className: "fa fa-exclamation-circle" }),
                            " ",
                            validationError)
                        : null,
                    selectedBlock.renderEditor(designCtx)));
            }
        }
        return (React.createElement("div", { key: "editor", className: "widget-designer-editor" },
            React.createElement(WidgetEditor_1.WidgetEditor, { widgetDef: this.props.widgetDef, onWidgetDefChange: this.handleWidgetDefChange, designCtx: this.createDesignCtx() })));
    };
    WidgetDesigner.prototype.renderDesign = function () {
        return [
            (React.createElement("div", { key: "designer", className: "widget-designer-block", onClick: this.handleUnselect }, this.renderDesignBlock())),
            this.renderEditor()
        ];
    };
    /** Render a preview of the widget in a page */
    WidgetDesigner.prototype.renderPreview = function () {
        if (!this.props.widgetDef.blockDef) {
            return null;
        }
        var database = this.props.baseCtx.database;
        var virtualizeDatabase = false;
        if (virtualizeDatabase) {
            // Make non-live TODO needed? Could make big queries for counts/sums if mutated
            database = new VirtualDatabase_1.default(database, this.props.baseCtx.schema, this.props.baseCtx.locale);
        }
        // Create normal page to display
        var page = {
            type: "normal",
            contextVarValues: this.props.widgetDef.contextVarPreviewValues,
            database: database,
            widgetId: this.props.widgetDef.id
        };
        var pageElem = React.createElement(PageStackDisplay_1.PageStackDisplay, { baseCtx: this.props.baseCtx, initialPage: page });
        return [
            (React.createElement("div", { key: "preview", className: "widget-preview-block" },
                React.createElement(ErrorBoundary_1.default, null, pageElem))),
            (React.createElement("div", { key: "editor", className: "widget-designer-editor" }))
        ];
    };
    WidgetDesigner.prototype.render = function () {
        return (React.createElement("div", { className: "widget-designer" },
            React.createElement("div", { className: "widget-designer-header" },
                React.createElement(AddWizardPalette_1.default, { onSelect: this.handleSelect }),
                React.createElement("div", { style: { float: "right" } },
                    React.createElement(ClipboardPalette_1.default, { onSelect: this.handleSelect, createBlock: this.props.baseCtx.createBlock }),
                    React.createElement("button", { type: "button", className: "btn btn-link btn-sm", onClick: this.handleUndo, disabled: this.state.undoStack.length === 0 },
                        React.createElement("i", { className: "fa fa-undo" }),
                        " Undo"),
                    React.createElement("button", { type: "button", className: "btn btn-link btn-sm", onClick: this.handleRedo, disabled: this.state.redoStack.length === 0 },
                        React.createElement("i", { className: "fa fa-repeat" }),
                        " Redo"),
                    React.createElement(bootstrap_1.Toggle, { value: this.state.mode, options: [
                            { value: Mode.Design, label: [React.createElement("i", { key: "design", className: "fa fa-pencil" }), " Design"] },
                            { value: Mode.Preview, label: [React.createElement("i", { key: "design", className: "fa fa-play" }), " Preview"] }
                        ], onChange: this.handleSetMode, size: "sm" }))),
            this.state.mode === Mode.Design ? this.renderDesign() : this.renderPreview()));
    };
    return WidgetDesigner;
}(React.Component));
exports.default = WidgetDesigner;
