import * as React from "react";
import { Page, PageStack } from "./PageStack";
import { CreateBlock, RenderInstanceProps, BlockDef } from "./widgets/blocks";
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
    /** Stores validation registrations for all sub-components so that they can be validated
     * before being saved. Contains pageIndex as well to allow validating a single page
     */
    validationRegistrations: {
        [key: string]: {
            pageIndex: number;
            validate: (() => string | null);
        };
    };
    constructor(props: Props);
    openPage(page: Page): void;
    closePage(): boolean;
    closeAllPages(): boolean;
    renderChildBlock: (props: RenderInstanceProps, childBlockDef: BlockDef | null) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | null;
    handleClose: () => void;
    /** Stores the registration for validation of a child block and returns an unregister function */
    registerChildForValidation: (pageIndex: number, validate: () => string | null) => () => void;
    renderPageContents(page: Page, pageIndex: number): JSX.Element | null;
    renderPage(page: Page, index: number): JSX.Element;
    render(): JSX.Element[];
}
export {};
