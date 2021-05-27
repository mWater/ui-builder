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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const _ = __importStar(require("lodash"));
const localization_1 = require("../../localization");
class TabbedInstance extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleSelectTab = (index) => {
            this.setState({
                activeIndex: index,
                openTabIndexes: _.union(this.state.openTabIndexes, [index])
            });
        };
        this.state = {
            activeIndex: 0,
            openTabIndexes: [0]
        };
    }
    renderTab(tab, index) {
        const labelText = localization_1.localize(tab.label, this.props.instanceCtx.locale);
        return (react_1.default.createElement("li", { className: (this.state.activeIndex === index) ? "active" : "", key: index },
            react_1.default.createElement("a", { onClick: this.handleSelectTab.bind(null, index), style: { cursor: "pointer" } }, labelText)));
    }
    renderTabContent(tab, index) {
        // If not opened, do not render
        if (!this.state.openTabIndexes.includes(index)) {
            return null;
        }
        const content = this.props.instanceCtx.renderChildBlock(this.props.instanceCtx, tab.content);
        return (react_1.default.createElement("div", { key: index, style: { display: (this.state.activeIndex === index) ? "block" : "none" } }, content));
    }
    render() {
        // Render tabs
        return (react_1.default.createElement("div", { style: { paddingTop: 5, paddingBottom: 5 } },
            react_1.default.createElement("ul", { className: "nav nav-tabs", style: { marginBottom: 5 } }, this.props.tabbedBlockDef.tabs.map((tab, index) => this.renderTab(tab, index))),
            this.props.tabbedBlockDef.tabs.map((tab, index) => this.renderTabContent(tab, index))));
    }
}
exports.default = TabbedInstance;
