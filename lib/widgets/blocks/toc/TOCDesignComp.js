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
var toc_1 = require("./toc");
var react_2 = require("react");
var immer_1 = __importDefault(require("immer"));
var uuid_1 = __importDefault(require("uuid"));
var SplitPane_1 = __importDefault(require("./SplitPane"));
var TOCDesignRightPane_1 = require("./TOCDesignRightPane");
var ReorderableList_1 = require("./ReorderableList");
/** Designer component for TOC */
function TOCDesignComp(props) {
    var blockDef = props.blockDef, renderProps = props.renderProps;
    // Select first item by default
    var _a = react_2.useState(blockDef.items[0] ? blockDef.items[0].id : null), selectedId = _a[0], setSelectedId = _a[1];
    // Select item
    var handleItemClick = function (item) { setSelectedId(item.id); };
    /** Alter items using an action */
    var alterBlockItems = function (action) {
        renderProps.store.replaceBlock(immer_1.default(blockDef, function (draft) {
            draft.items = toc_1.alterItems(blockDef.items, action);
        }));
    };
    function handleSetItems(items) {
        renderProps.store.replaceBlock(immer_1.default(blockDef, function (draft) {
            draft.items = items;
        }));
    }
    var handleAddItem = function () {
        renderProps.store.replaceBlock(immer_1.default(blockDef, function (draft) {
            var _a;
            draft.items.push({
                id: uuid_1.default(),
                labelBlock: { type: "text", id: uuid_1.default.v4(), text: (_a = { _base: renderProps.locale }, _a[renderProps.locale] = "New Item", _a) },
                children: [],
                contextVarMap: {}
            });
        }));
    };
    var handleHeaderSet = function (header) {
        renderProps.store.replaceBlock(immer_1.default(blockDef, function (draft) {
            draft.header = header;
        }));
    };
    var handleFooterSet = function (footer) {
        renderProps.store.replaceBlock(immer_1.default(blockDef, function (draft) {
            draft.footer = footer;
        }));
    };
    var setItemLabelBlock = function (itemId, labelBlock) {
        alterBlockItems(function (item) {
            if (item.id === itemId) {
                return __assign(__assign({}, item), { labelBlock: labelBlock });
            }
            return item;
        });
    };
    function handleSetChildren(itemId, children) {
        alterBlockItems(function (item) {
            if (item.id === itemId) {
                return __assign(__assign({}, item), { children: children });
            }
            return item;
        });
    }
    var addChildItem = function (itemId) {
        alterBlockItems(function (item) {
            if (item.id === itemId) {
                return immer_1.default(item, function (draft) {
                    var _a;
                    draft.children.push({
                        id: uuid_1.default(),
                        labelBlock: { type: "text", id: uuid_1.default.v4(), text: (_a = { _base: renderProps.locale }, _a[renderProps.locale] = "New Item", _a) },
                        children: []
                    });
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
                { label: "Add Subitem", onClick: function () { return addChildItem(item.id); } },
                { label: "Delete", onClick: function () { return deleteItem(item.id); } }
            ] });
    };
    var renderLeft = function () {
        return react_1.default.createElement("div", { style: { padding: 10 } },
            renderProps.renderChildBlock(renderProps, blockDef.header, handleHeaderSet),
            renderItems(blockDef.items, 0, handleSetItems),
            react_1.default.createElement("button", { type: "button", className: "btn btn-link btn-xs", onClick: handleAddItem },
                react_1.default.createElement("i", { className: "fa fa-plus" }),
                " Add Item"),
            renderProps.renderChildBlock(renderProps, blockDef.footer, handleFooterSet));
    };
    function renderItems(items, depth, onItemsChange) {
        return react_1.default.createElement(ReorderableList_1.ReorderableList, { items: items, onItemsChange: onItemsChange, getItemId: function (item) { return item.id; }, renderItem: function (item, index, innerRef, draggableProps, dragHandleProps) { return (react_1.default.createElement("div", __assign({}, draggableProps, { ref: innerRef }), renderItem(item, index, depth, dragHandleProps))); } });
    }
    /** Render an item at a specified depth which starts at 0 */
    function renderItem(item, index, depth, dragHandleProps) {
        var labelClasses = ["toc-item-label", "toc-item-label-level" + depth];
        if (item.id === selectedId) {
            labelClasses.push("toc-item-label-selected bg-primary");
        }
        if (item.widgetId) {
            labelClasses.push("toc-item-label-selectable");
        }
        return react_1.default.createElement("div", { className: "toc-item toc-item-level" + depth },
            react_1.default.createElement("div", { key: "main", className: labelClasses.join(" "), style: { display: "grid", gridTemplateColumns: "auto auto 1fr auto", alignItems: "center" }, onClick: handleItemClick.bind(null, item) },
                react_1.default.createElement("div", __assign({ style: { cursor: "pointer", paddingTop: 2, paddingLeft: 5 } }, dragHandleProps),
                    react_1.default.createElement("i", { className: "fa fa-bars text-muted" })),
                react_1.default.createElement("div", null, renderProps.renderChildBlock(renderProps, item.labelBlock || null, setItemLabelBlock.bind(null, item.id))),
                renderCaretMenu(item)),
            item.children.length > 0 ?
                react_1.default.createElement("div", { key: "children" }, renderItems(item.children, depth + 1, handleSetChildren.bind(null, item.id)))
                : null);
    }
    // Get selected item
    var selectedItem = toc_1.iterateItems(blockDef.items).find(function (item) { return item.id === selectedId; });
    var renderRight = function () {
        if (!selectedItem) {
            return null;
        }
        return react_1.default.createElement(TOCDesignRightPane_1.TOCDesignRightPane, { item: selectedItem, renderProps: renderProps, onItemChange: function (item) {
                alterBlockItems(function (draft) {
                    if (draft.id == selectedItem.id) {
                        return item;
                    }
                    return draft;
                });
            } });
    };
    // Render overall structure
    return react_1.default.createElement(SplitPane_1.default, { left: renderLeft(), right: renderRight(), removePadding: false });
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
