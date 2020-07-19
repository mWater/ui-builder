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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WidgetLibraryDesigner = void 0;
var React = __importStar(require("react"));
var uuid_1 = require("uuid");
var WidgetDesigner_1 = __importDefault(require("./WidgetDesigner"));
var immer_1 = __importDefault(require("immer"));
var _ = __importStar(require("lodash"));
var NewTab_1 = require("./NewTab");
var blocks_1 = require("../widgets/blocks");
/** Design mode for a library of widgets */
var WidgetLibraryDesigner = /** @class */ (function (_super) {
    __extends(WidgetLibraryDesigner, _super);
    function WidgetLibraryDesigner(props) {
        var _this = _super.call(this, props) || this;
        _this.handleTabChange = function (widgetId, widgetDef) {
            _this.props.onWidgetLibraryChange(immer_1.default(_this.props.baseCtx.widgetLibrary, function (draft) {
                draft.widgets[widgetId] = widgetDef;
            }));
        };
        _this.handleSelectTab = function (index) {
            _this.setState({ activeTabIndex: index });
        };
        _this.handleAddWidget = function (widgetDef) {
            var widgetLibrary = immer_1.default(_this.props.baseCtx.widgetLibrary, function (draft) {
                draft.widgets[widgetDef.id] = widgetDef;
            });
            _this.props.onWidgetLibraryChange(widgetLibrary);
            _this.props.onOpenTabsChange(_this.props.openTabs.concat(widgetDef.id));
        };
        _this.handleDuplicateWidget = function (widgetDef) {
            var newId = uuid_1.v4();
            var widgetLibrary = immer_1.default(_this.props.baseCtx.widgetLibrary, function (draft) {
                var newDef = _.cloneDeep(widgetDef);
                newDef.id = newId;
                newDef.name = newDef.name + " (duplicate)";
                draft.widgets[newId] = newDef;
            });
            _this.props.onWidgetLibraryChange(widgetLibrary);
        };
        _this.handleCloseTab = function (index, ev) {
            ev.stopPropagation();
            var openTabs = _this.props.openTabs.slice();
            openTabs.splice(index, 1);
            _this.props.onOpenTabsChange(openTabs);
        };
        _this.handleOpenWidget = function (widgetId) {
            _this.props.onOpenTabsChange(_this.props.openTabs.concat(widgetId));
        };
        _this.handleRemoveWidget = function (widgetId) {
            var widget = _this.props.baseCtx.widgetLibrary.widgets[widgetId];
            if (!confirm("Permanently delete " + widget.name + " widget?")) {
                return;
            }
            var widgetLibrary = immer_1.default(_this.props.baseCtx.widgetLibrary, function (draft) {
                delete draft.widgets[widgetId];
            });
            _this.props.onOpenTabsChange(_.without(_this.props.openTabs, widgetId));
            _this.props.onWidgetLibraryChange(widgetLibrary);
        };
        /** Validate a single widget */
        _this.validateWidget = function (widgetDef) {
            if (!widgetDef.blockDef) {
                return null;
            }
            var contextVars = (_this.props.baseCtx.globalContextVars || [])
                .concat(widgetDef.contextVars)
                .concat(widgetDef.privateContextVars || []);
            for (var _i = 0, _a = blocks_1.getBlockTree(widgetDef.blockDef, _this.props.baseCtx.createBlock, contextVars); _i < _a.length; _i++) {
                var childBlock = _a[_i];
                var block = _this.props.baseCtx.createBlock(childBlock.blockDef);
                // Create design context for validating
                var designCtx = __assign(__assign({}, _this.props.baseCtx), { dataSource: _this.props.dataSource, contextVars: childBlock.contextVars, store: new blocks_1.NullBlockStore(), blockPaletteEntries: [], selectedId: null, renderChildBlock: function () { throw new Error("Not implemented"); } });
                var error = block.validate(designCtx);
                if (error) {
                    return error;
                }
            }
            return null;
        };
        _this.state = {
            activeTabIndex: 0
        };
        return _this;
    }
    WidgetLibraryDesigner.prototype.renderTab = function (index) {
        var activeTabId = this.props.openTabs[index];
        var widgetDef = this.props.baseCtx.widgetLibrary.widgets[activeTabId];
        // For immediately deleted tabs
        if (!widgetDef) {
            return null;
        }
        return (React.createElement("li", { className: (index === this.state.activeTabIndex) ? "active" : "", key: index },
            React.createElement("a", { onClick: this.handleSelectTab.bind(null, index) },
                widgetDef.name,
                "\u00A0",
                React.createElement("i", { onClick: this.handleCloseTab.bind(null, index), className: "fa fa-remove text-muted" }))));
    };
    WidgetLibraryDesigner.prototype.renderActiveTabContents = function () {
        if (this.state.activeTabIndex < this.props.openTabs.length) {
            var activeTabId = this.props.openTabs[this.state.activeTabIndex];
            var widgetDef = this.props.baseCtx.widgetLibrary.widgets[activeTabId];
            // For immediately deleted tabs
            if (!widgetDef) {
                return null;
            }
            return React.createElement(WidgetDesigner_1.default, { key: widgetDef.id, widgetDef: widgetDef, baseCtx: this.props.baseCtx, dataSource: this.props.dataSource, blockPaletteEntries: this.props.blockPaletteEntries, onWidgetDefChange: this.handleTabChange.bind(null, activeTabId) });
        }
        else {
            return React.createElement(NewTab_1.NewTab, { widgetLibrary: this.props.baseCtx.widgetLibrary, onAddWidget: this.handleAddWidget, onOpenWidget: this.handleOpenWidget, onRemoveWidget: this.handleRemoveWidget, onDuplicateWidget: this.handleDuplicateWidget, validateWidget: this.validateWidget });
        }
    };
    WidgetLibraryDesigner.prototype.render = function () {
        var _this = this;
        return (React.createElement("div", { style: { height: "100%", display: "grid", gridTemplateRows: "auto 1fr" } },
            React.createElement("ul", { className: "nav nav-tabs", style: { marginBottom: 5 } },
                this.props.openTabs.map(function (tab, index) { return _this.renderTab(index); }),
                React.createElement("li", { className: (this.state.activeTabIndex >= this.props.openTabs.length) ? "active" : "", key: "new" },
                    React.createElement("a", { onClick: this.handleSelectTab.bind(null, this.props.openTabs.length) },
                        React.createElement("i", { className: "fa fa-plus" })))),
            this.renderActiveTabContents()));
    };
    return WidgetLibraryDesigner;
}(React.Component));
exports.WidgetLibraryDesigner = WidgetLibraryDesigner;
