"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var immer_1 = __importDefault(require("immer"));
var localization_1 = require("../../localization");
var TabbedDesigner = /** @class */ (function (_super) {
    __extends(TabbedDesigner, _super);
    function TabbedDesigner(props) {
        var _this = _super.call(this, props) || this;
        /** Handle adding a block to a tab */
        _this.handleAddContent = function (tabIndex, addedBlockDef) {
            _this.props.renderDesignProps.store.alterBlock(_this.props.tabbedBlockDef.id, immer_1.default(function (b) {
                b.tabs[tabIndex].content = addedBlockDef;
                return b;
            }), addedBlockDef.id);
        };
        _this.handleSelectTab = function (index) {
            _this.setState({ activeIndex: index });
        };
        _this.state = {
            activeIndex: 0
        };
        return _this;
    }
    TabbedDesigner.prototype.renderTab = function (tab, index) {
        var labelText = localization_1.localize(tab.label, this.props.renderDesignProps.locale);
        return (react_1.default.createElement("li", { className: (this.state.activeIndex === index) ? "active" : "", key: index },
            react_1.default.createElement("a", { onClick: this.handleSelectTab.bind(null, index) }, labelText)));
    };
    TabbedDesigner.prototype.render = function () {
        var _this = this;
        var activeTab = this.props.tabbedBlockDef.tabs[this.state.activeIndex];
        var activeTabContent = activeTab ?
            this.props.renderDesignProps.renderChildBlock(this.props.renderDesignProps, activeTab.content, this.handleAddContent.bind(null, this.state.activeIndex))
            : null;
        // Render tabs
        return (react_1.default.createElement("div", { style: { paddingTop: 5, paddingBottom: 5 } },
            react_1.default.createElement("ul", { className: "nav nav-tabs", style: { marginBottom: 5 } }, this.props.tabbedBlockDef.tabs.map(function (tab, index) { return _this.renderTab(tab, index); })),
            activeTabContent));
    };
    return TabbedDesigner;
}(react_1.default.Component));
exports.default = TabbedDesigner;
//# sourceMappingURL=TabbedDesigner.js.map