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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageStackDisplay = void 0;
var lodash_1 = __importDefault(require("lodash"));
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
        return __awaiter(this, void 0, void 0, function () {
            var pageIndex, result, pages;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.state.pages.length == 0) {
                            throw new Error("Zero pages in stack");
                        }
                        pageIndex = this.state.pages.length - 1;
                        return [4 /*yield*/, this.validatePage(pageIndex)];
                    case 1:
                        result = _a.sent();
                        if (!result) {
                            return [2 /*return*/, false];
                        }
                        pages = this.state.pages.slice();
                        pages.splice(pages.length - 1, 1);
                        pages.push(page);
                        this.setState({ pages: pages });
                        return [2 /*return*/, true];
                }
            });
        });
    };
    /** Close top page. Returns whether successful and pages still open */
    PageStackDisplay.prototype.closePage = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pageIndex, result, pages;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.state.pages.length == 0) {
                            throw new Error("Zero pages in stack");
                        }
                        pageIndex = this.state.pages.length - 1;
                        return [4 /*yield*/, this.validatePage(pageIndex)];
                    case 1:
                        result = _a.sent();
                        if (!result) {
                            return [2 /*return*/, { success: false, pageCount: this.state.pages.length }];
                        }
                        pages = this.state.pages.slice();
                        pages.splice(pages.length - 1, 1);
                        this.setState({ pages: pages });
                        return [2 /*return*/, { success: true, pageCount: pages.length }];
                }
            });
        });
    };
    PageStackDisplay.prototype.closeAllPages = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pages, pageIndex, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pages = this.state.pages.slice();
                        _a.label = 1;
                    case 1:
                        if (!(pages.length > 0)) return [3 /*break*/, 3];
                        pageIndex = pages.length - 1;
                        return [4 /*yield*/, this.validatePage(pageIndex)];
                    case 2:
                        result = _a.sent();
                        if (!result) {
                            return [2 /*return*/, false];
                        }
                        pages.splice(pages.length - 1, 1);
                        return [3 /*break*/, 1];
                    case 3:
                        this.setState({ pages: [] });
                        return [2 /*return*/, true];
                }
            });
        });
    };
    /** Validates a single page (by pageIndex), showing an error if fails */
    PageStackDisplay.prototype.validatePage = function (pageIndex) {
        return __awaiter(this, void 0, void 0, function () {
            var validationMessages, _i, _a, key, value, msg;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        validationMessages = [];
                        _i = 0, _a = Object.keys(this.validationRegistrations);
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        key = _a[_i];
                        value = this.validationRegistrations[key];
                        if (value.pageIndex != pageIndex) {
                            return [3 /*break*/, 3];
                        }
                        return [4 /*yield*/, value.validate()];
                    case 2:
                        msg = _b.sent();
                        if (msg != null) {
                            validationMessages.push(msg);
                        }
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        if (validationMessages.length > 0) {
                            // "" just blocks
                            if (lodash_1.default.compact(validationMessages).length > 0) {
                                alert(lodash_1.default.compact(validationMessages).join("\n"));
                            }
                            return [2 /*return*/, false];
                        }
                        return [2 /*return*/, true];
                }
            });
        });
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
        var injectedContextVars = (this.props.baseCtx.globalContextVars || [])
            .concat(widgetDef.contextVars)
            .concat(widgetDef.privateContextVars || []);
        // Page context var values contains global and context vars. Add private values
        var injectedContextVarValues = __assign(__assign({}, page.contextVarValues), (lodash_1.default.pick(widgetDef.privateContextVarValues || {}, (widgetDef.privateContextVars || []).map(function (cv) { return cv.id; }))));
        // Wrap in context var injector
        return React.createElement(ContextVarsInjector_1.default, { injectedContextVars: injectedContextVars, innerBlock: widgetDef.blockDef, injectedContextVarValues: injectedContextVarValues, instanceCtx: __assign(__assign({}, outerInstanceCtx), { database: page.database }) }, function (innerInstanceCtx, loading, refreshing) {
            if (loading) {
                return React.createElement("div", { style: { color: "#AAA", textAlign: "center" } },
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
                    React.createElement(ModalPage, { onClose: this.handleClose, key: index, title: page.title, size: page.modalSize || "normal" }, contents)));
            case "inline":
                return (React.createElement("div", { style: { display: invisible ? "none" : "block" }, key: index }, contents));
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
        return (React.createElement(ModalPopupComponent_1.default, { onClose: this.props.onClose, size: this.props.size, header: this.props.title }, this.props.children));
    };
    return ModalPage;
}(React.Component));
