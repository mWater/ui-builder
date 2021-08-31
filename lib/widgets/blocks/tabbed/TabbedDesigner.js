"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const immer_1 = __importDefault(require("immer"));
const localization_1 = require("../../localization");
class TabbedDesigner extends react_1.default.Component {
    constructor(props) {
        super(props);
        /** Handle adding a block to a tab */
        this.handleAddContent = (tabIndex, addedBlockDef) => {
            this.props.designCtx.store.alterBlock(this.props.tabbedBlockDef.id, (0, immer_1.default)((b) => {
                b.tabs[tabIndex].content = addedBlockDef;
                return b;
            }), addedBlockDef.id);
        };
        this.handleSelectTab = (index) => {
            this.setState({ activeIndex: index });
        };
        this.state = {
            activeIndex: 0
        };
    }
    renderTab(tab, index) {
        const labelText = (0, localization_1.localize)(tab.label, this.props.designCtx.locale);
        return (react_1.default.createElement("li", { className: (this.state.activeIndex === index) ? "active" : "", key: index },
            react_1.default.createElement("a", { onClick: this.handleSelectTab.bind(null, index) }, labelText)));
    }
    render() {
        const activeTab = this.props.tabbedBlockDef.tabs[this.state.activeIndex];
        const activeTabContent = activeTab ?
            this.props.designCtx.renderChildBlock(this.props.designCtx, activeTab.content, this.handleAddContent.bind(null, this.state.activeIndex))
            : null;
        // Render tabs
        return (react_1.default.createElement("div", { style: { paddingTop: 5, paddingBottom: 5 } },
            react_1.default.createElement("ul", { className: "nav nav-tabs", style: { marginBottom: 5 } }, this.props.tabbedBlockDef.tabs.map((tab, index) => this.renderTab(tab, index))),
            activeTabContent));
    }
}
exports.default = TabbedDesigner;
