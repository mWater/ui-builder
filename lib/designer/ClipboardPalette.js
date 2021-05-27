"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
const react_dnd_1 = require("react-dnd");
const blocks_1 = require("../widgets/blocks");
var clipboardContents = null;
const blockSourceSpec = {
    canDrag: (props) => {
        return clipboardContents != null;
    },
    beginDrag: (props) => {
        return {
            blockDef: blocks_1.duplicateBlockDef(clipboardContents, props.createBlock)
        };
    },
    endDrag: (props, monitor) => {
        if (monitor.didDrop()) {
            props.onSelect(monitor.getItem().blockDef.id);
        }
    }
};
const blockTargetSpec = {
    canDrop(props, monitor) {
        if (!monitor.getItem().blockDef) {
            return false;
        }
        return true;
    },
    drop(props, monitor, component) {
        if (monitor.didDrop()) {
            return;
        }
        clipboardContents = monitor.getItem().blockDef;
    }
};
/** Button that can be dragged or dropped to access the clipboard */
class ClipboardPalette extends React.Component {
    render() {
        const className = this.props.isOver ? "btn btn-primary btn-sm active" : "btn btn-default btn-sm active";
        return (this.props.connectDropTarget(this.props.connectDragSource(React.createElement("button", { type: "button", className: className, style: { cursor: "move" } },
            React.createElement("i", { className: "fa fa-arrows" }),
            " Clipboard"))));
    }
}
const collect = (connect) => {
    return { connectDragSource: connect.dragSource() };
};
const dropTarget = react_dnd_1.DropTarget("ui-builder-block", blockTargetSpec, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver({ shallow: true }),
    canDrop: monitor.canDrop()
}))(ClipboardPalette);
exports.default = react_dnd_1.DragSource("ui-builder-block", blockSourceSpec, collect)(dropTarget);
