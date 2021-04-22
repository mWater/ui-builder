import * as React from "react";
import { Page, PageStack } from "./PageStack";
import { BlockDef } from "./widgets/blocks";
import { BaseCtx, InstanceCtx } from "./contexts";
import './PageStackDisplay.css';
interface Props {
    baseCtx: BaseCtx;
    initialPage: Page;
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
            validate: (() => string | null | Promise<string | null>);
        };
    };
    constructor(props: Props);
    openPage(page: Page): void;
    /** Replace current page with specified one */
    replacePage(page: Page): Promise<boolean>;
    /** Close top page. Returns whether successful and pages still open */
    closePage(): Promise<{
        success: boolean;
        pageCount: number;
    }>;
    closeAllPages(): Promise<boolean>;
    /** Validates a single page (by pageIndex), showing an error if fails */
    validatePage(pageIndex: number): Promise<boolean>;
    renderChildBlock: (instanceCtx: InstanceCtx, childBlockDef: BlockDef | null) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | null;
    handleClose: () => void;
    /** Stores the registration for validation of a child block and returns an unregister function */
    registerChildForValidation: (pageIndex: number, validate: () => string | null) => (() => void);
    renderPageContents(page: Page, pageIndex: number): JSX.Element | null;
    renderPage(page: Page, index: number): JSX.Element;
    render(): JSX.Element[];
}
export {};
