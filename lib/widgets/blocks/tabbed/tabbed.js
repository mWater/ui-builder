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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var immer_1 = __importDefault(require("immer"));
var React = __importStar(require("react"));
var blocks_1 = require("../../blocks");
var propertyEditors_1 = require("../../propertyEditors");
var TabbedDesigner_1 = __importDefault(require("./TabbedDesigner"));
var ListEditor_1 = __importDefault(require("../../ListEditor"));
var v4_1 = __importDefault(require("uuid/v4"));
var TabbedInstance_1 = __importDefault(require("./TabbedInstance"));
/** Tabbed control */
var TabbedBlock = /** @class */ (function (_super) {
    __extends(TabbedBlock, _super);
    function TabbedBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TabbedBlock.prototype.getChildren = function (contextVars) {
        return this.blockDef.tabs.filter(function (tab) { return tab.content; }).map(function (tab) { return ({ blockDef: tab.content, contextVars: contextVars }); });
    };
    TabbedBlock.prototype.validate = function () { return null; };
    TabbedBlock.prototype.processChildren = function (action) {
        // Immer bug requires that producers not be nested
        var tabContents = this.blockDef.tabs.map(function (t) { return action(t.content); });
        return immer_1.default(this.blockDef, function (draft) {
            for (var i = 0; i < tabContents.length; i++) {
                draft.tabs[i].content = tabContents[i];
            }
        });
    };
    TabbedBlock.prototype.renderDesign = function (props) {
        return React.createElement(TabbedDesigner_1.default, { designCtx: props, tabbedBlockDef: this.blockDef });
    };
    TabbedBlock.prototype.renderInstance = function (props) {
        return React.createElement(TabbedInstance_1.default, { instanceCtx: props, tabbedBlockDef: this.blockDef });
    };
    TabbedBlock.prototype.renderEditor = function (props) {
        var _this = this;
        var handleAddTab = function () {
            props.store.replaceBlock(immer_1.default(_this.blockDef, function (draft) {
                draft.tabs.push({
                    id: v4_1.default(),
                    label: { _base: "en", en: "Unnamed" },
                    content: null
                });
            }));
        };
        return (React.createElement("div", null,
            React.createElement("h3", null, "Tabbed"),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Tabs" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "tabs" }, function (tabs, onTabsChange) {
                    return React.createElement(ListEditor_1.default, { items: _this.blockDef.tabs, onItemsChange: onTabsChange }, function (tab, onTabChange) {
                        return React.createElement(propertyEditors_1.PropertyEditor, { obj: tab, onChange: onTabChange, property: "label" }, function (label, onLabelChange) {
                            return React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: label, onChange: onLabelChange, locale: props.locale });
                        });
                    });
                }),
                React.createElement("button", { type: "button", className: "btn btn-link btn-sm", onClick: handleAddTab },
                    React.createElement("i", { className: "fa fa-plus" }),
                    " Add Tab"))));
    };
    return TabbedBlock;
}(blocks_1.Block));
exports.TabbedBlock = TabbedBlock;
