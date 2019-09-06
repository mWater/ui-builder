import * as React from "react";
import { WidgetDef } from "../widgets/widgets";
import { Schema, DataSource } from "mwater-expressions";
import BlockFactory from "../widgets/BlockFactory";
import { ActionLibrary } from "../widgets/ActionLibrary";
import { BlockPaletteEntry } from "./blockPaletteEntries";
import { Database } from "../database/Database";
/** All widgets in current project */
export interface WidgetLibrary {
    widgets: {
        [id: string]: WidgetDef;
    };
}
interface Props {
    blockFactory: BlockFactory;
    database: Database;
    schema: Schema;
    dataSource: DataSource;
    actionLibrary: ActionLibrary;
    widgetLibrary: WidgetLibrary;
    /** Ids of widgets in open tabs */
    openTabs: string[];
    blockPaletteEntries: BlockPaletteEntry[];
    onOpenTabsChange(openTabs: string[]): void;
    onWidgetLibraryChange(widgetLibrary: WidgetLibrary): void;
}
interface State {
    activeTabIndex: number;
}
/** Design mode for a library of widgets */
export default class WidgetLibraryDesigner extends React.Component<Props, State> {
    constructor(props: Props);
    handleTabChange: (widgetId: string, widgetDef: WidgetDef) => void;
    handleSelectTab: (index: number) => void;
    handleAddWidget: (widgetDef: WidgetDef) => void;
    handleCloseTab: (index: number) => void;
    handleOpenWidget: (widgetId: string) => void;
    handleRemoveWidget: (widgetId: string) => void;
    renderTab(tab: string, index: number): JSX.Element | null;
    renderActiveTabContents(): JSX.Element | null;
    render(): JSX.Element;
}
export {};
