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
/** Maintains and displays the stack of pages, including modals.  */
var PageStackDisplay = /** @class */ (function (_super) {
    __extends(PageStackDisplay, _super);
    function PageStackDisplay(props) {
        var _this = _super.call(this, props) || this;
        _this.refHandler = function (key, component) {
            if (component) {
                _this.instanceRefs[key] = component;
            }
            else {
                delete _this.instanceRefs[key];
            }
        };
        _this.renderChildBlock = function (page, pageIndex, props, childBlockDef, instanceId) {
            // Create block
            if (childBlockDef) {
                var block = _this.props.createBlock(childBlockDef);
                var elem = block.renderInstance(props);
                // Add ref to element
                var key = instanceId ? pageIndex + ":" + childBlockDef.id + ":" + instanceId : pageIndex + ":" + childBlockDef.id;
                var refedElem = React.cloneElement(elem, __assign(__assign({}, elem.props), { ref: _this.refHandler.bind(null, key) }));
                return refedElem;
            }
            else {
                return null;
            }
        };
        _this.handleClose = function () {
            _this.closePage();
        };
        // Display initial page
        _this.state = {
            pages: [props.initialPage]
        };
        _this.instanceRefs = {};
        return _this;
    }
    PageStackDisplay.prototype.openPage = function (page) {
        this.setState({ pages: this.state.pages.concat(page) });
    };
    PageStackDisplay.prototype.closePage = function () {
        // Validate all instances within page
        var pageIndex = this.state.pages.length - 1;
        var validationMessages = [];
        for (var _i = 0, _a = Object.keys(this.instanceRefs); _i < _a.length; _i++) {
            var key = _a[_i];
            if (!key.startsWith(pageIndex + ":")) {
                continue;
            }
            var component = this.instanceRefs[key];
            if (component.validate) {
                var msg = component.validate();
                if (msg != null) {
                    validationMessages.push(msg);
                }
            }
        }
        if (validationMessages.length > 0) {
            // "" just blocks
            if (_.compact(validationMessages).length > 0) {
                alert(_.compact(validationMessages).join("\n"));
            }
            return;
        }
        var pages = this.state.pages.slice();
        pages.splice(pages.length - 1, 1);
        this.setState({ pages: pages });
    };
    PageStackDisplay.prototype.renderPageContents = function (page, pageIndex) {
        var _this = this;
        // Lookup widget
        var widgetDef = this.props.widgetLibrary.widgets[page.widgetId];
        if (!widgetDef) {
            return React.createElement("div", { className: "alert alert-danger" }, "Widget not found");
        }
        // Case of empty widget
        if (!widgetDef.blockDef) {
            return null;
        }
        // Create outer renderInstanceProps. Context variables will be injected after
        var outerRenderInstanceProps = {
            locale: this.props.locale,
            database: page.database,
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            actionLibrary: this.props.actionLibrary,
            widgetLibrary: this.props.widgetLibrary,
            pageStack: this,
            contextVars: [],
            contextVarValues: {},
            getContextVarExprValue: function (contextVarId, expr) { throw new Error("Non-existant context variable"); },
            onSelectContextVar: function (contextVarId, primaryKey) { throw new Error("Non-existant context variable"); },
            setFilter: function (contextVarId, filter) { throw new Error("Non-existant context variable"); },
            getFilters: function (contextVarId) { throw new Error("Non-existant context variable"); },
            renderChildBlock: this.renderChildBlock.bind(null, page, pageIndex)
        };
        // Wrap in context var injector
        return React.createElement(ContextVarsInjector_1.default, { injectedContextVars: widgetDef.contextVars, createBlock: this.props.createBlock, innerBlock: widgetDef.blockDef, injectedContextVarValues: page.contextVarValues, renderInstanceProps: outerRenderInstanceProps, schema: this.props.schema, database: page.database }, function (innerRenderInstanceProps, loading, refreshing) {
            if (loading) {
                return React.createElement("div", { style: { color: "#AAA", fontSize: 18, textAlign: "center" } },
                    React.createElement("i", { className: "fa fa-circle-o-notch fa-spin" }));
            }
            return (React.createElement("div", { style: { opacity: refreshing ? 0.6 : undefined } }, _this.renderChildBlock(page, pageIndex, innerRenderInstanceProps, widgetDef.blockDef)));
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
                    React.createElement(NormalPage, { isFirst: index === 0, onClose: this.handleClose, key: index }, contents)));
            case "modal":
                return (React.createElement("div", { style: { display: invisible ? "none" : "block" }, key: index },
                    React.createElement(ModalPage, { onClose: this.handleClose, key: index }, contents)));
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
            React.createElement("div", { key: "header", className: "normal-page-header" }, !this.props.isFirst ?
                React.createElement("i", { className: "fa fa-arrow-left", onClick: this.props.onClose })
                : null),
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
        return (React.createElement(ModalPopupComponent_1.default, { onClose: this.props.onClose, size: "large" }, this.props.children));
    };
    return ModalPage;
}(React.Component));
