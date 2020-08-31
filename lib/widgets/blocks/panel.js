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
var _ = __importStar(require("lodash"));
var blocks_1 = require("../blocks");
var immer_1 = __importDefault(require("immer"));
var PanelBlock = /** @class */ (function (_super) {
    __extends(PanelBlock, _super);
    function PanelBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PanelBlock.prototype.getChildren = function (contextVars) {
        // Get for all cells
        return _.compact([this.blockDef.mainContent, this.blockDef.headerContent, this.blockDef.footerContent]).map(function (bd) { return ({ blockDef: bd, contextVars: contextVars }); });
    };
    PanelBlock.prototype.validate = function () { return null; };
    PanelBlock.prototype.processChildren = function (action) {
        var _this = this;
        return immer_1.default(this.blockDef, function (draft) {
            draft.mainContent = action(_this.blockDef.mainContent);
            if (_this.blockDef.headerContent) {
                draft.headerContent = action(_this.blockDef.headerContent);
            }
            if (_this.blockDef.footerContent) {
                draft.footerContent = action(_this.blockDef.footerContent);
            }
        });
    };
    PanelBlock.prototype.renderDesign = function (props) {
        var _this = this;
        var handleSetMainContent = function (blockDef) {
            props.store.alterBlock(_this.id, immer_1.default(function (b) {
                b.mainContent = blockDef;
            }), blockDef.id);
        };
        var handleSetHeaderContent = function (blockDef) {
            props.store.alterBlock(_this.id, immer_1.default(function (b) {
                b.headerContent = blockDef;
            }), blockDef.id);
        };
        var handleSetFooterContent = function (blockDef) {
            props.store.alterBlock(_this.id, immer_1.default(function (b) {
                b.footerContent = blockDef;
            }), blockDef.id);
        };
        var mainContentNode = props.renderChildBlock(props, this.blockDef.mainContent, handleSetMainContent);
        var headerContentNode = this.blockDef.headerContent !== undefined ? props.renderChildBlock(props, this.blockDef.headerContent, handleSetHeaderContent) : null;
        var footerContentNode = this.blockDef.footerContent !== undefined ? props.renderChildBlock(props, this.blockDef.footerContent, handleSetFooterContent) : null;
        return React.createElement(PanelComponent, { header: headerContentNode, main: mainContentNode, footer: footerContentNode });
    };
    PanelBlock.prototype.renderInstance = function (props) {
        var mainContentNode = props.renderChildBlock(props, this.blockDef.mainContent);
        var headerContentNode = props.renderChildBlock(props, this.blockDef.headerContent || null);
        var footerContentNode = props.renderChildBlock(props, this.blockDef.footerContent || null);
        return React.createElement(PanelComponent, { header: headerContentNode, main: mainContentNode, footer: footerContentNode });
    };
    PanelBlock.prototype.renderEditor = function (props) {
        var _this = this;
        var showHeader = function () { props.store.replaceBlock(__assign(__assign({}, _this.blockDef), { headerContent: null })); };
        var hideHeader = function () { props.store.replaceBlock(__assign(__assign({}, _this.blockDef), { headerContent: undefined })); };
        var showFooter = function () { props.store.replaceBlock(__assign(__assign({}, _this.blockDef), { footerContent: null })); };
        var hideFooter = function () { props.store.replaceBlock(__assign(__assign({}, _this.blockDef), { footerContent: undefined })); };
        return (React.createElement("div", null,
            React.createElement("div", null, this.blockDef.headerContent === undefined
                ? React.createElement("button", { className: "btn btn-link", onClick: showHeader }, "Show Header")
                : React.createElement("button", { className: "btn btn-link", onClick: hideHeader }, "Hide Header")),
            React.createElement("div", null, this.blockDef.footerContent === undefined
                ? React.createElement("button", { className: "btn btn-link", onClick: showFooter }, "Show Footer")
                : React.createElement("button", { className: "btn btn-link", onClick: hideFooter }, "Hide Footer"))));
    };
    return PanelBlock;
}(blocks_1.Block));
exports.PanelBlock = PanelBlock;
var PanelComponent = function (props) {
    return (React.createElement("div", { className: "panel panel-default" },
        props.header ?
            React.createElement("div", { className: "panel-heading" }, props.header)
            : null,
        React.createElement("div", { className: "panel-body" }, props.main),
        props.footer ?
            React.createElement("div", { className: "panel-footer" }, props.footer)
            : null));
};
