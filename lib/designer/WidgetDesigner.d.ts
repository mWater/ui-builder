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
    /** Global context variable values to use for preview mode */
    globalContextVarValues?: {
        [contextVarId: string]: any;
    };
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
        replaceBlock: (blockDef: BlockDef) => void;
    };
    createDesignCtx(): DesignCtx;
    renderDesignBlock(): JSX.Element;
    renderEditor(): JSX.Element;
    handleSetMode: (mode: Mode) => void;
    renderDesign(): JSX.Element[];
    /** Render a preview of the widget in a page */
    renderPreview(): JSX.Element[] | null;
    render(): JSX.Element;
}
export {};
