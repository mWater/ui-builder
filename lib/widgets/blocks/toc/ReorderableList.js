"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReorderableList = void 0;
const react_1 = __importDefault(require("react"));
const react_beautiful_dnd_1 = require("react-beautiful-dnd");
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
        const id = props.getItemId(item);
        return (react_1.default.createElement(react_beautiful_dnd_1.Draggable, { key: id, draggableId: id, index: index }, (provided, snapshot) => props.renderItem(item, index, provided.innerRef, provided.draggableProps, provided.dragHandleProps)));
    }
    return (react_1.default.createElement(react_beautiful_dnd_1.DragDropContext, { onDragEnd: onDragEnd },
        react_1.default.createElement(react_beautiful_dnd_1.Droppable, { droppableId: "abc" }, (provided, snapshot) => (react_1.default.createElement("div", Object.assign({}, provided.droppableProps, { ref: provided.innerRef }),
            props.items.map(renderDraggable),
            provided.placeholder)))));
}
exports.ReorderableList = ReorderableList;
function reorder(list, startIndex, endIndex) {
    const result = list.slice();
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
}
