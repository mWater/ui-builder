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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var BlockWrapper_1 = __importDefault(require("./BlockWrapper"));
var React = __importStar(require("react"));
var blocks_1 = require("../widgets/blocks");
var BlockPlaceholder_1 = __importDefault(require("../widgets/BlockPlaceholder"));
require("./WidgetDesigner.css");
var BlockPalette_1 = __importDefault(require("./BlockPalette"));
var bootstrap_1 = require("react-library/lib/bootstrap");
var WidgetEditor_1 = require("./WidgetEditor");
var PageStackDisplay_1 = require("../PageStackDisplay");
var ErrorBoundary_1 = __importDefault(require("./ErrorBoundary"));
var FillDownwardComponent_1 = __importDefault(require("react-library/lib/FillDownwardComponent"));
var VirtualDatabase_1 = __importDefault(require("../database/VirtualDatabase"));
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
            var undoValue = _.last(_this.state.undoStack);
            _this.setState({ undoStack: _.initial(_this.state.undoStack), redoStack: _this.state.redoStack.concat([_this.props.widgetDef]) });
            _this.props.onWidgetDefChange(undoValue);
        };
        _this.handleRedo = function () {
            if (_this.state.redoStack.length === 0) {
                return;
            }
            var redoValue = _.last(_this.state.redoStack);
            _this.setState({ redoStack: _.initial(_this.state.redoStack), undoStack: _this.state.undoStack.concat([_this.props.widgetDef]) });
            _this.props.onWidgetDefChange(redoValue);
        };
        // Set the widget block
        _this.handleBlockDefChange = function (blockDef) {
            // Canonicalize
            if (blockDef) {
                blockDef = _this.props.createBlock(blockDef).process(_this.props.createBlock, function (b) {
                    return _this.props.createBlock(b).canonicalize();
                });
            }
            _this.handleWidgetDefChange(__assign(__assign({}, _this.props.widgetDef), { blockDef: blockDef }));
        };
        _this.handleUnselect = function () { _this.setState({ selectedBlockId: null }); };
        _this.handleRemoveBlock = function (blockId) {
            var block = _this.props.createBlock(_this.props.widgetDef.blockDef);
            _this.handleBlockDefChange(block.process(_this.props.createBlock, function (b) { return (b.id === blockId) ? null : b; }));
        };
        _this.handleSetMode = function (mode) {
            if (!_this.props.widgetDef.blockDef) {
                return;
            }
            // Verify before allowing preview
            if (mode === Mode.Preview) {
                for (var _i = 0, _a = blocks_1.getBlockTree(_this.props.widgetDef.blockDef, _this.props.createBlock, _this.props.widgetDef.contextVars); _i < _a.length; _i++) {
                    var childBlock = _a[_i];
                    var block = _this.props.createBlock(childBlock.blockDef);
                    if (block.validate({
                        schema: _this.props.schema,
                        actionLibrary: _this.props.actionLibrary,
                        widgetLibrary: _this.props.widgetLibrary,
                        contextVars: childBlock.contextVars
                    })) {
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
        var block = this.props.createBlock(this.props.widgetDef.blockDef);
        return {
            alterBlock: function (blockId, action, removeBlockId) {
                var newBlockDef;
                // Do not allow self-removal in drag
                if (removeBlockId === _this.props.widgetDef.blockDef.id) {
                    return;
                }
                // Remove source block
                if (removeBlockId) {
                    newBlockDef = block.process(_this.props.createBlock, function (b) { return (b.id === removeBlockId) ? null : b; });
                }
                else {
                    newBlockDef = block.blockDef;
                }
                // If nothing left
                if (!newBlockDef) {
                    _this.handleBlockDefChange(null);
                    return;
                }
                newBlockDef = _this.props.createBlock(newBlockDef).process(_this.props.createBlock, function (b) { return (b.id === blockId) ? action(b) : b; });
                _this.handleBlockDefChange(newBlockDef);
            }
        };
    };
    WidgetDesigner.prototype.renderPalette = function () {
        return React.createElement(BlockPalette_1.default, { key: "palette", createBlock: this.props.createBlock, schema: this.props.schema, dataSource: this.props.dataSource, entries: this.props.blockPaletteEntries });
    };
    WidgetDesigner.prototype.renderDesignBlock = function () {
        var _this = this;
        // If there is an existing block, render it
        if (this.props.widgetDef.blockDef) {
            var block = this.props.createBlock(this.props.widgetDef.blockDef);
            // Create block store
            var store_1 = this.createBlockStore();
            // Create renderChildBlock
            var renderChildBlock = function (props, childBlockDef, onSet) {
                if (childBlockDef) {
                    var childBlock = _this.props.createBlock(childBlockDef);
                    var validationError = childBlock.validate({
                        schema: _this.props.schema,
                        contextVars: props.contextVars,
                        actionLibrary: _this.props.actionLibrary,
                        widgetLibrary: _this.props.widgetLibrary
                    });
                    return (React.createElement(BlockWrapper_1.default, { blockDef: childBlockDef, selectedBlockId: _this.state.selectedBlockId, onSelect: _this.handleSelect.bind(null, childBlockDef.id), onRemove: _this.handleRemoveBlock.bind(null, childBlockDef.id), store: store_1, validationError: validationError }, childBlock.renderDesign(props)));
                }
                else {
                    return React.createElement(BlockPlaceholder_1.default, { onSet: onSet });
                }
            };
            var renderDesignProps = {
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                selectedId: this.state.selectedBlockId,
                widgetLibrary: this.props.widgetLibrary,
                locale: "en",
                contextVars: this.props.widgetDef.contextVars,
                store: store_1,
                renderChildBlock: renderChildBlock
            };
            return renderChildBlock(renderDesignProps, block.blockDef, this.handleBlockDefChange);
        }
        else {
            // Create placeholder
            return React.createElement(BlockPlaceholder_1.default, { onSet: this.handleBlockDefChange });
        }
    };
    WidgetDesigner.prototype.renderEditor = function () {
        if (this.props.widgetDef.blockDef && this.state.selectedBlockId) {
            var store_2 = this.createBlockStore();
            // Find selected block ancestry
            var contextVars = this.props.widgetDef.contextVars;
            var selectedBlockAncestry = blocks_1.findBlockAncestry(this.props.widgetDef.blockDef, this.props.createBlock, contextVars, this.state.selectedBlockId);
            // Create props
            if (selectedBlockAncestry) {
                var selectedChildBlock = selectedBlockAncestry[selectedBlockAncestry.length - 1];
                var props = {
                    contextVars: selectedChildBlock.contextVars,
                    locale: "en",
                    schema: this.props.schema,
                    dataSource: this.props.dataSource,
                    actionLibrary: this.props.actionLibrary,
                    widgetLibrary: this.props.widgetLibrary,
                    onChange: function (blockDef) {
                        store_2.alterBlock(blockDef.id, function () { return blockDef; });
                    }
                };
                // Create block
                var selectedBlock = this.props.createBlock(selectedChildBlock.blockDef);
                // Check for errors
                var validationError = selectedBlock.validate({
                    schema: this.props.schema,
                    contextVars: props.contextVars,
                    actionLibrary: this.props.actionLibrary,
                    widgetLibrary: this.props.widgetLibrary
                });
                return (React.createElement("div", { key: "editor", className: "widget-designer-editor" },
                    validationError ?
                        React.createElement("div", { className: "text-danger" },
                            React.createElement("i", { className: "fa fa-exclamation-circle" }),
                            " ",
                            validationError)
                        : null,
                    selectedBlock.renderEditor(props)));
            }
        }
        return (React.createElement("div", { key: "editor", className: "widget-designer-editor" },
            React.createElement(WidgetEditor_1.WidgetEditor, { widgetDef: this.props.widgetDef, onWidgetDefChange: this.handleWidgetDefChange, schema: this.props.schema, dataSource: this.props.dataSource })));
    };
    WidgetDesigner.prototype.renderDesign = function () {
        return [
            this.renderPalette(),
            (React.createElement("div", { key: "designer", className: "widget-designer-block", onClick: this.handleUnselect }, this.renderDesignBlock())),
            this.renderEditor()
        ];
    };
    /** Render a preview of the widget in a page */
    WidgetDesigner.prototype.renderPreview = function () {
        if (!this.props.widgetDef.blockDef) {
            return null;
        }
        var database = this.props.database;
        var virtualizeDatabase = false;
        if (virtualizeDatabase) {
            // Make non-live TODO needed? Could make big queries for counts/sums if mutated
            database = new VirtualDatabase_1.default(database, this.props.schema, this.props.locale);
        }
        // Create normal page to display
        var page = {
            type: "normal",
            contextVarValues: this.props.widgetDef.contextVarPreviewValues,
            database: database,
            widgetId: this.props.widgetDef.id
        };
        var pageElem = React.createElement(PageStackDisplay_1.PageStackDisplay, { initialPage: page, locale: "en", schema: this.props.schema, dataSource: this.props.dataSource, createBlock: this.props.createBlock, actionLibrary: this.props.actionLibrary, widgetLibrary: this.props.widgetLibrary });
        return [
            (React.createElement("div", { key: "palette", className: "widget-designer-palette" })),
            (React.createElement("div", { key: "preview", className: "widget-designer-preview" },
                React.createElement(ErrorBoundary_1.default, null, pageElem))),
            (React.createElement("div", { key: "editor", className: "widget-designer-editor" }))
        ];
    };
    WidgetDesigner.prototype.render = function () {
        return (React.createElement(FillDownwardComponent_1.default, null,
            React.createElement("div", { style: { position: "relative", height: "100%" } },
                React.createElement("div", { className: "widget-designer-header" },
                    React.createElement("div", { style: { float: "right" } },
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
                React.createElement("div", { style: { height: "100%", paddingTop: 44 } }, this.state.mode === Mode.Design ? this.renderDesign() : this.renderPreview()))));
    };
    return WidgetDesigner;
}(React.Component));
exports.default = WidgetDesigner;
