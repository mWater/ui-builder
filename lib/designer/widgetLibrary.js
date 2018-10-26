import * as React from "react";
import { v4 as uuid } from 'uuid';
import WidgetDesigner from "./WidgetDesigner";
import produce from "immer";
import * as _ from "lodash";
/** Design mode for a library of widgets */
export default class WidgetLibraryDesigner extends React.Component {
    constructor(props) {
        super(props);
        this.handleTabChange = (widgetId, widgetDef) => {
            this.props.onWidgetLibraryChange(produce(this.props.widgetLibrary, (draft) => {
                draft.widgets[widgetId] = widgetDef;
            }));
        };
        this.handleSelectTab = (index) => {
            this.setState({ activeTabIndex: index });
        };
        this.handleAddWidget = (widgetDef) => {
            const widgetLibrary = produce(this.props.widgetLibrary, (draft) => {
                draft.widgets[widgetDef.id] = widgetDef;
            });
            this.props.onWidgetLibraryChange(widgetLibrary);
            this.props.onOpenTabsChange(this.props.openTabs.concat(widgetDef.id));
        };
        this.handleCloseTab = (index) => {
            const openTabs = this.props.openTabs.slice();
            openTabs.splice(index, 1);
            this.props.onOpenTabsChange(openTabs);
        };
        this.handleOpenWidget = (widgetId) => {
            this.props.onOpenTabsChange(this.props.openTabs.concat(widgetId));
        };
        this.handleRemoveWidget = (widgetId) => {
            if (!confirm("Permanently delete widget?")) {
                return;
            }
            const widgetLibrary = produce(this.props.widgetLibrary, (draft) => {
                delete draft.widgets[widgetId];
            });
            this.props.onOpenTabsChange(_.without(this.props.openTabs, widgetId));
            this.props.onWidgetLibraryChange(widgetLibrary);
        };
        this.state = {
            activeTabIndex: 0
        };
    }
    renderTab(tab, index) {
        const activeTabId = this.props.openTabs[index];
        const widgetDef = this.props.widgetLibrary.widgets[activeTabId];
        // For immediately deleted tabs
        if (!widgetDef) {
            return null;
        }
        return (React.createElement("li", { className: (index === this.state.activeTabIndex) ? "active" : "", key: index },
            React.createElement("a", { onClick: this.handleSelectTab.bind(null, index) },
                widgetDef.name,
                "\u00A0",
                (index === this.state.activeTabIndex) ? React.createElement("i", { onClick: this.handleCloseTab.bind(null, index), className: "fa fa-remove text-muted" }) : null)));
    }
    renderActiveTabContents() {
        if (this.state.activeTabIndex < this.props.openTabs.length) {
            const activeTabId = this.props.openTabs[this.state.activeTabIndex];
            const widgetDef = this.props.widgetLibrary.widgets[activeTabId];
            // For immediately deleted tabs
            if (!widgetDef) {
                return null;
            }
            return React.createElement(WidgetTab, { key: widgetDef.id, widgetDef: widgetDef, createBlock: this.props.blockFactory.createBlock, database: this.props.database, schema: this.props.schema, dataSource: this.props.dataSource, actionLibrary: this.props.actionLibrary, widgetLibrary: this.props.widgetLibrary, blockPaletteEntries: this.props.blockPaletteEntries, onWidgetDefChange: this.handleTabChange.bind(null, activeTabId) });
        }
        else {
            return React.createElement(NewTab, { widgetLibrary: this.props.widgetLibrary, onAddWidget: this.handleAddWidget, onOpenWidget: this.handleOpenWidget, onRemoveWidget: this.handleRemoveWidget });
        }
    }
    render() {
        return (React.createElement("div", { style: { height: "100%" } },
            React.createElement("ul", { className: "nav nav-tabs", style: { marginBottom: 5 } },
                this.props.openTabs.map((tab, index) => this.renderTab(tab, index)),
                React.createElement("li", { className: (this.state.activeTabIndex >= this.props.openTabs.length) ? "active" : "", key: "new" },
                    React.createElement("a", { onClick: this.handleSelectTab.bind(null, this.props.openTabs.length) },
                        React.createElement("i", { className: "fa fa-plus" })))),
            this.renderActiveTabContents()));
    }
}
class WidgetTab extends React.Component {
    render() {
        return React.createElement(WidgetDesigner, { widgetDef: this.props.widgetDef, createBlock: this.props.createBlock, schema: this.props.schema, dataSource: this.props.dataSource, database: this.props.database, actionLibrary: this.props.actionLibrary, widgetLibrary: this.props.widgetLibrary, onWidgetDefChange: this.props.onWidgetDefChange, blockPaletteEntries: this.props.blockPaletteEntries, locale: "en" });
    }
}
/** Tab which lists existing tabs and offers a button to create a new tab */
class NewTab extends React.Component {
    constructor() {
        super(...arguments);
        /** Add a new blank widget */
        this.handleAdd = () => {
            this.props.onAddWidget({
                id: uuid(),
                name: "Untitled",
                description: "",
                blockDef: null,
                contextVars: [],
                contextVarPreviewValues: {}
            });
        };
    }
    renderExistingWidgets() {
        const widgets = _.sortBy(Object.values(this.props.widgetLibrary.widgets), "name");
        return (React.createElement("ul", { className: "list-group" }, widgets.map(widget => (React.createElement("li", { className: "list-group-item", style: { cursor: "pointer" }, key: widget.id, onClick: this.props.onOpenWidget.bind(null, widget.id) },
            React.createElement("span", { style: { float: "right" }, onClick: this.props.onRemoveWidget.bind(null, widget.id) },
                React.createElement("i", { className: "fa fa-remove" })),
            widget.name)))));
    }
    render() {
        return (React.createElement("div", null,
            this.renderExistingWidgets(),
            React.createElement("button", { type: "button", className: "btn btn-primary", onClick: this.handleAdd },
                React.createElement("i", { className: "fa fa-plus" }),
                " New Widget")));
    }
}
//# sourceMappingURL=widgetLibrary.js.map