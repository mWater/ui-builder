"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const toc_1 = require("./toc");
const react_2 = require("react");
const immer_1 = __importDefault(require("immer"));
const uuid_1 = __importDefault(require("uuid"));
const SplitPane_1 = __importDefault(require("./SplitPane"));
const TOCDesignRightPane_1 = require("./TOCDesignRightPane");
const ReorderableList_1 = require("./ReorderableList");
/** Designer component for TOC */
function TOCDesignComp(props) {
    const { blockDef, renderProps } = props;
    // Select first item by default
    const [selectedId, setSelectedId] = (0, react_2.useState)(blockDef.items[0] ? blockDef.items[0].id : null);
    // Select item
    const handleItemClick = (item) => {
        setSelectedId(item.id);
    };
    /** Alter items using an action */
    const alterBlockItems = (action) => {
        renderProps.store.replaceBlock((0, immer_1.default)(blockDef, (draft) => {
            draft.items = (0, toc_1.alterItems)(blockDef.items, action);
        }));
    };
    function handleSetItems(items) {
        renderProps.store.replaceBlock((0, immer_1.default)(blockDef, (draft) => {
            draft.items = items;
        }));
    }
    const handleAddItem = () => {
        renderProps.store.replaceBlock((0, immer_1.default)(blockDef, (draft) => {
            draft.items.push({
                id: (0, uuid_1.default)(),
                labelBlock: {
                    type: "text",
                    id: uuid_1.default.v4(),
                    text: { _base: renderProps.locale, [renderProps.locale]: "New Item" }
                },
                children: [],
                contextVarMap: {}
            });
        }));
    };
    const handleHeaderSet = (header) => {
        renderProps.store.replaceBlock((0, immer_1.default)(blockDef, (draft) => {
            draft.header = header;
        }));
    };
    const handleFooterSet = (footer) => {
        renderProps.store.replaceBlock((0, immer_1.default)(blockDef, (draft) => {
            draft.footer = footer;
        }));
    };
    const setItemLabelBlock = (itemId, labelBlock) => {
        alterBlockItems((item) => {
            if (item.id === itemId) {
                return Object.assign(Object.assign({}, item), { labelBlock });
            }
            return item;
        });
    };
    function handleSetChildren(itemId, children) {
        alterBlockItems((item) => {
            if (item.id === itemId) {
                return Object.assign(Object.assign({}, item), { children });
            }
            return item;
        });
    }
    const addChildItem = (itemId) => {
        alterBlockItems((item) => {
            if (item.id === itemId) {
                return (0, immer_1.default)(item, (draft) => {
                    draft.children.push({
                        id: (0, uuid_1.default)(),
                        labelBlock: {
                            type: "text",
                            id: uuid_1.default.v4(),
                            text: { _base: renderProps.locale, [renderProps.locale]: "New Item" }
                        },
                        children: []
                    });
                });
            }
            return item;
        });
    };
    const deleteItem = (itemId) => {
        alterBlockItems((item) => (item.id === itemId ? null : item));
    };
    // Render the dropdown gear menu to edit an entry
    const renderCaretMenu = (item) => {
        return (react_1.default.createElement(CaretMenu, { items: [
                { label: "Add Subitem", onClick: () => addChildItem(item.id) },
                { label: "Delete", onClick: () => deleteItem(item.id) }
            ] }));
    };
    const renderLeft = () => {
        return (react_1.default.createElement("div", { style: { padding: 10 } },
            renderProps.renderChildBlock(renderProps, blockDef.header, handleHeaderSet),
            renderItems(blockDef.items, 0, handleSetItems),
            react_1.default.createElement("button", { type: "button", className: "btn btn-link btn-sm", onClick: handleAddItem },
                react_1.default.createElement("i", { className: "fa fa-plus" }),
                " Add Item"),
            renderProps.renderChildBlock(renderProps, blockDef.footer, handleFooterSet)));
    };
    function renderItems(items, depth, onItemsChange) {
        return (react_1.default.createElement(ReorderableList_1.ReorderableList, { items: items, onItemsChange: onItemsChange, getItemId: (item) => item.id, renderItem: (item, index, innerRef, draggableProps, dragHandleProps) => (react_1.default.createElement("div", Object.assign({}, draggableProps, { ref: innerRef }), renderItem(item, index, depth, dragHandleProps))) }));
    }
    /** Render an item at a specified depth which starts at 0 */
    function renderItem(item, index, depth, dragHandleProps) {
        const labelClasses = ["toc-item-label", `toc-item-label-level${depth}`];
        if (item.id === selectedId) {
            labelClasses.push(`toc-item-label-selected`);
        }
        if (item.widgetId) {
            labelClasses.push("toc-item-label-selectable");
        }
        return (react_1.default.createElement("div", { className: `toc-item toc-item-level${depth}` },
            react_1.default.createElement("div", { key: "main", className: labelClasses.join(" "), style: { display: "grid", gridTemplateColumns: "auto auto 1fr auto", alignItems: "center" }, onClick: handleItemClick.bind(null, item) },
                react_1.default.createElement("div", Object.assign({ style: { cursor: "pointer", paddingTop: 2, paddingLeft: 5 } }, dragHandleProps),
                    react_1.default.createElement("i", { className: "fa fa-bars text-muted" })),
                react_1.default.createElement("div", null, renderProps.renderChildBlock(renderProps, item.labelBlock || null, setItemLabelBlock.bind(null, item.id))),
                renderCaretMenu(item)),
            item.children.length > 0 ? (react_1.default.createElement("div", { key: "children" }, renderItems(item.children, depth + 1, handleSetChildren.bind(null, item.id)))) : null));
    }
    // Get selected item
    const selectedItem = (0, toc_1.iterateItems)(blockDef.items).find((item) => item.id === selectedId);
    const renderRight = () => {
        if (!selectedItem) {
            return null;
        }
        return (react_1.default.createElement(TOCDesignRightPane_1.TOCDesignRightPane, { item: selectedItem, renderProps: renderProps, onItemChange: (item) => {
                alterBlockItems((draft) => {
                    if (draft.id == selectedItem.id) {
                        return item;
                    }
                    return draft;
                });
            } }));
    };
    // Render overall structure
    return react_1.default.createElement(SplitPane_1.default, { left: renderLeft(), right: renderRight(), theme: blockDef.theme || "light" });
}
exports.default = TOCDesignComp;
/** Drop down menu that shows as a downward caret */
const CaretMenu = (props) => {
    return (react_1.default.createElement("div", { className: "dropdown" },
        react_1.default.createElement("button", { type: "button", className: "btn btn-link btn-sm dropdown-toggle", "data-bs-toggle": "dropdown" }),
        react_1.default.createElement("ul", { className: "dropdown-menu" }, props.items.map((item, index) => {
            return (react_1.default.createElement("li", { key: index },
                react_1.default.createElement("a", { className: "dropdown-item", onClick: item.onClick }, item.label)));
        }))));
};
