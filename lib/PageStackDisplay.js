"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.PageStackDisplay = void 0;
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importStar(require("react"));
const ContextVarsInjector_1 = __importDefault(require("./widgets/ContextVarsInjector"));
const ModalPopupComponent_1 = __importDefault(require("react-library/lib/ModalPopupComponent"));
const uuid_1 = __importDefault(require("uuid"));
require("./PageStackDisplay.css");
const mwater_expressions_1 = require("mwater-expressions");
const embeddedExprs_1 = require("./embeddedExprs");
const evalContextVarExpr_1 = require("./widgets/evalContextVarExpr");
/** Maintains and displays the stack of pages, including modals */
class PageStackDisplay extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.renderChildBlock = (instanceCtx, childBlockDef) => {
            // Create block
            if (childBlockDef) {
                const block = instanceCtx.createBlock(childBlockDef);
                return block.renderInstance(instanceCtx);
            }
            return null;
        };
        this.handleClose = () => {
            if (this.props.overridePageStack) {
                this.props.overridePageStack.closePage();
            }
            else {
                this.closePage();
            }
        };
        /** Stores the registration for validation of a child block and returns an unregister function */
        this.registerChildForValidation = (pageIndex, validate) => {
            const key = (0, uuid_1.default)();
            this.validationRegistrations[key] = { pageIndex: pageIndex, validate: validate };
            return () => {
                delete this.validationRegistrations[key];
            };
        };
        // Display initial page
        this.state = {
            pages: props.initialPage ? [props.initialPage] : []
        };
        this.validationRegistrations = {};
    }
    openPage(page) {
        this.setState({ pages: this.state.pages.concat(page) });
    }
    /** Replace current page with specified one */
    replacePage(page) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.state.pages.length == 0) {
                throw new Error("Zero pages in stack");
            }
            // Validate all instances within page
            const pageIndex = this.state.pages.length - 1;
            const result = yield this.validatePage(pageIndex);
            if (!result) {
                return false;
            }
            const pages = this.state.pages.slice();
            pages.splice(pages.length - 1, 1);
            pages.push(page);
            this.setState({ pages });
            return true;
        });
    }
    /** Close top page. Returns whether successful and pages still open and page */
    closePage() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.state.pages.length == 0) {
                throw new Error("Zero pages in stack");
            }
            const pageIndex = this.state.pages.length - 1;
            const page = this.state.pages[pageIndex];
            // Validate all instances within page
            const result = yield this.validatePage(pageIndex);
            if (!result) {
                return { success: false, pageCount: this.state.pages.length, page };
            }
            const pages = this.state.pages.slice();
            pages.splice(pages.length - 1, 1);
            this.setState({ pages });
            return { success: true, pageCount: pages.length, page };
        });
    }
    /** Closes all pages. true for success, false for failure */
    closeAllPages() {
        return __awaiter(this, void 0, void 0, function* () {
            const pages = this.state.pages.slice();
            while (pages.length > 0) {
                // Validate all instances within page
                const pageIndex = pages.length - 1;
                const result = yield this.validatePage(pageIndex);
                if (!result) {
                    return false;
                }
                pages.splice(pages.length - 1, 1);
            }
            this.setState({ pages: [] });
            return true;
        });
    }
    /** Validates a single page (by pageIndex), showing an error if fails */
    validatePage(pageIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            const validationMessages = [];
            for (const key of Object.keys(this.validationRegistrations)) {
                const value = this.validationRegistrations[key];
                if (value.pageIndex != pageIndex) {
                    continue;
                }
                const msg = yield value.validate();
                if (msg != null) {
                    validationMessages.push(msg);
                }
            }
            if (validationMessages.length > 0) {
                // "" just blocks
                if (lodash_1.default.compact(validationMessages).length > 0) {
                    alert(lodash_1.default.compact(validationMessages).join("\n"));
                }
                return false;
            }
            return true;
        });
    }
    /** Gets the page stack. Last item is top page */
    getPageStack() {
        return this.state.pages;
    }
    renderPage(page, index) {
        // Determine if invisible (behind a normal page)
        let invisible = false;
        for (let i = index + 1; i < this.state.pages.length; i++) {
            if (this.state.pages[i].type === "normal") {
                invisible = true;
            }
        }
        return react_1.default.createElement(SinglePage, { key: index, page: page, index: index, invisible: invisible, baseCtx: this.props.baseCtx, pageStack: this.props.overridePageStack || this, registerChildForValidation: this.registerChildForValidation, handleClose: this.handleClose });
    }
    render() {
        return this.state.pages.map((page, index) => this.renderPage(page, index));
    }
}
exports.PageStackDisplay = PageStackDisplay;
/** Displays a single page of a page stack. Calculates the title appropriately */
function SinglePage(props) {
    const { page, index, handleClose, baseCtx, pageStack, invisible, registerChildForValidation } = props;
    // Lookup widget
    const widgetDef = baseCtx.widgetLibrary.widgets[page.widgetId];
    function renderChildBlock(instanceCtx, childBlockDef) {
        // Create block
        if (childBlockDef) {
            const block = instanceCtx.createBlock(childBlockDef);
            return block.renderInstance(instanceCtx);
        }
        return null;
    }
    // Create outer instanceCtx. Context variables will be injected after
    const outerInstanceCtx = (0, react_1.useMemo)(() => {
        return Object.assign(Object.assign({}, baseCtx), { pageStack: pageStack, contextVars: [], contextVarValues: {}, getContextVarExprValue: () => {
                throw new Error("Non-existant context variable");
            }, onSelectContextVar: () => {
                throw new Error("Non-existant context variable");
            }, setFilter: () => {
                throw new Error("Non-existant context variable");
            }, getFilters: () => {
                throw new Error("Non-existant context variable");
            }, renderChildBlock: renderChildBlock, registerForValidation: registerChildForValidation.bind(null, index) });
    }, []);
    // Get title if specified in the widget definition
    const title = useTitle(widgetDef, page, outerInstanceCtx);
    function renderPageContents() {
        // Case of empty widget
        if (!widgetDef.blockDef) {
            return null;
        }
        const injectedContextVars = (baseCtx.globalContextVars || [])
            .concat(widgetDef.contextVars)
            .concat(widgetDef.privateContextVars || []);
        // Page context var values contains global and context vars. Add private values
        const injectedContextVarValues = Object.assign(Object.assign({}, page.contextVarValues), lodash_1.default.pick(widgetDef.privateContextVarValues || {}, (widgetDef.privateContextVars || []).map((cv) => cv.id)));
        // Wrap in context var injector
        return (react_1.default.createElement(ContextVarsInjector_1.default, { injectedContextVars: injectedContextVars, innerBlock: widgetDef.blockDef, injectedContextVarValues: injectedContextVarValues, instanceCtx: Object.assign(Object.assign({}, outerInstanceCtx), { database: page.database }) }, (innerInstanceCtx, loading, refreshing) => {
            if (loading) {
                return (react_1.default.createElement("div", { style: { color: "#AAA", textAlign: "center" } },
                    react_1.default.createElement("i", { className: "fa fa-circle-o-notch fa-spin" })));
            }
            return renderChildBlock(innerInstanceCtx, widgetDef.blockDef);
        }));
    }
    if (!widgetDef) {
        return react_1.default.createElement("div", { className: "alert alert-danger" }, "Widget not found");
    }
    const contents = renderPageContents();
    switch (page.type) {
        case "normal":
            return (react_1.default.createElement("div", { style: { display: invisible ? "none" : "block" }, key: index, className: `page-${page.widgetId}` },
                react_1.default.createElement(NormalPage, { isFirst: index === 0, onClose: handleClose, key: index, title: title, pageMargins: widgetDef.pageMargins || "normal" }, contents)));
        case "modal":
            return (react_1.default.createElement("div", { style: { display: invisible ? "none" : "block" }, key: index, className: `page-${page.widgetId}` },
                react_1.default.createElement(ModalPage, { onClose: handleClose, key: index, title: title, size: page.modalSize || "normal" }, contents)));
        case "inline":
            return (react_1.default.createElement("div", { style: { display: invisible ? "none" : "block" }, key: index }, contents));
    }
}
/**
 *
 * @param widgetDef Definition of widget
 * @param page Page
 * @param instanceCtx Instance context (without context variables)
 */
