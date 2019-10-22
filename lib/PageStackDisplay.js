"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = __importStar(require("react"));
var ContextVarsInjector_1 = __importDefault(require("./widgets/ContextVarsInjector"));
var ModalPopupComponent_1 = __importDefault(require("react-library/lib/ModalPopupComponent"));
require("./PageStackDisplay.css");
var uuid = require("uuid");
/** Maintains and displays the stack of pages, including modals.  */
var PageStackDisplay = /** @class */ (function (_super) {
    __extends(PageStackDisplay, _super);
    function PageStackDisplay(props) {
        var _this = _super.call(this, props) || this;
        _this.renderChildBlock = function (instanceCtx, childBlockDef) {
            // Create block
            if (childBlockDef) {
                var block = instanceCtx.createBlock(childBlockDef);
                return block.renderInstance(instanceCtx);
            }
            return null;
        };
        _this.handleClose = function () {
            _this.closePage();
        };
        /** Stores the registration for validation of a child block and returns an unregister function */
        _this.registerChildForValidation = function (pageIndex, validate) {
            var key = uuid();
            _this.validationRegistrations[key] = { pageIndex: pageIndex, validate: validate };
            return function () {
                delete _this.validationRegistrations[key];
            };
        };
        // Display initial page
        _this.state = {
            pages: [props.initialPage]
        };
        _this.validationRegistrations = {};
        return _this;
    }
    PageStackDisplay.prototype.openPage = function (page) {
        this.setState({ pages: this.state.pages.concat(page) });
    };
    /** Replace current page with specified one */
    PageStackDisplay.prototype.replacePage = function (page) {
        if (this.state.pages.length == 0) {
            throw new Error("Zero pages in stack");
        }
        // Validate all instances within page
        var pageIndex = this.state.pages.length - 1;
        var result = this.validatePage(pageIndex);
        if (!result) {
            return false;
        }
        var pages = this.state.pages.slice();
        pages.splice(pages.length - 1, 1);
        pages.push(page);
        this.setState({ pages: pages });
        return true;
    };
    /** Close top page. Returns whether successful and pages still open */
    PageStackDisplay.prototype.closePage = function () {
        if (this.state.pages.length == 0) {
            throw new Error("Zero pages in stack");
        }
        // Validate all instances within page
        var pageIndex = this.state.pages.length - 1;
        var result = this.validatePage(pageIndex);
        if (!result) {
            return { success: false, pageCount: this.state.pages.length };
        }
        var pages = this.state.pages.slice();
        pages.splice(pages.length - 1, 1);
        this.setState({ pages: pages });
        return { success: true, pageCount: pages.length };
    };
    PageStackDisplay.prototype.closeAllPages = function () {
        var pages = this.state.pages.slice();
        while (pages.length > 0) {
            // Validate all instances within page
            var pageIndex = pages.length - 1;
            var result = this.validatePage(pageIndex);
            if (!result) {
                return false;
            }
            pages.splice(pages.length - 1, 1);
        }
        this.setState({ pages: [] });
        return true;
    };
    /** Validates a single page (by pageIndex), showing an error if fails */
    PageStackDisplay.prototype.validatePage = function (pageIndex) {
        var validationMessages = [];
        for (var _i = 0, _a = Object.keys(this.validationRegistrations); _i < _a.length; _i++) {
            var key = _a[_i];
            var value = this.validationRegistrations[key];
            if (value.pageIndex != pageIndex) {
                continue;
            }
            var msg = value.validate();
            if (msg != null) {
                validationMessages.push(msg);
            }
        }
        if (validationMessages.length > 0) {
            // "" just blocks
            if (_.compact(validationMessages).length > 0) {
                alert(_.compact(validationMessages).join("\n"));
            }
            return false;
        }
        return true;
    };
    PageStackDisplay.prototype.renderPageContents = function (page, pageIndex) {
        var _this = this;
        // Lookup widget
        var widgetDef = this.props.baseCtx.widgetLibrary.widgets[page.widgetId];
        if (!widgetDef) {
            return React.createElement("div", { className: "alert alert-danger" }, "Widget not found");
        }
        // Case of empty widget
        if (!widgetDef.blockDef) {
            return null;
        }
        // Create outer instanceCtx. Context variables will be injected after
        var outerInstanceCtx = __assign(__assign({}, this.props.baseCtx), { pageStack: this, contextVars: [], contextVarValues: {}, getContextVarExprValue: function () { throw new Error("Non-existant context variable"); }, onSelectContextVar: function () { throw new Error("Non-existant context variable"); }, setFilter: function () { throw new Error("Non-existant context variable"); }, getFilters: function () { throw new Error("Non-existant context variable"); }, renderChildBlock: this.renderChildBlock, registerForValidation: this.registerChildForValidation.bind(null, pageIndex) });
        // Wrap in context var injector
        return React.createElement(ContextVarsInjector_1.default, { injectedContextVars: widgetDef.contextVars, innerBlock: widgetDef.blockDef, injectedContextVarValues: page.contextVarValues, instanceCtx: __assign(__assign({}, outerInstanceCtx), { database: page.database }) }, function (innerInstanceCtx, loading, refreshing) {
            if (loading) {
                return React.createElement("div", { style: { color: "#AAA", fontSize: 18, textAlign: "center" } },
                    React.createElement("i", { className: "fa fa-circle-o-notch fa-spin" }));
            }
            return (React.createElement("div", { style: { opacity: refreshing ? 0.6 : undefined } }, _this.renderChildBlock(innerInstanceCtx, widgetDef.blockDef)));
        });
    };
    PageStackDisplay.prototype.renderPage = function (page, index) {
        // Determine if invisible (behind a normal page)
        var invisible = false;
        for (var i = index + 1; i < this.state.pages.length; i++) {
            if (this.state.pages[i].type === "normal") {
                invisible = true;
            }
        }
        var contents = this.renderPageContents(page, index);
        switch (page.type) {
            case "normal":
                return (React.createElement("div", { style: { display: invisible ? "none" : "block" }, key: index },
                    React.createElement(NormalPage, { isFirst: index === 0, onClose: this.handleClose, key: index, title: page.title }, contents)));
            case "modal":
                return (React.createElement("div", { style: { display: invisible ? "none" : "block" }, key: index },
                    React.createElement(ModalPage, { onClose: this.handleClose, key: index, title: page.title }, contents)));
        }
    };
    PageStackDisplay.prototype.render = function () {
        var _this = this;
        return this.state.pages.map(function (page, index) { return _this.renderPage(page, index); });
    };
    return PageStackDisplay;
}(React.Component));
exports.PageStackDisplay = PageStackDisplay;
var NormalPage = /** @class */ (function (_super) {
    __extends(NormalPage, _super);
    function NormalPage() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NormalPage.prototype.render = function () {
        return (React.createElement("div", { className: "normal-page" },
            !this.props.isFirst || this.props.title ?
                React.createElement("div", { className: "normal-page-header", key: "header" },
                    React.createElement("h4", null,
                        !this.props.isFirst ?
                            React.createElement("i", { className: "normal-page-header-back fa fa-arrow-left fa-fw", onClick: this.props.onClose })
                            : null,
                        this.props.title))
                : null,
            React.createElement("div", { key: "contents", className: "normal-page-contents" }, this.props.children)));
    };
    return NormalPage;
}(React.Component));
var ModalPage = /** @class */ (function (_super) {
    __extends(ModalPage, _super);
    function ModalPage() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ModalPage.prototype.render = function () {
        return (React.createElement(ModalPopupComponent_1.default, { onClose: this.props.onClose, size: "large", header: this.props.title }, this.props.children));
    };
    return ModalPage;
}(React.Component));
