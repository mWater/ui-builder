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
var _ = __importStar(require("lodash"));
var CompoundBlock_1 = __importDefault(require("../CompoundBlock"));
var immer_1 = __importDefault(require("immer"));
var react_1 = require("react");
var localization_1 = require("../localization");
var FillDownwardComponent_1 = __importDefault(require("react-library/lib/FillDownwardComponent"));
var uuid = require("uuid");
/** Create a flat list of all items */
var iterateItems = function (items) {
    var flatItems = _.flatten(items.map(function (item) { return iterateItems(item.children); }));
    return items.concat(flatItems);
};
/** Alter each item, allowing item to be mutated, replaced (return item or array of items) or deleted (return null) */
var alterItems = function (items, action) {
    var newItems = _.flatten(_.compact(items.map(function (item) { return action(item); })));
    for (var _i = 0, newItems_1 = newItems; _i < newItems_1.length; _i++) {
        var ni = newItems_1[_i];
        ni.children = alterItems(ni.children, action);
    }
    return newItems;
};
var TOCBlock = /** @class */ (function (_super) {
    __extends(TOCBlock, _super);
    function TOCBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /** Get child blocks */
    TOCBlock.prototype.getChildren = function (contextVars) {
        // Iterate all 
        return _.compact([this.blockDef.header, this.blockDef.footer].concat(iterateItems(this.blockDef.items).map(function (item) { return item.content; }))
            .map(function (bd) { return ({ blockDef: bd, contextVars: contextVars }); }));
    };
    TOCBlock.prototype.validate = function () { return null; };
    TOCBlock.prototype.processChildren = function (action) {
        return immer_1.default(this.blockDef, function (draft) {
            // For header and footer
            if (draft.header) {
                draft.header = action(draft.header);
            }
            if (draft.footer) {
                draft.footer = action(draft.footer);
            }
            // For each item (in flattened list)
            for (var _i = 0, _a = iterateItems(draft.items); _i < _a.length; _i++) {
                var item = _a[_i];
                if (item.content) {
                    item.content = action(item.content);
                }
            }
        });
    };
    TOCBlock.prototype.renderDesign = function (props) {
        return React.createElement(TOCDesignComp, { renderProps: props, blockDef: this.blockDef });
    };
    TOCBlock.prototype.renderInstance = function (props) {
        return React.createElement(TOCInstanceComp, { renderProps: props, blockDef: this.blockDef });
    };
    return TOCBlock;
}(CompoundBlock_1.default));
exports.TOCBlock = TOCBlock;
/** Designer component for TOC */
var TOCDesignComp = function (props) {
    var blockDef = props.blockDef, renderProps = props.renderProps;
    // Select first item by default
    var _a = react_1.useState(blockDef.items[0] ? blockDef.items[0].id : null), selectedId = _a[0], setSelectedId = _a[1];
    // Select item
    var handleItemClick = function (item) { setSelectedId(item.id); };
    /** Alter items using an action */
    var alterBlockItems = function (action) {
        renderProps.store.alterBlock(blockDef.id, immer_1.default(function (bd) {
            bd.items = alterItems(bd.items, action);
        }));
    };
    var handleAddItem = function () {
        renderProps.store.alterBlock(blockDef.id, immer_1.default(function (bd) {
            var _a;
            bd.items.push({
                id: uuid(),
                label: (_a = { _base: renderProps.locale }, _a[renderProps.locale] = "New Item", _a),
                children: [],
                content: null
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
    /** Set content of active item */
    var handleSetContent = function (content) {
        alterBlockItems(function (item) {
            if (item.id === selectedId) {
                item.content = content;
            }
            return item;
        });
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
                    id: uuid(),
                    label: (_a = { _base: renderProps.locale }, _a[renderProps.locale] = "New Item", _a),
                    children: [],
                    content: null
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
        return React.createElement(CaretMenu, { items: [
                { label: "Edit Label", onClick: function () { return editItemLabel(item); } },
                { label: "Add Subitem", onClick: function () { return addChildItem(item.id); } },
                { label: "Delete", onClick: function () { return deleteItem(item.id); } }
            ] });
    };
    var renderLeft = function () {
        return React.createElement("div", null,
            renderProps.renderChildBlock(renderProps, blockDef.header, handleHeaderSet),
            blockDef.items.map(function (item, index) { return renderItem(blockDef.items, index, 0); }),
            React.createElement("button", { type: "button", className: "btn btn-link btn-xs", onClick: handleAddItem },
                React.createElement("i", { className: "fa fa-plus" }),
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
        return React.createElement("div", null,
            React.createElement("div", { onClick: handleItemClick.bind(null, item), style: itemLabelStyle },
                localization_1.localize(item.label, renderProps.locale),
                renderCaretMenu(item)),
            item.children.length > 0 ?
                React.createElement("div", { style: { marginLeft: 10 } }, item.children.map(function (child, index) { return renderItem(item.children, index, depth + 1); }))
                : null);
    };
    // Get selected item
    var selectedItem = iterateItems(blockDef.items).find(function (item) { return item.id === selectedId; });
    var selectedContent = selectedItem ? selectedItem.content : null;
    // Render overall structure
    return React.createElement(SplitPane, { left: renderLeft(), right: renderProps.renderChildBlock(renderProps, selectedContent, handleSetContent) });
};
/** Instance component for TOC */
var TOCInstanceComp = function (props) {
    var blockDef = props.blockDef, renderProps = props.renderProps;
    // Select first item with content by default
    var firstItem = blockDef.items.find(function (item) { return item.content; });
    var _a = react_1.useState(firstItem ? firstItem.id : null), selectedId = _a[0], setSelectedId = _a[1];
    // Select item
    var handleItemClick = function (item) {
        // Only allow selecting with content
        if (item.content) {
            setSelectedId(item.id);
        }
    };
    /** Render an item at a specified depth which starts at 0 */
    var renderItem = function (items, index, depth) {
        var item = items[index];
        // Determine style of item label
        var itemLabelStyle = {
            padding: 5,
            cursor: item.content ? "pointer" : "default"
        };
        if (depth === 0) {
            itemLabelStyle.fontWeight = "bold";
        }
        if (item.id === selectedId) {
            itemLabelStyle.backgroundColor = "#DDD";
        }
        return React.createElement("div", null,
            React.createElement("div", { onClick: handleItemClick.bind(null, item), style: itemLabelStyle }, localization_1.localize(item.label, renderProps.locale)),
            item.children.length > 0 ?
                React.createElement("div", { style: { marginLeft: 10 } }, item.children.map(function (child, index) { return renderItem(item.children, index, depth + 1); }))
                : null);
    };
    var renderLeft = function () {
        return React.createElement("div", null,
            React.createElement("div", { key: "header" }, renderProps.renderChildBlock(renderProps, blockDef.header)),
            blockDef.items.map(function (item, index) { return renderItem(blockDef.items, index, 0); }),
            React.createElement("div", { key: "footer" }, renderProps.renderChildBlock(renderProps, blockDef.footer)));
    };
    // Get selected item
    var selectedItem = iterateItems(blockDef.items).find(function (item) { return item.id === selectedId; });
    var selectedContent = selectedItem ? selectedItem.content : null;
    // Render overall structure
    return React.createElement(SplitPane, { left: renderLeft(), right: renderProps.renderChildBlock(renderProps, selectedContent) });
};
/** Pane that is split left right */
var SplitPane = function (_a) {
    var left = _a.left, right = _a.right;
    return React.createElement(FillDownwardComponent_1.default, null,
        React.createElement("div", { className: "row", style: { height: "100%" } },
            React.createElement("div", { className: "col-xs-3", style: { height: "100%" } }, left),
            React.createElement("div", { className: "col-xs-9", style: { height: "100%", borderLeft: "solid 1px #DDD" } }, right)));
};
/** Drop down menu that shows as a downward caret */
var CaretMenu = function (props) {
    return React.createElement("div", { className: "btn-group" },
        React.createElement("button", { type: "button", className: "btn btn-link btn-xs dropdown-toggle", "data-toggle": "dropdown" },
            React.createElement("i", { className: "fa fa-caret-down" })),
        React.createElement("ul", { className: "dropdown-menu" }, props.items.map(function (item, index) {
            return React.createElement("li", { key: index },
                React.createElement("a", { onClick: item.onClick }, item.label));
        })));
};
