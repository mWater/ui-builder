import * as React from "react";
import { WidgetDef } from "../widgets/widgets";
import { CreateBlock, BlockDef } from "../widgets/blocks";
import "./WidgetDesigner.css";
import { Schema, DataSource } from "mwater-expressions";
import { WidgetLibrary } from "./widgetLibrary";
import { ActionLibrary } from "../widgets/ActionLibrary";
import { Database } from "../database/Database";
import { BlockPaletteEntry } from "./blockPaletteEntries";
interface WidgetDesignerProps {
    widgetDef: WidgetDef;
    createBlock: CreateBlock;
    database: Database;
    schema: Schema;
    dataSource: DataSource;
    actionLibrary: ActionLibrary;
    locale: string;
    widgetLibrary: WidgetLibrary;
    blockPaletteEntries: BlockPaletteEntry[];
    onWidgetDefChange(widgetDef: WidgetDef): void;
}
declare enum Mode {
    Design = 0,
    Preview = 1
}
interface State {
    mode: Mode;
    selectedBlockId: string | null;
    undoStack: WidgetDef[];
    redoStack: WidgetDef[];
}
/** Design mode for a single widget */
export default class WidgetDesigner extends React.Component<WidgetDesignerProps, State> {
    constructor(props: WidgetDesignerProps);
    handleSelect: (blockId: string) => void;
    /** Handle change including undo stack  */
    handleWidgetDefChange: (widgetDef: WidgetDef) => void;
    handleUndo: () => void;
    handleRedo: () => void;
    handleBlockDefChange: (blockDef: BlockDef | null) => void;
    handleUnselect: () => void;
    handleRemoveBlock: (blockId: string) => void;
    createBlockStore(): {
        alterBlock: (blockId: string, action: (blockDef: BlockDef) => BlockDef | null, removeBlockId?: string | undefined) => void;
    };
    renderPalette(): JSX.Element;
    renderDesignBlock(): JSX.Element;
    renderEditor(): JSX.Element;
    handleSetMode: (mode: Mode) => void;
    renderDesign(): JSX.Element[];
    /** Render a preview of the widget in a page */
    renderPreview(): JSX.Element[] | null;
    render(): JSX.Element;
}
export {};
