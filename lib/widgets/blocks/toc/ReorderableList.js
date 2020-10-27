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
exports.ReorderableList = void 0;
var react_1 = __importDefault(require("react"));
var react_beautiful_dnd_1 = require("react-beautiful-dnd");
/** List which provides drag and drop reordering */
function ReorderableList(props) {
    function onDragEnd(result) {
        // dropped outside the list
        if (!result.destination) {
            return;
        }
        props.onItemsChange(reorder(props.items, result.source.index, result.destination.index));
    }
    function renderDraggable(item, index) {
        var id = props.getItemId(item);
        return react_1.default.createElement(react_beautiful_dnd_1.Draggable, { key: id, draggableId: id, index: index }, function (provided, snapshot) { return (props.renderItem(item, index, provided.innerRef, provided.draggableProps, provided.dragHandleProps)); });
    }
    return react_1.default.createElement(react_beautiful_dnd_1.DragDropContext, { onDragEnd: onDragEnd },
        react_1.default.createElement(react_beautiful_dnd_1.Droppable, { droppableId: "abc" }, function (provided, snapshot) { return (react_1.default.createElement("div", __assign({}, provided.droppableProps, { ref: provided.innerRef }),
            props.items.map(renderDraggable),
            provided.placeholder)); }));
}
exports.ReorderableList = ReorderableList;
function reorder(list, startIndex, endIndex) {
    var result = list.slice();
    var removed = result.splice(startIndex, 1)[0];
    result.splice(endIndex, 0, removed);
    return result;
}
