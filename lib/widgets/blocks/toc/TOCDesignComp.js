"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var lodash_1 = __importDefault(require("lodash"));
var toc_1 = require("./toc");
var react_2 = require("react");
var immer_1 = __importDefault(require("immer"));
var uuid_1 = __importDefault(require("uuid"));
var localization_1 = require("../../localization");
var SplitPane_1 = __importDefault(require("./SplitPane"));
var propertyEditors_1 = require("../../propertyEditors");
var bootstrap_1 = require("react-library/lib/bootstrap");
/** Designer component for TOC */
function TOCDesignComp(props) {
    var blockDef = props.blockDef, renderProps = props.renderProps;
    // Select first item by default
    var _a = react_2.useState(blockDef.items[0] ? blockDef.items[0].id : null), selectedId = _a[0], setSelectedId = _a[1];
    // Select item
    var handleItemClick = function (item) { setSelectedId(item.id); };
    /** Alter items using an action */
    var alterBlockItems = function (action) {
        renderProps.store.alterBlock(blockDef.id, immer_1.default(function (bd) {
            bd.items = toc_1.alterItems(bd.items, action);
        }));
    };
    var handleAddItem = function () {
        renderProps.store.alterBlock(blockDef.id, immer_1.default(function (bd) {
            var _a;
            bd.items.push({
                id: uuid_1.default(),
                label: (_a = { _base: renderProps.locale }, _a[renderProps.locale] = "New Item", _a),
                children: [],
                contextVarMap: {}
            });
        }));
    };
    var handleHeaderSet = function (header) {
        renderProps.store.alterBlock(blockDef.id, immer_1.default(function (bd) {
            bd.header = header;
        }));
    };
    var handleFooterSet = function (footer) {
        renderProps.store.alterBlock(blockDef.id, immer_1.default(function (bd) {
            bd.footer = footer;
        }));
    };
    var editItemLabel = function (item) {
        var newlabel = prompt("Enter new label", localization_1.localize(item.label, renderProps.locale));
        if (!newlabel) {
            return;
        }
        alterBlockItems(function (draft) {
            if (draft.id === item.id) {
                draft.label._base = renderProps.locale;
                draft.label[renderProps.locale] = newlabel;
            }
            return draft;
        });
    };
    var addChildItem = function (itemId) {
        alterBlockItems(function (item) {
            var _a;
            if (item.id === itemId) {
                item.children.push({
                    id: uuid_1.default(),
                    label: (_a = { _base: renderProps.locale }, _a[renderProps.locale] = "New Item", _a),
                    children: []
                });
            }
            return item;
        });
    };
    var deleteItem = function (itemId) {
        alterBlockItems(function (item) { return item.id === itemId ? null : item; });
    };
    // Render the dropdown gear menu to edit an entry
    var renderCaretMenu = function (item) {
        return react_1.default.createElement(CaretMenu, { items: [
                { label: "Edit Label", onClick: function () { return editItemLabel(item); } },
                { label: "Add Subitem", onClick: function () { return addChildItem(item.id); } },
                { label: "Delete", onClick: function () { return deleteItem(item.id); } }
            ] });
    };
    var renderLeft = function () {
        return react_1.default.createElement("div", { style: { padding: 10 } },
            renderProps.renderChildBlock(renderProps, blockDef.header, handleHeaderSet),
            blockDef.items.map(function (item, index) { return renderItem(blockDef.items, index, 0); }),
            react_1.default.createElement("button", { type: "button", className: "btn btn-link btn-xs", onClick: handleAddItem },
                react_1.default.createElement("i", { className: "fa fa-plus" }),
                " Add Item"),
            renderProps.renderChildBlock(renderProps, blockDef.footer, handleFooterSet));
    };
    /** Render an item at a specified depth which starts at 0 */
    var renderItem = function (items, index, depth) {
        var item = items[index];
        // Determine style of item label
        var itemLabelStyle = {
            padding: 5,
            cursor: "pointer"
        };
        if (depth === 0) {
            itemLabelStyle.fontWeight = "bold";
        }
        if (item.id === selectedId) {
            itemLabelStyle.backgroundColor = "#DDD";
        }
        return react_1.default.createElement("div", null,
            react_1.default.createElement("div", { onClick: handleItemClick.bind(null, item), style: itemLabelStyle },
                localization_1.localize(item.label, renderProps.locale),
                renderCaretMenu(item)),
            item.children.length > 0 ?
                react_1.default.createElement("div", { style: { marginLeft: 10 } }, item.children.map(function (child, index) { return renderItem(item.children, index, depth + 1); }))
                : null);
    };
    // Get selected item
    var selectedItem = toc_1.iterateItems(blockDef.items).find(function (item) { return item.id === selectedId; });
    var selectedWidgetId = selectedItem ? selectedItem.widgetId : null;
    var handleWidgetIdChange = function (widgetId) {
        alterBlockItems(function (draft) {
            if (draft.id === selectedItem.id) {
                draft.widgetId = widgetId;
            }
            return draft;
        });
    };
    var handleContextVarMapChange = function (contextVarMap) {
        alterBlockItems(function (draft) {
            if (draft.id === selectedItem.id) {
                draft.contextVarMap = contextVarMap;
            }
            return draft;
        });
    };
    var renderRight = function () {
        if (!selectedItem) {
            return null;
        }
        // Create widget options 
        var widgetOptions = lodash_1.default.sortBy(Object.values(props.renderProps.widgetLibrary.widgets).map(function (w) { return ({ label: w.name, value: w.id }); }), "label");
        var renderContextVarValues = function () {
            if (!selectedItem.widgetId) {
                return null;
            }
            // Find the widget
            var widgetDef = renderProps.widgetLibrary.widgets[selectedItem.widgetId];
            if (!widgetDef) {
                return null;
            }
            var contextVarMap = selectedItem.contextVarMap || {};
            return (react_1.default.createElement("table", { className: "table table-bordered table-condensed" },
                react_1.default.createElement("tbody", null, widgetDef.contextVars.map(function (contextVar) {
                    var cv = contextVarMap[contextVar.id];
                    var handleCVChange = function (contextVarId) {
                        var _a;
                        handleContextVarMapChange(__assign(__assign({}, selectedItem.contextVarMap), (_a = {}, _a[contextVar.id] = contextVarId, _a)));
                    };
                    return (react_1.default.createElement("tr", { key: contextVar.id },
                        react_1.default.createElement("td", null, contextVar.name),
                        react_1.default.createElement("td", null,
                            react_1.default.createElement(propertyEditors_1.ContextVarPropertyEditor, { contextVars: renderProps.contextVars, types: [contextVar.type], table: contextVar.table, value: cv, onChange: handleCVChange }))));
                }))));
        };
        return (react_1.default.createElement("div", { style: { padding: 10 } },
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Widget" },
                react_1.default.createElement(bootstrap_1.Select, { value: selectedWidgetId, onChange: handleWidgetIdChange, options: widgetOptions, nullLabel: "Select Widget" })),
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Variable Mappings" }, renderContextVarValues())));
    };
    // Render overall structure
    return react_1.default.createElement(SplitPane_1.default, { left: renderLeft(), right: renderRight() });
}
exports.default = TOCDesignComp;
/** Drop down menu that shows as a downward caret */
var CaretMenu = function (props) {
    return react_1.default.createElement("div", { className: "btn-group" },
        react_1.default.createElement("button", { type: "button", className: "btn btn-link btn-xs dropdown-toggle", "data-toggle": "dropdown" },
            react_1.default.createElement("i", { className: "fa fa-caret-down" })),
        react_1.default.createElement("ul", { className: "dropdown-menu" }, props.items.map(function (item, index) {
            return react_1.default.createElement("li", { key: index },
                react_1.default.createElement("a", { onClick: item.onClick }, item.label));
        })));
};
