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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var _ = __importStar(require("lodash"));
var localization_1 = require("../../localization");
var TabbedInstance = /** @class */ (function (_super) {
    __extends(TabbedInstance, _super);
    function TabbedInstance(props) {
        var _this = _super.call(this, props) || this;
        _this.handleSelectTab = function (index) {
            _this.setState({
                activeIndex: index,
                openTabIndexes: _.union(_this.state.openTabIndexes, [index])
            });
        };
        _this.state = {
            activeIndex: 0,
            openTabIndexes: [0]
        };
        return _this;
    }
    TabbedInstance.prototype.renderTab = function (tab, index) {
        var labelText = localization_1.localize(tab.label, this.props.instanceCtx.locale);
        return (react_1.default.createElement("li", { className: (this.state.activeIndex === index) ? "active" : "", key: index },
            react_1.default.createElement("a", { onClick: this.handleSelectTab.bind(null, index), style: { cursor: "pointer" } }, labelText)));
    };
    TabbedInstance.prototype.renderTabContent = function (tab, index) {
        // If not opened, do not render
        if (!this.state.openTabIndexes.includes(index)) {
            return null;
        }
        var content = this.props.instanceCtx.renderChildBlock(this.props.instanceCtx, tab.content);
        return (react_1.default.createElement("div", { key: index, style: { display: (this.state.activeIndex === index) ? "block" : "none" } }, content));
    };
    TabbedInstance.prototype.render = function () {
        var _this = this;
        // Render tabs
        return (react_1.default.createElement("div", { style: { paddingTop: 5, paddingBottom: 5 } },
            react_1.default.createElement("ul", { className: "nav nav-tabs", style: { marginBottom: 5 } }, this.props.tabbedBlockDef.tabs.map(function (tab, index) { return _this.renderTab(tab, index); })),
            this.props.tabbedBlockDef.tabs.map(function (tab, index) { return _this.renderTabContent(tab, index); })));
    };
    return TabbedInstance;
}(react_1.default.Component));
exports.default = TabbedInstance;
