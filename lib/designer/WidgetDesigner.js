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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const BlockWrapper_1 = __importDefault(require("./BlockWrapper"));
const React = __importStar(require("react"));
const blocks_1 = require("../widgets/blocks");
const BlockPlaceholder_1 = __importDefault(require("../widgets/BlockPlaceholder"));
require("./WidgetDesigner.css");
const bootstrap_1 = require("react-library/lib/bootstrap");
const WidgetEditor_1 = require("./WidgetEditor");
const PageStackDisplay_1 = require("../PageStackDisplay");
const ErrorBoundary_1 = __importDefault(require("./ErrorBoundary"));
const VirtualDatabase_1 = __importDefault(require("../database/VirtualDatabase"));
const AddWizardPalette_1 = __importDefault(require("./AddWizardPalette"));
const ClipboardPalette_1 = __importDefault(require("./ClipboardPalette"));
const canonical_json_1 = __importDefault(require("canonical-json"));
var Mode;
(function (Mode) {
    Mode[Mode["Design"] = 0] = "Design";
    Mode[Mode["Preview"] = 1] = "Preview";
})(Mode || (Mode = {}));
/** Design mode for a single widget. Ensures that blockdefs are always canonical */
class WidgetDesigner extends React.Component {
    constructor(props) {
        super(props);
        this.handleSelect = (blockId) => {
            this.setState({ selectedBlockId: blockId });
        };
        /** Handle change including undo stack  */
        this.handleWidgetDefChange = (widgetDef) => {
            this.setState({ undoStack: this.state.undoStack.concat([this.props.widgetDef]), redoStack: [] });
            this.props.onWidgetDefChange(widgetDef);
        };
        this.handleUndo = () => {
            if (this.state.undoStack.length === 0) {
                return;
            }
            const undoValue = lodash_1.default.last(this.state.undoStack);
            this.setState({ undoStack: lodash_1.default.initial(this.state.undoStack), redoStack: this.state.redoStack.concat([this.props.widgetDef]) });
            this.props.onWidgetDefChange(undoValue);
        };
        this.handleRedo = () => {
            if (this.state.redoStack.length === 0) {
                return;
            }
            const redoValue = lodash_1.default.last(this.state.redoStack);
            this.setState({ redoStack: lodash_1.default.initial(this.state.redoStack), undoStack: this.state.undoStack.concat([this.props.widgetDef]) });
            this.props.onWidgetDefChange(redoValue);
        };
        // Set the widget block
        this.handleBlockDefChange = (blockDef) => {
            // Canonicalize so that saved version is always canonical
            blockDef = this.canonicalize(blockDef);
            this.handleWidgetDefChange({ ...this.props.widgetDef, blockDef });
        };
        this.handleUnselect = () => { this.setState({ selectedBlockId: null }); };
        this.handleRemoveBlock = (blockId) => {
            const block = this.props.baseCtx.createBlock(this.props.widgetDef.blockDef);
            this.handleBlockDefChange(block.process(this.props.baseCtx.createBlock, (b) => (b.id === blockId) ? null : b));
        };
        this.handleSetMode = (mode) => {
            if (!this.props.widgetDef.blockDef) {
                return;
            }
            // Verify before allowing preview
            if (mode === Mode.Preview) {
                const contextVars = (this.props.baseCtx.globalContextVars || [])
                    .concat(this.props.widgetDef.contextVars)
                    .concat(this.props.widgetDef.privateContextVars || []);
                for (const childBlock of blocks_1.getBlockTree(this.props.widgetDef.blockDef, this.props.baseCtx.createBlock, contextVars)) {
                    const block = this.props.baseCtx.createBlock(childBlock.blockDef);
                    // Use context vars for the block
                    const designCtx = { ...this.createDesignCtx(), contextVars: childBlock.contextVars };
                    if (block.validate(designCtx)) {
                        alert("Correct errors first");
                        return;
                    }
                }
            }
            this.setState({ mode });
        };
        this.state = {
            mode: Mode.Design,
            selectedBlockId: null,
            undoStack: [],
            redoStack: []
        };
    }
    /** Canonicalize the widget's block and all children, returning the canonical version */
    canonicalize(blockDef) {
        // Canonicalize
        if (blockDef) {
            // Processes entire tree, canonicalizing it
            return this.props.baseCtx.createBlock(blockDef).process(this.props.baseCtx.createBlock, (b) => {
                return this.props.baseCtx.createBlock(b).canonicalize();
            });
        }
        return blockDef;
    }
    createBlockStore() {
        const alterBlock = (blockId, action, removeBlockId) => {
            let newBlockDef;
            const block = this.props.baseCtx.createBlock(this.props.widgetDef.blockDef);
            // Do not allow self-removal in drag
            if (removeBlockId === this.props.widgetDef.blockDef.id) {
                return;
            }
            // Remove source block
            if (removeBlockId) {
                newBlockDef = block.process(this.props.baseCtx.createBlock, (b) => (b.id === removeBlockId) ? null : b);
            }
            else {
                newBlockDef = block.blockDef;
            }
            // If nothing left
            if (!newBlockDef) {
                this.handleBlockDefChange(null);
                return;
            }
            newBlockDef = this.props.baseCtx.createBlock(newBlockDef).process(this.props.baseCtx.createBlock, (b) => (b.id === blockId) ? action(b) : b);
            this.handleBlockDefChange(newBlockDef);
        };
        const replaceBlock = (blockDef) => {
            alterBlock(blockDef.id, () => blockDef);
        };
        return { alterBlock, replaceBlock };
    }
    createDesignCtx() {
        // Create block store
        const store = this.createBlockStore();
        const widgetContextVars = (this.props.baseCtx.globalContextVars || [])
            .concat(this.props.widgetDef.contextVars)
            .concat(this.props.widgetDef.privateContextVars || []);
        const designCtx = {
            ...this.props.baseCtx,
            dataSource: this.props.dataSource,
            selectedId: this.state.selectedBlockId,
            contextVars: widgetContextVars,
            store,
            blockPaletteEntries: this.props.blockPaletteEntries,
            // Will be set below
            renderChildBlock: {}
        };
        // Create renderChildBlock
        const renderChildBlock = (childDesignCtx, childBlockDef, onSet) => {
            if (childBlockDef) {
                const childBlock = this.props.baseCtx.createBlock(childBlockDef);
                const validationError = childBlock.validate(childDesignCtx);
                // Gets the label of the block which is displayed on hover
                const label = childBlock.getLabel();
                return (React.createElement(BlockWrapper_1.default, { blockDef: childBlockDef, selectedBlockId: this.state.selectedBlockId, onSelect: this.handleSelect.bind(null, childBlockDef.id), onRemove: this.handleRemoveBlock.bind(null, childBlockDef.id), store: store, validationError: validationError, label: label }, childBlock.renderDesign(childDesignCtx)));
            }
            else {
                return React.createElement(BlockPlaceholder_1.default, { onSet: onSet });
            }
        };
        designCtx.renderChildBlock = renderChildBlock;
        return designCtx;
    }
    renderDesignBlock() {
        // If there is an existing block, render it
        if (this.props.widgetDef.blockDef) {
            const block = this.props.baseCtx.createBlock(this.props.widgetDef.blockDef);
            const designCtx = this.createDesignCtx();
            return designCtx.renderChildBlock(designCtx, block.blockDef, this.handleBlockDefChange);
        }
        else {
            // Create placeholder
            return React.createElement(BlockPlaceholder_1.default, { onSet: this.handleBlockDefChange });
        }
    }
    renderEditor() {
        if (this.props.widgetDef.blockDef && this.state.selectedBlockId) {
            // Find selected block ancestry
            const contextVars = (this.props.baseCtx.globalContextVars || [])
                .concat(this.props.widgetDef.contextVars)
                .concat(this.props.widgetDef.privateContextVars || []);
            const selectedBlockAncestry = blocks_1.findBlockAncestry(this.props.widgetDef.blockDef, this.props.baseCtx.createBlock, contextVars, this.state.selectedBlockId);
            // Create props
            if (selectedBlockAncestry) {
                const selectedChildBlock = selectedBlockAncestry[selectedBlockAncestry.length - 1];
                // Create block
                const selectedBlock = this.props.baseCtx.createBlock(selectedChildBlock.blockDef);
                // Use context variables for the block
                const designCtx = { ...this.createDesignCtx(), contextVars: selectedChildBlock.contextVars };
                // Check for errors
                const validationError = selectedBlock.validate(designCtx);
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
    }
    renderDesign() {
        return [
            (React.createElement("div", { key: "designer", className: "widget-designer-block", onClick: this.handleUnselect }, this.renderDesignBlock())),
            this.renderEditor()
        ];
    }
    /** Render a preview of the widget in a page */
    renderPreview() {
        if (!this.props.widgetDef.blockDef) {
            return null;
        }
        let database = this.props.baseCtx.database;
        if (this.props.widgetDef.virtualizeDatabaseInPreview || this.props.widgetDef.virtualizeDatabaseInPreview == null) {
            // Make non-live TODO needed? Could make big queries for counts/sums if mutated
            database = new VirtualDatabase_1.default(database, this.props.baseCtx.schema, this.props.baseCtx.locale);
        }
        // Include global context values if present
        const contextVarValues = this.props.widgetDef.contextVarPreviewValues;
        // Create normal page to display
        const page = {
            type: "normal",
            contextVarValues: contextVarValues,
            database: database,
            widgetId: this.props.widgetDef.id
        };
        const pageElem = React.createElement(PageStackDisplay_1.PageStackDisplay, { baseCtx: this.props.baseCtx, initialPage: page });
        return [
            (React.createElement("div", { key: "preview", className: "widget-preview-block" },
                React.createElement(ErrorBoundary_1.default, null, pageElem))),
            (React.createElement("div", { key: "editor", className: "widget-designer-editor" }))
        ];
    }
    render() {
        // Check if canonical
        const canonilizedBlockDef = this.canonicalize(this.props.widgetDef.blockDef);
        if (canonical_json_1.default(canonilizedBlockDef) != canonical_json_1.default(this.props.widgetDef.blockDef)) {
            // Is not canonical. Defer update (since we can't call directly in render)
            // and return null
            setTimeout(() => {
                this.handleBlockDefChange(canonilizedBlockDef);
            });
            return null;
        }
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
    }
}
exports.default = WidgetDesigner;
