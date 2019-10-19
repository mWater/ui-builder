import * as React from "react";
import { WidgetDef } from "../widgets/widgets";
import { DataSource } from "mwater-expressions";
import { BlockPaletteEntry } from "./blockPaletteEntries";
import { BaseCtx } from "../contexts";
/** All widgets in current project */
export interface WidgetLibrary {
    widgets: {
        [id: string]: WidgetDef;
    };
}
interface Props {
    baseCtx: BaseCtx;
    dataSource: DataSource;
    /** Ids of widgets in open tabs */
    openTabs: string[];
    blockPaletteEntries: BlockPaletteEntry[];
    onOpenTabsChange(openTabs: string[]): void;
    onWidgetLibraryChange(widgetLibrary: WidgetLibrary): void;
}
interface State {
    /** Index of active tab. Can be one past end for new tab */
    activeTabIndex: number;
}
/** Design mode for a library of widgets */
export declare class WidgetLibraryDesigner extends React.Component<Props, State> {
    constructor(props: Props);
    handleTabChange: (widgetId: string, widgetDef: WidgetDef) => void;
    handleSelectTab: (index: number) => void;
    handleAddWidget: (widgetDef: WidgetDef) => void;
    handleDuplicateWidget: (widgetDef: WidgetDef) => void;
    handleCloseTab: (index: number, ev: React.MouseEvent<Element, MouseEvent>) => void;
    handleOpenWidget: (widgetId: string) => void;
    handleRemoveWidget: (widgetId: string) => void;
    /** Validate a single widget */
    validateWidget: (widgetDef: WidgetDef) => string | null;
    renderTab(index: number): JSX.Element | null;
    renderActiveTabContents(): JSX.Element | null;
    render(): JSX.Element;
}
export {};
