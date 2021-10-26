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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
const blocks_1 = require("../widgets/blocks");
const react_dnd_1 = require("react-dnd");
require("./BlockWrapper.css");
const ReactDOM = __importStar(require("react-dom"));
const blockSourceSpec = {
    beginDrag(props) {
        return {
            blockDef: props.blockDef
        };
    },
    isDragging(props, monitor) {
        return monitor.getItem().blockDef && props.blockDef.id === monitor.getItem().blockDef.id;
    }
};
const blockTargetSpec = {
    // Called when an block hovers over this component
    hover(props, monitor, component) {
        // Hovering over self does nothing
        const hoveringId = monitor.getItem().blockDef.id;
        const myId = props.blockDef.id;
        if (hoveringId === myId) {
            component.setState({ hoverSide: null });
            return;
        }
        const side = getDropSide(monitor, component);
        // Set the state
        component.setState({ hoverSide: side });
    },
    canDrop(props, monitor) {
        if (!monitor.getItem().blockDef) {
            return false;
        }
        const hoveringId = monitor.getItem().blockDef.id;
        const myId = props.blockDef.id;
        return hoveringId !== myId;
    },
    drop(props, monitor, component) {
        if (monitor.didDrop()) {
            return;
        }
        // Defer to next cycle to prevent drop error
        const dropSide = component.state.hoverSide;
        const sourceBlockDef = monitor.getItem().blockDef;
        const targetBlockDef = props.blockDef;
        setTimeout(() => {
            props.store.alterBlock(targetBlockDef.id, (b) => (0, blocks_1.dropBlock)(sourceBlockDef, b, dropSide), sourceBlockDef.id);
        }, 0);
    }
};
// Gets the drop side (top, left, right, bottom)
function getDropSide(monitor, component) {
    // Get underlying component
    // const blockComponent = component.getDecoratedComponentInstance()
    const blockComponent = component;
    // Get bounds of component
    const hoverBoundingRect = ReactDOM.findDOMNode(blockComponent).getBoundingClientRect();
    const clientOffset = monitor.getClientOffset();
    // Get position within hovered item
    const hoverClientX = clientOffset.x - hoverBoundingRect.left;
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;
    // Determine if over is more left, right, top or bottom
    const fractionX = hoverClientX / (hoverBoundingRect.right - hoverBoundingRect.left);
    const fractionY = hoverClientY / (hoverBoundingRect.bottom - hoverBoundingRect.top);
    if (fractionX > fractionY) {
        // top or right
        if (1 - fractionX > fractionY) {
            // top or left
            return blocks_1.DropSide.top;
        }
        else {
            return blocks_1.DropSide.right;
        }
    }
    else {
        // bottom or left
        if (1 - fractionX > fractionY) {
            // top or left
            return blocks_1.DropSide.left;
        }
        else {
            return blocks_1.DropSide.bottom;
        }
    }
}
/** Wraps a block in a draggable control with an x to remove */
class BlockWrapper extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = (ev) => {
            ev.stopPropagation();
            this.props.onSelect();
        };
        this.state = { hoverSide: null };
    }
    renderHover() {
        const lineStyle = {};
        lineStyle.position = "absolute";
        if (this.props.isOver) {
            switch (this.state.hoverSide) {
                case blocks_1.DropSide.left:
                    lineStyle.borderLeft = "solid 3px var(--bs-primary)";
                    lineStyle.top = 0;
                    lineStyle.bottom = 0;
                    lineStyle.left = 0;
                    break;
                case blocks_1.DropSide.right:
                    lineStyle.borderRight = "solid 3px var(--bs-primary)";
                    lineStyle.top = 0;
                    lineStyle.right = 0;
                    lineStyle.bottom = 0;
                    break;
                case blocks_1.DropSide.top:
                    lineStyle.borderTop = "solid 3px var(--bs-primary)";
                    lineStyle.top = 0;
                    lineStyle.left = 0;
                    lineStyle.right = 0;
                    break;
                case blocks_1.DropSide.bottom:
                    lineStyle.borderBottom = "solid 3px var(--bs-primary)";
                    lineStyle.bottom = 0;
                    lineStyle.left = 0;
                    lineStyle.right = 0;
                    break;
            }
            return React.createElement("div", { style: lineStyle });
        }
        else {
            return null;
        }
    }
    render() {
        const selected = this.props.selectedBlockId === this.props.blockDef.id;
        let className = "block-wrapper";
        if (this.props.validationError) {
            className += " validation-error";
        }
        else if (selected) {
            className += " selected";
        }
        return this.props.connectDragSource(this.props.connectDropTarget(React.createElement("div", { onClick: this.handleClick, className: className },
            this.props.label ? React.createElement("div", { className: "block-wrapper-label" }, this.props.label) : null,
            selected ? (React.createElement("span", { className: "delete-block", onClick: this.props.onRemove },
                React.createElement("i", { className: "fa fa-remove" }))) : null,
            this.renderHover(),
            this.props.children)));
    }
}
const dropTarget = (0, react_dnd_1.DropTarget)("ui-builder-block", blockTargetSpec, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver({ shallow: true }),
    canDrop: monitor.canDrop()
}))(BlockWrapper);
exports.default = (0, react_dnd_1.DragSource)("ui-builder-block", blockSourceSpec, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
}))(dropTarget);
