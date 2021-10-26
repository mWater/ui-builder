"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WidgetLibraryDesigner = void 0;
const react_1 = __importDefault(require("react"));
const uuid_1 = require("uuid");
const widgets_1 = require("../widgets/widgets");
const WidgetDesigner_1 = __importDefault(require("./WidgetDesigner"));
const immer_1 = __importDefault(require("immer"));
const lodash_1 = __importDefault(require("lodash"));
const NewTab_1 = require("./NewTab");
/** Design mode for a library of widgets */
class WidgetLibraryDesigner extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleTabChange = (widgetId, widgetDef) => {
            this.props.onWidgetLibraryChange((0, immer_1.default)(this.props.baseCtx.widgetLibrary, (draft) => {
                draft.widgets[widgetId] = widgetDef;
            }));
        };
        this.handleSelectTab = (index) => {
            this.setState({ activeTabIndex: index });
        };
        this.handleAddWidget = (widgetDef) => {
            const widgetLibrary = (0, immer_1.default)(this.props.baseCtx.widgetLibrary, (draft) => {
                draft.widgets[widgetDef.id] = widgetDef;
            });
            this.props.onWidgetLibraryChange(widgetLibrary);
            this.props.onOpenTabsChange(this.props.openTabs.concat(widgetDef.id));
        };
        this.handleDuplicateWidget = (widgetDef) => {
            const newId = (0, uuid_1.v4)();
            const widgetLibrary = (0, immer_1.default)(this.props.baseCtx.widgetLibrary, (draft) => {
                const newDef = lodash_1.default.cloneDeep(widgetDef);
                newDef.id = newId;
                newDef.name = newDef.name + " (duplicate)";
                newDef.description = newDef.description;
                newDef.group = newDef.group;
                draft.widgets[newId] = newDef;
            });
            this.props.onWidgetLibraryChange(widgetLibrary);
        };
        this.handleCloseTab = (index, ev) => {
            ev.stopPropagation();
            const openTabs = this.props.openTabs.slice();
            openTabs.splice(index, 1);
            this.props.onOpenTabsChange(openTabs);
        };
        this.handleOpenWidget = (widgetId) => {
            this.props.onOpenTabsChange(this.props.openTabs.concat(widgetId));
        };
        this.handleRemoveWidget = (widgetId) => {
            const widget = this.props.baseCtx.widgetLibrary.widgets[widgetId];
            if (!confirm(`Permanently delete ${widget.name} widget?`)) {
                return;
            }
            const widgetLibrary = (0, immer_1.default)(this.props.baseCtx.widgetLibrary, (draft) => {
                delete draft.widgets[widgetId];
            });
            this.props.onOpenTabsChange(lodash_1.default.without(this.props.openTabs, widgetId));
            this.props.onWidgetLibraryChange(widgetLibrary);
        };
        /** Validate a single widget */
        this.validateSingleWidget = (widgetDef) => {
            return (0, widgets_1.validateWidget)(widgetDef, this.props.baseCtx, true);
        };
        this.state = {
            activeTabIndex: 0
        };
    }
    renderTab(index) {
        const activeTabId = this.props.openTabs[index];
        const widgetDef = this.props.baseCtx.widgetLibrary.widgets[activeTabId];
        // For immediately deleted tabs
        if (!widgetDef) {
            return null;
        }
        return (react_1.default.createElement("li", { className: index === this.state.activeTabIndex ? "active" : "", key: index },
            react_1.default.createElement("a", { onClick: this.handleSelectTab.bind(null, index) },
                widgetDef.name,
                "\u00A0",
                react_1.default.createElement("i", { onClick: this.handleCloseTab.bind(null, index), className: "fa fa-remove text-muted" }))));
    }
    renderActiveTabContents() {
        if (this.state.activeTabIndex < this.props.openTabs.length) {
            const activeTabId = this.props.openTabs[this.state.activeTabIndex];
            const widgetDef = this.props.baseCtx.widgetLibrary.widgets[activeTabId];
            // For immediately deleted tabs
            if (!widgetDef) {
                return null;
            }
            return (react_1.default.createElement(WidgetDesigner_1.default, { key: widgetDef.id, widgetDef: widgetDef, baseCtx: this.props.baseCtx, dataSource: this.props.dataSource, blockPaletteEntries: this.props.blockPaletteEntries, onWidgetDefChange: this.handleTabChange.bind(null, activeTabId) }));
        }
        else {
            return (react_1.default.createElement(NewTab_1.NewTab, { widgetLibrary: this.props.baseCtx.widgetLibrary, onAddWidget: this.handleAddWidget, onOpenWidget: this.handleOpenWidget, onRemoveWidget: this.handleRemoveWidget, onDuplicateWidget: this.handleDuplicateWidget, validateWidget: this.validateSingleWidget }));
        }
    }
    render() {
        return (react_1.default.createElement("div", { style: { height: "100%", display: "grid", gridTemplateRows: "auto 1fr" } },
            react_1.default.createElement("ul", { className: "nav nav-tabs", style: { marginBottom: 5 } },
                this.props.openTabs.map((tab, index) => this.renderTab(index)),
                react_1.default.createElement("li", { className: this.state.activeTabIndex >= this.props.openTabs.length ? "active" : "", key: "new" },
                    react_1.default.createElement("a", { onClick: this.handleSelectTab.bind(null, this.props.openTabs.length) },
                        react_1.default.createElement("i", { className: "fa fa-plus" })))),
            this.renderActiveTabContents()));
    }
}
exports.WidgetLibraryDesigner = WidgetLibraryDesigner;
