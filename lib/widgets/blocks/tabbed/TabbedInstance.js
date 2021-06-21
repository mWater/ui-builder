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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TabbedInstance = void 0;
const react_1 = __importStar(require("react"));
const _ = __importStar(require("lodash"));
const localization_1 = require("../../localization");
const hooks_1 = require("../../../hooks");
function TabbedInstance(props) {
    /** Index of currently active tab */
    const [activeIndex, setActiveIndex] = react_1.useState(0);
    /** List of indexes of open tabs. This is to *not* render tabs that have not been opened, as maps in particular
     * don't handle rendering when invisible.
     */
    const [openTabIndexes, setOpenTabIndexes] = react_1.useState([0]);
    // Store overall page width and update it
    const pageWidth = hooks_1.usePageWidth();
    function handleSelectTab(index) {
        setActiveIndex(index);
        setOpenTabIndexes(openTabIndexes => _.union(openTabIndexes, [index]));
    }
    function renderTab(tab, index) {
        const labelText = localization_1.localize(tab.label, props.instanceCtx.locale);
        return (react_1.default.createElement("li", { className: (activeIndex === index) ? "active" : "", key: index },
            react_1.default.createElement("a", { onClick: handleSelectTab.bind(null, index), style: { cursor: "pointer" } }, labelText)));
    }
    function renderTabContent(tab, index) {
        // If not opened, do not render
        if (!openTabIndexes.includes(index)) {
            return null;
        }
        const content = props.instanceCtx.renderChildBlock(props.instanceCtx, tab.content);
        return (react_1.default.createElement("div", { key: index, style: { display: (activeIndex === index) ? "block" : "none" } }, content));
    }
    // If below minimum, use collapsed view
    if (props.blockDef.collapseWidth != null && pageWidth <= props.blockDef.collapseWidth) {
        function getTabLabel(tab) {
            return localization_1.localize(tab.label, props.instanceCtx.locale);
        }
        // Get current tab label
        const labelText = getTabLabel(props.blockDef.tabs[activeIndex]);
        return (react_1.default.createElement("div", { style: { paddingTop: 5, paddingBottom: 5 } },
            react_1.default.createElement("div", { className: "btn-group", key: "selector", style: { marginBottom: 10 } },
                react_1.default.createElement("button", { type: "button", className: "btn btn-default dropdown-toggle", "data-toggle": "dropdown" },
                    labelText,
                    " ",
                    react_1.default.createElement("i", { className: "fa fa-caret-down" })),
                react_1.default.createElement("ul", { className: "dropdown-menu" }, props.blockDef.tabs.map((tab, index) => {
                    return react_1.default.createElement("li", { key: index },
                        react_1.default.createElement("a", { onClick: handleSelectTab.bind(null, index) }, getTabLabel(tab)));
                }))),
            props.blockDef.tabs.map((tab, index) => renderTabContent(tab, index))));
    }
    // Render tabs
    return (react_1.default.createElement("div", { style: { paddingTop: 5, paddingBottom: 5 } },
        react_1.default.createElement("ul", { className: "nav nav-tabs", style: { marginBottom: 5 } }, props.blockDef.tabs.map((tab, index) => renderTab(tab, index))),
        props.blockDef.tabs.map((tab, index) => renderTabContent(tab, index))));
}
exports.TabbedInstance = TabbedInstance;
