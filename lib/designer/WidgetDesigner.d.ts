import * as React from "react";
import { WidgetDef } from "../widgets/widgets";
import { BlockDef } from "../widgets/blocks";
import "./WidgetDesigner.css";
import { BlockPaletteEntry } from "./blockPaletteEntries";
import { BaseCtx, DesignCtx } from "../contexts";
import { DataSource } from "mwater-expressions";
interface WidgetDesignerProps {
    baseCtx: BaseCtx;
    dataSource: DataSource;
    widgetDef: WidgetDef;
    onWidgetDefChange(widgetDef: WidgetDef): void;
    blockPaletteEntries: BlockPaletteEntry[];
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
    /** Current locale */
    locale: string;
}
/** Design mode for a single widget. Ensures that blockdefs are always canonical */
export default class WidgetDesigner extends React.Component<WidgetDesignerProps, State> {
    constructor(props: WidgetDesignerProps);
    handleSelect: (blockId: string) => void;
    /** Handle change including undo stack  */
    handleWidgetDefChange: (widgetDef: WidgetDef) => void;
    handleUndo: () => void;
    handleRedo: () => void;
    /** Canonicalize the widget's block and all children, returning the canonical version */
    canonicalize(blockDef: BlockDef | null): BlockDef | null;
    handleBlockDefChange: (blockDef: BlockDef | null) => void;
    handleUnselect: () => void;
    handleRemoveBlock: (blockId: string) => void;
    createBlockStore(): {
        alterBlock: (blockId: string, action: (blockDef: BlockDef) => BlockDef | null, removeBlockId?: string | undefined) => void;
        replaceBlock: (blockDef: BlockDef) => void;
    };
    createDesignCtx(): DesignCtx;
    renderDesignBlock(): JSX.Element;
    renderEditor(): JSX.Element;
    handleSetMode: (mode: Mode) => void;
    renderDesign(): JSX.Element[];
    /** Render a preview of the widget in a page */
    renderPreview(): JSX.Element[] | null;
    renderPreviewLocale(): JSX.Element;
    render(): JSX.Element | null;
}
export {};
