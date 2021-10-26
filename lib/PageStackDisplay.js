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
exports.PageStackDisplay = void 0;
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const ContextVarsInjector_1 = __importDefault(require("./widgets/ContextVarsInjector"));
const ModalPopupComponent_1 = __importDefault(require("react-library/lib/ModalPopupComponent"));
const uuid_1 = __importDefault(require("uuid"));
require("./PageStackDisplay.css");
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
            this.closePage();
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
    /** Close top page. Returns whether successful and pages still open */
    closePage() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.state.pages.length == 0) {
                throw new Error("Zero pages in stack");
            }
            // Validate all instances within page
            const pageIndex = this.state.pages.length - 1;
            const result = yield this.validatePage(pageIndex);
            if (!result) {
                return { success: false, pageCount: this.state.pages.length };
            }
            const pages = this.state.pages.slice();
            pages.splice(pages.length - 1, 1);
            this.setState({ pages });
            return { success: true, pageCount: pages.length };
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
    renderPageContents(page, pageIndex) {
        // Lookup widget
        const widgetDef = this.props.baseCtx.widgetLibrary.widgets[page.widgetId];
        if (!widgetDef) {
            return react_1.default.createElement("div", { className: "alert alert-danger" }, "Widget not found");
        }
        // Case of empty widget
        if (!widgetDef.blockDef) {
            return null;
        }
        // Create outer instanceCtx. Context variables will be injected after
        const outerInstanceCtx = Object.assign(Object.assign({}, this.props.baseCtx), { pageStack: this.props.overridePageStack || this, contextVars: [], contextVarValues: {}, getContextVarExprValue: () => {
                throw new Error("Non-existant context variable");
            }, onSelectContextVar: () => {
                throw new Error("Non-existant context variable");
            }, setFilter: () => {
                throw new Error("Non-existant context variable");
            }, getFilters: () => {
                throw new Error("Non-existant context variable");
            }, renderChildBlock: this.renderChildBlock, registerForValidation: this.registerChildForValidation.bind(null, pageIndex) });
        const injectedContextVars = (this.props.baseCtx.globalContextVars || [])
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
            return this.renderChildBlock(innerInstanceCtx, widgetDef.blockDef);
        }));
    }
    renderPage(page, index) {
        // Determine if invisible (behind a normal page)
        let invisible = false;
        for (let i = index + 1; i < this.state.pages.length; i++) {
            if (this.state.pages[i].type === "normal") {
                invisible = true;
            }
        }
        // Lookup widget
        const widgetDef = this.props.baseCtx.widgetLibrary.widgets[page.widgetId];
        if (!widgetDef) {
            return null;
        }
        const contents = this.renderPageContents(page, index);
        switch (page.type) {
            case "normal":
                return (react_1.default.createElement("div", { style: { display: invisible ? "none" : "block" }, key: index },
                    react_1.default.createElement(NormalPage, { isFirst: index === 0, onClose: this.handleClose, key: index, title: page.title, pageMargins: widgetDef.pageMargins || "normal" }, contents)));
            case "modal":
                return (react_1.default.createElement("div", { style: { display: invisible ? "none" : "block" }, key: index },
                    react_1.default.createElement(ModalPage, { onClose: this.handleClose, key: index, title: page.title, size: page.modalSize || "normal" }, contents)));
            case "inline":
                return (react_1.default.createElement("div", { style: { display: invisible ? "none" : "block" }, key: index }, contents));
        }
    }
    render() {
        return this.state.pages.map((page, index) => this.renderPage(page, index));
    }
}
exports.PageStackDisplay = PageStackDisplay;
class NormalPage extends react_1.default.Component {
    render() {
        return (react_1.default.createElement("div", { className: `normal-page normal-page-margins-${this.props.pageMargins}` },
            !this.props.isFirst || this.props.title ? (react_1.default.createElement("div", { className: "normal-page-header", key: "header" },
                react_1.default.createElement("h4", null,
                    !this.props.isFirst ? (react_1.default.createElement("i", { className: "normal-page-header-back fa fa-arrow-left fa-fw", onClick: this.props.onClose })) : null,
                    this.props.title))) : null,
            react_1.default.createElement("div", { key: "contents", className: "normal-page-contents" }, this.props.children)));
    }
}
class ModalPage extends react_1.default.Component {
    render() {
        return (react_1.default.createElement(ModalPopupComponent_1.default, { onClose: this.props.onClose, size: this.props.size, header: this.props.title, showCloseX: true }, this.props.children));
    }
}
