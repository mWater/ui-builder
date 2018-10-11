var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import BlockWrapper from "./BlockWrapper";
import * as React from "react";
import { findBlockAncestry, getBlockTree } from "../widgets/blocks";
import BlockPlaceholder from "../widgets/BlockPlaceholder";
import "./WidgetDesigner.css";
import BlockPalette from "./BlockPalette";
import { Toggle } from 'react-library/lib/bootstrap';
import { WidgetEditor } from "./WidgetEditor";
import { DataSourceDatabase } from "../database/DataSourceDatabase";
import { PageStackDisplay } from "../PageStackDisplay";
import { DragDropContext } from "react-dnd";
import HTML5Backend from 'react-dnd-html5-backend';
import ErrorBoundary from "./ErrorBoundary";
var Mode;
(function (Mode) {
    Mode[Mode["Design"] = 0] = "Design";
    Mode[Mode["Preview"] = 1] = "Preview";
})(Mode || (Mode = {}));
/** Design mode for a single widget */
let WidgetDesigner = class WidgetDesigner extends React.Component {
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
            const undoValue = _.last(this.state.undoStack);
            this.setState({ undoStack: _.initial(this.state.undoStack), redoStack: this.state.redoStack.concat([this.props.widgetDef]) });
            this.props.onWidgetDefChange(undoValue);
        };
        this.handleRedo = () => {
            if (this.state.redoStack.length === 0) {
                return;
            }
            const redoValue = _.last(this.state.redoStack);
            this.setState({ redoStack: _.initial(this.state.redoStack), undoStack: this.state.undoStack.concat([this.props.widgetDef]) });
            this.props.onWidgetDefChange(redoValue);
        };
        // Set the widget block
        this.handleBlockDefChange = (blockDef) => {
            // Canonicalize
            if (blockDef) {
                blockDef = this.props.createBlock(blockDef).process(this.props.createBlock, (b) => {
                    return this.props.createBlock(b).canonicalize();
                });
            }
            this.handleWidgetDefChange(Object.assign({}, this.props.widgetDef, { blockDef }));
        };
        this.handleUnselect = () => { this.setState({ selectedBlockId: null }); };
        this.handleRemoveBlock = (blockId) => {
            const block = this.props.createBlock(this.props.widgetDef.blockDef);
            this.handleBlockDefChange(block.process(this.props.createBlock, (b) => (b.id === blockId) ? null : b));
        };
        this.handleSetMode = (mode) => {
            if (!this.props.widgetDef.blockDef) {
                return;
            }
            // Verify before allowing preview
            if (mode === Mode.Preview) {
                for (const childBlock of getBlockTree(this.props.widgetDef.blockDef, this.props.createBlock, this.props.widgetDef.contextVars)) {
                    const block = this.props.createBlock(childBlock.blockDef);
                    if (block.validate({
                        schema: this.props.schema,
                        actionLibrary: this.props.actionLibrary,
                        widgetLibrary: this.props.widgetLibrary,
                        contextVars: childBlock.contextVars
                    })) {
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
    createBlockStore() {
        const block = this.props.createBlock(this.props.widgetDef.blockDef);
        return {
            alterBlock: (blockId, action, removeBlockId) => {
                let newBlockDef;
                // Do not allow self-removal in drag
                if (removeBlockId === this.props.widgetDef.blockDef.id) {
                    return;
                }
                // Remove source block
                if (removeBlockId) {
                    newBlockDef = block.process(this.props.createBlock, (b) => (b.id === removeBlockId) ? null : b);
                }
                else {
                    newBlockDef = block.blockDef;
                }
                // If nothing left
                if (!newBlockDef) {
                    this.handleBlockDefChange(null);
                    return;
                }
                newBlockDef = this.props.createBlock(newBlockDef).process(this.props.createBlock, (b) => (b.id === blockId) ? action(b) : b);
                this.handleBlockDefChange(newBlockDef);
            }
        };
    }
    renderPalette() {
        return React.createElement(BlockPalette, { key: "palette", createBlock: this.props.createBlock, schema: this.props.schema, dataSource: this.props.dataSource, entries: this.props.blockPaletteEntries });
    }
    renderDesignBlock() {
        // If there is an existing block, render it
        if (this.props.widgetDef.blockDef) {
            const block = this.props.createBlock(this.props.widgetDef.blockDef);
            // Create block store
            const store = this.createBlockStore();
            // Create renderChildBlock
            const renderChildBlock = (props, childBlockDef, onSet) => {
                if (childBlockDef) {
                    const childBlock = this.props.createBlock(childBlockDef);
                    const validationError = childBlock.validate({
                        schema: this.props.schema,
                        contextVars: props.contextVars,
                        actionLibrary: this.props.actionLibrary,
                        widgetLibrary: this.props.widgetLibrary
                    });
                    return (React.createElement(BlockWrapper, { blockDef: childBlockDef, selectedBlockId: this.state.selectedBlockId, onSelect: this.handleSelect.bind(null, childBlockDef.id), onRemove: this.handleRemoveBlock.bind(null, childBlockDef.id), store: store, validationError: validationError }, childBlock.renderDesign(props)));
                }
                else {
                    return React.createElement(BlockPlaceholder, { onSet: onSet });
                }
            };
            const renderDesignProps = {
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                selectedId: this.state.selectedBlockId,
                widgetLibrary: this.props.widgetLibrary,
                locale: "en",
                contextVars: this.props.widgetDef.contextVars,
                store,
                renderChildBlock: renderChildBlock
            };
            return renderChildBlock(renderDesignProps, block.blockDef, this.handleBlockDefChange);
        }
        else {
            // Create placeholder
            return React.createElement(BlockPlaceholder, { onSet: this.handleBlockDefChange });
        }
    }
    renderEditor() {
        if (this.props.widgetDef.blockDef && this.state.selectedBlockId) {
            const store = this.createBlockStore();
            // Find selected block ancestry
            const contextVars = this.props.widgetDef.contextVars;
            const selectedBlockAncestry = findBlockAncestry(this.props.widgetDef.blockDef, this.props.createBlock, contextVars, this.state.selectedBlockId);
            // Create props
            if (selectedBlockAncestry) {
                const selectedChildBlock = selectedBlockAncestry[selectedBlockAncestry.length - 1];
                const props = {
                    contextVars: selectedChildBlock.contextVars,
                    locale: "en",
                    schema: this.props.schema,
                    dataSource: this.props.dataSource,
                    actionLibrary: this.props.actionLibrary,
                    widgetLibrary: this.props.widgetLibrary,
                    onChange: (blockDef) => {
                        store.alterBlock(blockDef.id, () => blockDef);
                    }
                };
                // Create block
                const selectedBlock = this.props.createBlock(selectedChildBlock.blockDef);
                // Check for errors
                const validationError = selectedBlock.validate({
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
            React.createElement(WidgetEditor, { widgetDef: this.props.widgetDef, onWidgetDefChange: this.handleWidgetDefChange, schema: this.props.schema, dataSource: this.props.dataSource })));
    }
    renderDesign() {
        return [
            this.renderPalette(),
            (React.createElement("div", { key: "designer", className: "widget-designer-block", onClick: this.handleUnselect }, this.renderDesignBlock())),
            this.renderEditor()
        ];
    }
    /** Render a preview of the widget in a page */
    renderPreview() {
        if (!this.props.widgetDef.blockDef) {
            return null;
        }
        const database = new DataSourceDatabase(this.props.schema, this.props.dataSource);
        // Make non-live TODO needed? Could make big queries for counts/sums if mutated
        // database = new VirtualDatabase(database, this.props.schema, this.props.locale)
        // Create normal page to display
        const page = {
            type: "normal",
            contextVarValues: this.props.widgetDef.contextVarPreviewValues,
            database: database,
            widgetId: this.props.widgetDef.id
        };
        const pageElem = React.createElement(PageStackDisplay, { initialPage: page, locale: "en", schema: this.props.schema, dataSource: this.props.dataSource, createBlock: this.props.createBlock, actionLibrary: this.props.actionLibrary, widgetLibrary: this.props.widgetLibrary });
        return [
            (React.createElement("div", { key: "palette", className: "widget-designer-palette" })),
            (React.createElement("div", { key: "preview", className: "widget-designer-preview" },
                React.createElement(ErrorBoundary, null, pageElem))),
            (React.createElement("div", { key: "editor", className: "widget-designer-editor" }))
        ];
    }
    render() {
        return (React.createElement("div", { style: { height: "100%" } },
            React.createElement("div", { className: "widget-designer-header" },
                React.createElement("div", { style: { float: "right" } },
                    React.createElement("button", { type: "button", className: "btn btn-link btn-sm", onClick: this.handleUndo, disabled: this.state.undoStack.length === 0 },
                        React.createElement("i", { className: "fa fa-undo" }),
                        " Undo"),
                    React.createElement("button", { type: "button", className: "btn btn-link btn-sm", onClick: this.handleRedo, disabled: this.state.redoStack.length === 0 },
                        React.createElement("i", { className: "fa fa-repeat" }),
                        " Redo"),
                    React.createElement(Toggle, { value: this.state.mode, options: [
                            { value: Mode.Design, label: [React.createElement("i", { key: "design", className: "fa fa-pencil" }), " Design"] },
                            { value: Mode.Preview, label: [React.createElement("i", { key: "design", className: "fa fa-play" }), " Preview"] }
                        ], onChange: this.handleSetMode, size: "sm" }))),
            this.state.mode === Mode.Design ? this.renderDesign() : this.renderPreview()));
    }
};
WidgetDesigner = __decorate([
    DragDropContext(HTML5Backend)
], WidgetDesigner);
export default WidgetDesigner;
//# sourceMappingURL=WidgetDesigner.js.map