function useTitle(widgetDef, page, instanceCtx) {
    // Determine the title
    const [title, setTitle] = (0, react_1.useState)(page.title);
    const contextVars = (instanceCtx.globalContextVars || []).concat(widgetDef.contextVars);
    function determineTitle() {
        return __awaiter(this, void 0, void 0, function* () {
            // Localize string
            const titleTemplate = (0, mwater_expressions_1.localizeString)(widgetDef.title, instanceCtx.locale);
            if (titleTemplate == null) {
                setTitle(undefined);
                return;
            }
            // Temporarily set title with {0}, {1}, etc. for embedded expressions to be replaced
            // by "..."
            setTitle(titleTemplate.replace(/\{(\d+)\}/g, "..."));
            // Get any embedded expression values
            const exprValues = [];
            for (const ee of widgetDef.titleEmbeddedExprs || []) {
                const contextVar = ee.contextVarId ? contextVars.find((cv) => cv.id == ee.contextVarId) : null;
                exprValues.push(yield (0, evalContextVarExpr_1.evalContextVarExpr)({
                    contextVar,
                    contextVarValue: contextVar ? page.contextVarValues[contextVar.id] : null,
                    ctx: instanceCtx,
                    expr: ee.expr
                }));
            }
            // Format and replace
            const formattedTitle = (0, embeddedExprs_1.formatEmbeddedExprString)({
                text: titleTemplate,
                embeddedExprs: widgetDef.titleEmbeddedExprs || [],
                exprValues: exprValues,
                schema: instanceCtx.schema,
                contextVars: instanceCtx.contextVars,
                locale: instanceCtx.locale,
                formatLocale: instanceCtx.formatLocale
            });
            setTitle(formattedTitle);
        });
    }
    // If title is not specified, use widgetDef.title
    (0, react_1.useEffect)(() => {
        if (page.title) {
            return;
        }
        determineTitle().catch((err) => {
            console.error(err);
        });
    }, [page.title]);
    return title;
}
/** Displays a page that is not a modal. Shows the title if present.
 * If the title is present and is not the first page, it may show a back
 * arrow as well.
 */
class NormalPage extends react_1.default.Component {
    render() {
        return (react_1.default.createElement("div", { className: `normal-page normal-page-margins-${this.props.pageMargins}` },
            this.props.title ? (react_1.default.createElement("div", { className: "normal-page-header", key: "header" },
                react_1.default.createElement("h4", null,
                    !this.props.isFirst ? (react_1.default.createElement("i", { className: "normal-page-header-back fa fa-arrow-left fa-fw", onClick: this.props.onClose })) : null,
                    this.props.title))) : null,
            react_1.default.createElement("div", { key: "contents", className: "normal-page-contents" }, this.props.children)));
    }
}
class ModalPage extends react_1.default.Component {
    render() {
        // Map to larger styles, as BS5 has quite small modals
        let size = "normal";
        if (this.props.size == "small") {
            size = "normal";
        }
        else if (this.props.size == "normal") {
            size = "large";
        }
        else if (this.props.size == "large") {
            size = "x-large";
        }
        else if (this.props.size == "full") {
            size = "full";
        }
        return (react_1.default.createElement(ModalPopupComponent_1.default, { onClose: this.props.onClose, size: size, header: this.props.title, showCloseX: true }, this.props.children));
    }
}
