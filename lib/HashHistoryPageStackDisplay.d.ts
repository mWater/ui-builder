/// <reference types="react" />
import { HashHistory, HashLocation } from "react-library/lib/HashHistory";
import { BaseCtx } from "./contexts";
import { Page } from "./PageStack";
/** Keeps a HashHistory in sync with a PageStackDisplay.
 *
 * When the page stack changes, it updates the hash history.
 *
 * If an external back triggered, it updates the page stack by closing pages.
 *
 * If an external forward is triggered, it resets the page stack and opens the page.
 *
 * If an external hash change is triggered, it resets the page stack and opens the page.
 *
 * Note: the optional hash part of the hash url is ignored in routing and doesn't cause
 * a reload.
 */
export declare function HashHistoryPageStackDisplay(props: {
    hashHistory: HashHistory;
    baseCtx: BaseCtx;
    locationToPage: (location: HashLocation) => Page | null;
    pageToLocation: (page: Page) => string;
}): JSX.Element;
