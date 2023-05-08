"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HashHistoryPageStackDisplay = void 0;
const react_1 = require("react");
const react_2 = __importDefault(require("react"));
const PageStackDisplay_1 = require("./PageStackDisplay");
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
function HashHistoryPageStackDisplay(props) {
    const { hashHistory, baseCtx } = props;
    const pageStackRef = (0, react_1.useRef)(null);
    // If page is not found, set true
    const [pageNotFound, setPageNotFound] = (0, react_1.useState)(false);
    const ignoreLocationChangeRef = (0, react_1.useRef)(0);
    // Block changes when pages can't be closed
    (0, react_1.useEffect)(() => {
        return hashHistory.addBlockerListener((prevLocation, nextLocation) => __awaiter(this, void 0, void 0, function* () {
            const pageStack = pageStackRef.current;
            if (!pageStack) {
                return false;
            }
            // Ignore hash-only changes
            if (prevLocation.pathname == nextLocation.pathname && prevLocation.search == nextLocation.search) {
                ignoreLocationChangeRef.current += 1;
                return false;
            }
            // An external change of hash can be triggered by a forward or back or hash change
            // Determine if it is a forward or back
            const delta = nextLocation.index - prevLocation.index;
            // If it is a back, close appropriate number of pages
            if (delta < 0) {
                // Check if can be accomplished by closing pages
                if (pageStack.getPageStack().length > -delta) {
                    // Close pages needed
                    for (let i = 0; i < -delta; i++) {
                        const { page, pageCount, success } = yield pageStack.closePage();
                        if (!success) {
                            // Cannot close page. Block. 
                            // TODO: Note that if this was a multiple page close and only part succeded, the hash history will be out of sync
                            return true;
                        }
                    }
                    // Ignore location change as it is handled by closing pages
                    ignoreLocationChangeRef.current += 1;
                }
                else {
                    // Close all pages
                    const success = yield pageStack.closeAllPages();
                    if (!success) {
                        // Cannot close page. Block.
                        // TODO: Note that if this was a multiple page close and only part succeded, the hash history will be out of sync
                        return true;
                    }
                }
            }
            else {
                // Close all pages
                const success = yield pageStackRef.current.closeAllPages();
                if (!success) {
                    // Cannot close page. Block.
                    // TODO: Note that if this was a multiple page close and only part succeded, the hash history will be out of sync
                    return true;
                }
            }
            return false;
        }));
    }, [hashHistory]);
    /** Opens a page given a location. Call this when location
     * changes externally
     */
    function openPageForLocation(location) {
        // Go to page by location
        const page = props.locationToPage(location);
        if (page) {
            setPageNotFound(false);
            pageStackRef.current.openPage(page);
        }
        else {
            setPageNotFound(true);
        }
    }
    // Open page for initial location
    (0, react_1.useEffect)(() => {
        openPageForLocation(hashHistory.getLocation());
    }, [hashHistory]);
    // Listen to location changes to open page
    (0, react_1.useEffect)(() => {
        return hashHistory.addLocationListener((location) => {
            // If ignore, decrement and return
            if (ignoreLocationChangeRef.current > 0) {
                ignoreLocationChangeRef.current -= 1;
                return;
            }
            openPageForLocation(location);
        });
    }, [hashHistory]);
    // Override the page stack to catch opens and closes
    const overridePageStack = {
        openPage: (page) => {
            // Call open page
            pageStackRef.current.openPage(page);
            // If modal or has changed database
            if (page.type == "modal" || page.database != baseCtx.database) {
                // Push to history to allow back to work, but don't change url
                hashHistory.push(location.pathname + location.search + location.hash, { silent: true });
            }
            else {
                // Convert to uri and silently push
                const uri = props.pageToLocation(page);
                hashHistory.push(uri, { silent: true });
            }
        },
        replacePage: (page) => __awaiter(this, void 0, void 0, function* () {
            // Call replace page
            const success = pageStackRef.current.replacePage(page);
            if (!success) {
                return false;
            }
            // If modal or has changed database
            if (page.type == "modal" || page.database != baseCtx.database) {
                // Push to history to allow back to work, but don't change url
                hashHistory.replace(location.pathname + location.search + location.hash, { silent: true });
            }
            else {
                // Convert to uri and silently push
                const uri = props.pageToLocation(page);
                hashHistory.replace(uri, { silent: true });
            }
            return true;
        }),
        closePage: () => __awaiter(this, void 0, void 0, function* () {
            const result = yield pageStackRef.current.closePage();
            if (!result.success) {
                return result;
            }
            // If closed and no more pages open, do back
            if (result.pageCount == 0) {
                hashHistory.back();
                return result;
            }
            // Go silently back
            hashHistory.back({ silent: true });
            return result;
        })
    };
    if (pageNotFound) {
        return react_2.default.createElement("div", { className: "alert alert-info" }, "Page not found");
    }
    return (react_2.default.createElement(PageStackDisplay_1.PageStackDisplay, { baseCtx: baseCtx, ref: pageStackRef, overridePageStack: overridePageStack }));
}
exports.HashHistoryPageStackDisplay = HashHistoryPageStackDisplay;
