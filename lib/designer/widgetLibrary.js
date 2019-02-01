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
var uuid_1 = require("uuid");
var WidgetDesigner_1 = __importDefault(require("./WidgetDesigner"));
var immer_1 = __importDefault(require("immer"));
var _ = __importStar(require("lodash"));
/** Design mode for a library of widgets */
var WidgetLibraryDesigner = /** @class */ (function (_super) {
    __extends(WidgetLibraryDesigner, _super);
    function WidgetLibraryDesigner(props) {
        var _this = _super.call(this, props) || this;
        _this.handleTabChange = function (widgetId, widgetDef) {
            _this.props.onWidgetLibraryChange(immer_1.default(_this.props.widgetLibrary, function (draft) {
                draft.widgets[widgetId] = widgetDef;
            }));
        };
        _this.handleSelectTab = function (index) {
            _this.setState({ activeTabIndex: index });
        };
        _this.handleAddWidget = function (widgetDef) {
            var widgetLibrary = immer_1.default(_this.props.widgetLibrary, function (draft) {
                draft.widgets[widgetDef.id] = widgetDef;
            });
            _this.props.onWidgetLibraryChange(widgetLibrary);
            _this.props.onOpenTabsChange(_this.props.openTabs.concat(widgetDef.id));
        };
        _this.handleCloseTab = function (index) {
            var openTabs = _this.props.openTabs.slice();
            openTabs.splice(index, 1);
            _this.props.onOpenTabsChange(openTabs);
        };
        _this.handleOpenWidget = function (widgetId) {
            _this.props.onOpenTabsChange(_this.props.openTabs.concat(widgetId));
        };
        _this.handleRemoveWidget = function (widgetId) {
            if (!confirm("Permanently delete widget?")) {
                return;
            }
            var widgetLibrary = immer_1.default(_this.props.widgetLibrary, function (draft) {
                delete draft.widgets[widgetId];
            });
            _this.props.onOpenTabsChange(_.without(_this.props.openTabs, widgetId));
            _this.props.onWidgetLibraryChange(widgetLibrary);
        };
        _this.state = {
            activeTabIndex: 0
        };
        return _this;
    }
    WidgetLibraryDesigner.prototype.renderTab = function (tab, index) {
        var activeTabId = this.props.openTabs[index];
        var widgetDef = this.props.widgetLibrary.widgets[activeTabId];
        // For immediately deleted tabs
        if (!widgetDef) {
            return null;
        }
        return (React.createElement("li", { className: (index === this.state.activeTabIndex) ? "active" : "", key: index },
            React.createElement("a", { onClick: this.handleSelectTab.bind(null, index) },
                widgetDef.name,
                "\u00A0",
                (index === this.state.activeTabIndex) ? React.createElement("i", { onClick: this.handleCloseTab.bind(null, index), className: "fa fa-remove text-muted" }) : null)));
    };
    WidgetLibraryDesigner.prototype.renderActiveTabContents = function () {
        if (this.state.activeTabIndex < this.props.openTabs.length) {
            var activeTabId = this.props.openTabs[this.state.activeTabIndex];
            var widgetDef = this.props.widgetLibrary.widgets[activeTabId];
            // For immediately deleted tabs
            if (!widgetDef) {
                return null;
            }
            return React.createElement(WidgetTab, { key: widgetDef.id, widgetDef: widgetDef, createBlock: this.props.blockFactory.createBlock, database: this.props.database, schema: this.props.schema, dataSource: this.props.dataSource, actionLibrary: this.props.actionLibrary, widgetLibrary: this.props.widgetLibrary, blockPaletteEntries: this.props.blockPaletteEntries, onWidgetDefChange: this.handleTabChange.bind(null, activeTabId) });
        }
        else {
            return React.createElement(NewTab, { widgetLibrary: this.props.widgetLibrary, onAddWidget: this.handleAddWidget, onOpenWidget: this.handleOpenWidget, onRemoveWidget: this.handleRemoveWidget });
        }
    };
    WidgetLibraryDesigner.prototype.render = function () {
        var _this = this;
        return (React.createElement("div", { style: { height: "100%" } },
            React.createElement("ul", { className: "nav nav-tabs", style: { marginBottom: 5 } },
                this.props.openTabs.map(function (tab, index) { return _this.renderTab(tab, index); }),
                React.createElement("li", { className: (this.state.activeTabIndex >= this.props.openTabs.length) ? "active" : "", key: "new" },
                    React.createElement("a", { onClick: this.handleSelectTab.bind(null, this.props.openTabs.length) },
                        React.createElement("i", { className: "fa fa-plus" })))),
            this.renderActiveTabContents()));
    };
    return WidgetLibraryDesigner;
}(React.Component));
exports.default = WidgetLibraryDesigner;
var WidgetTab = /** @class */ (function (_super) {
    __extends(WidgetTab, _super);
    function WidgetTab() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    WidgetTab.prototype.render = function () {
        return React.createElement(WidgetDesigner_1.default, { widgetDef: this.props.widgetDef, createBlock: this.props.createBlock, schema: this.props.schema, dataSource: this.props.dataSource, database: this.props.database, actionLibrary: this.props.actionLibrary, widgetLibrary: this.props.widgetLibrary, onWidgetDefChange: this.props.onWidgetDefChange, blockPaletteEntries: this.props.blockPaletteEntries, locale: "en" });
    };
    return WidgetTab;
}(React.Component));
/** Tab which lists existing tabs and offers a button to create a new tab */
var NewTab = /** @class */ (function (_super) {
    __extends(NewTab, _super);
    function NewTab() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /** Add a new blank widget */
        _this.handleAdd = function () {
            _this.props.onAddWidget({
                id: uuid_1.v4(),
                name: "Untitled",
                description: "",
                blockDef: null,
                contextVars: [],
                contextVarPreviewValues: {}
            });
        };
        return _this;
    }
    NewTab.prototype.renderExistingWidgets = function () {
        var _this = this;
        var widgets = _.sortBy(Object.values(this.props.widgetLibrary.widgets), "name");
        return (React.createElement("ul", { className: "list-group" }, widgets.map(function (widget) { return (React.createElement("li", { className: "list-group-item", style: { cursor: "pointer" }, key: widget.id, onClick: _this.props.onOpenWidget.bind(null, widget.id) },
            React.createElement("span", { style: { float: "right" }, onClick: _this.props.onRemoveWidget.bind(null, widget.id) },
                React.createElement("i", { className: "fa fa-remove" })),
            widget.name)); })));
    };
    NewTab.prototype.render = function () {
        return (React.createElement("div", null,
            this.renderExistingWidgets(),
            React.createElement("button", { type: "button", className: "btn btn-primary", onClick: this.handleAdd },
                React.createElement("i", { className: "fa fa-plus" }),
                " New Widget")));
    };
    return NewTab;
}(React.Component));
//# sourceMappingURL=widgetLibrary.js.map