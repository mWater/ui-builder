import * as React from "react";
import { Page, PageStack } from "./PageStack";
import { CreateBlock, RenderInstanceProps, BlockDef, ValidatableInstance } from "./widgets/blocks";
import { Schema, DataSource } from "mwater-expressions";
import { ActionLibrary } from "./widgets/ActionLibrary";
import { WidgetLibrary } from "./designer/widgetLibrary";
import './PageStackDisplay.css';
interface Props {
    initialPage: Page;
    createBlock: CreateBlock;
    locale: string;
    schema: Schema;
    dataSource: DataSource;
    actionLibrary: ActionLibrary;
    widgetLibrary: WidgetLibrary;
}
interface State {
    pages: Page[];
}
/** Maintains and displays the stack of pages, including modals.  */
export declare class PageStackDisplay extends React.Component<Props, State> implements PageStack {
    /** Keyed by <page index>:<block id>:<block instance> */
    instanceRefs: {
        [key: string]: React.Component<any> & ValidatableInstance;
    };
    constructor(props: Props);
    openPage(page: Page): void;
    closePage(): void;
    refHandler: (key: string, component: React.Component<any, {}, any> | null) => void;
    renderChildBlock: (page: Page, pageIndex: number, props: RenderInstanceProps, childBlockDef: BlockDef | null, instanceId?: string | undefined) => React.ReactElement<any> | null;
    handleClose: () => void;
    renderPageContents(page: Page, pageIndex: number): JSX.Element | null;
    renderPage(page: Page, index: number): JSX.Element;
    render(): JSX.Element[];
}
export {};
