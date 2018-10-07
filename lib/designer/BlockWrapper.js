var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import * as React from "react";
import { DropSide, dropBlock } from "../widgets/blocks";
import { DragSource, DropTarget } from 'react-dnd';
import "./BlockWrapper.css";
import * as ReactDOM from "react-dom";
const blockSourceSpec = {
    beginDrag(props) {
        return {
            blockDef: props.blockDef
        };
    },
    isDragging(props, monitor) {
        return props.blockDef.id === monitor.getItem().blockDef.id;
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
        const hoveringId = monitor.getItem().blockDef.id;
        const myId = props.blockDef.id;
        return (hoveringId !== myId);
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
            props.store.alterBlock(targetBlockDef.id, (b) => dropBlock(sourceBlockDef, b, dropSide), sourceBlockDef.id);
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
    if (fractionX > fractionY) { // top or right
        if ((1 - fractionX) > fractionY) { // top or left
            return DropSide.top;
        }
        else {
            return DropSide.right;
        }
    }
    else { // bottom or left
        if ((1 - fractionX) > fractionY) { // top or left
            return DropSide.left;
        }
        else {
            return DropSide.bottom;
        }
    }
}
/** Wraps a block in a draggable control with an x to remove */
let BlockWrapper = class BlockWrapper extends React.Component {
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
                case DropSide.left:
                    lineStyle.borderLeft = "solid 3px #38D";
                    lineStyle.top = 0;
                    lineStyle.bottom = 0;
                    lineStyle.left = 0;
                    break;
                case DropSide.right:
                    lineStyle.borderRight = "solid 3px #38D";
                    lineStyle.top = 0;
                    lineStyle.right = 0;
                    lineStyle.bottom = 0;
                    break;
                case DropSide.top:
                    lineStyle.borderTop = "solid 3px #38D";
                    lineStyle.top = 0;
                    lineStyle.left = 0;
                    lineStyle.right = 0;
                    break;
                case DropSide.bottom:
                    lineStyle.borderBottom = "solid 3px #38D";
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
        return (this.props.connectDragSource(this.props.connectDropTarget(React.createElement("div", { onClick: this.handleClick, className: className },
            selected ? React.createElement("span", { className: "delete-block", onClick: this.props.onRemove },
                React.createElement("i", { className: "fa fa-remove" })) : null,
            this.renderHover(),
            this.props.children))));
    }
};
BlockWrapper = __decorate([
    DragSource("block", blockSourceSpec, (connect, monitor) => ({
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    })),
    DropTarget("block", blockTargetSpec, (connect, monitor) => ({
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop()
    }))
], BlockWrapper);
export default BlockWrapper;
//# sourceMappingURL=BlockWrapper.js.map