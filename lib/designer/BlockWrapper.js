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
Object.defineProperty(exports, "__esModule", { value: true });
var React = __importStar(require("react"));
var blocks_1 = require("../widgets/blocks");
var react_dnd_1 = require("react-dnd");
require("./BlockWrapper.css");
var ReactDOM = __importStar(require("react-dom"));
var blockSourceSpec = {
    beginDrag: function (props) {
        return {
            blockDef: props.blockDef
        };
    },
    isDragging: function (props, monitor) {
        return monitor.getItem().blockDef && (props.blockDef.id === monitor.getItem().blockDef.id);
    }
};
var blockTargetSpec = {
    // Called when an block hovers over this component
    hover: function (props, monitor, component) {
        // Hovering over self does nothing
        var hoveringId = monitor.getItem().blockDef.id;
        var myId = props.blockDef.id;
        if (hoveringId === myId) {
            component.setState({ hoverSide: null });
            return;
        }
        var side = getDropSide(monitor, component);
        // Set the state
        component.setState({ hoverSide: side });
    },
    canDrop: function (props, monitor) {
        if (!monitor.getItem().blockDef) {
            return false;
        }
        var hoveringId = monitor.getItem().blockDef.id;
        var myId = props.blockDef.id;
        return (hoveringId !== myId);
    },
    drop: function (props, monitor, component) {
        if (monitor.didDrop()) {
            return;
        }
        // Defer to next cycle to prevent drop error
        var dropSide = component.state.hoverSide;
        var sourceBlockDef = monitor.getItem().blockDef;
        var targetBlockDef = props.blockDef;
        setTimeout(function () {
            props.store.alterBlock(targetBlockDef.id, function (b) { return blocks_1.dropBlock(sourceBlockDef, b, dropSide); }, sourceBlockDef.id);
        }, 0);
    }
};
// Gets the drop side (top, left, right, bottom)
function getDropSide(monitor, component) {
    // Get underlying component
    // const blockComponent = component.getDecoratedComponentInstance()
    var blockComponent = component;
    // Get bounds of component
    var hoverBoundingRect = ReactDOM.findDOMNode(blockComponent).getBoundingClientRect();
    var clientOffset = monitor.getClientOffset();
    // Get position within hovered item
    var hoverClientX = clientOffset.x - hoverBoundingRect.left;
    var hoverClientY = clientOffset.y - hoverBoundingRect.top;
    // Determine if over is more left, right, top or bottom
    var fractionX = hoverClientX / (hoverBoundingRect.right - hoverBoundingRect.left);
    var fractionY = hoverClientY / (hoverBoundingRect.bottom - hoverBoundingRect.top);
    if (fractionX > fractionY) { // top or right
        if ((1 - fractionX) > fractionY) { // top or left
            return blocks_1.DropSide.top;
        }
        else {
            return blocks_1.DropSide.right;
        }
    }
    else { // bottom or left
        if ((1 - fractionX) > fractionY) { // top or left
            return blocks_1.DropSide.left;
        }
        else {
            return blocks_1.DropSide.bottom;
        }
    }
}
/** Wraps a block in a draggable control with an x to remove */
var BlockWrapper = /** @class */ (function (_super) {
    __extends(BlockWrapper, _super);
    function BlockWrapper(props) {
        var _this = _super.call(this, props) || this;
        _this.handleClick = function (ev) {
            ev.stopPropagation();
            _this.props.onSelect();
        };
        _this.state = { hoverSide: null };
        return _this;
    }
    BlockWrapper.prototype.renderHover = function () {
        var lineStyle = {};
        lineStyle.position = "absolute";
        if (this.props.isOver) {
            switch (this.state.hoverSide) {
                case blocks_1.DropSide.left:
                    lineStyle.borderLeft = "solid 3px #38D";
                    lineStyle.top = 0;
                    lineStyle.bottom = 0;
                    lineStyle.left = 0;
                    break;
                case blocks_1.DropSide.right:
                    lineStyle.borderRight = "solid 3px #38D";
                    lineStyle.top = 0;
                    lineStyle.right = 0;
                    lineStyle.bottom = 0;
                    break;
                case blocks_1.DropSide.top:
                    lineStyle.borderTop = "solid 3px #38D";
                    lineStyle.top = 0;
                    lineStyle.left = 0;
                    lineStyle.right = 0;
                    break;
                case blocks_1.DropSide.bottom:
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
    };
    BlockWrapper.prototype.render = function () {
        var selected = this.props.selectedBlockId === this.props.blockDef.id;
        var className = "block-wrapper";
        if (this.props.validationError) {
            className += " validation-error";
        }
        else if (selected) {
            className += " selected";
        }
        return (this.props.connectDragSource(this.props.connectDropTarget(React.createElement("div", { onClick: this.handleClick, className: className },
            this.props.label ? React.createElement("div", { className: "block-wrapper-label" }, this.props.label) : null,
            selected ? React.createElement("span", { className: "delete-block", onClick: this.props.onRemove },
                React.createElement("i", { className: "fa fa-remove" })) : null,
            this.renderHover(),
            this.props.children))));
    };
    return BlockWrapper;
}(React.Component));
var dropTarget = react_dnd_1.DropTarget("ui-builder-block", blockTargetSpec, function (connect, monitor) { return ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver({ shallow: true }),
    canDrop: monitor.canDrop()
}); })(BlockWrapper);
exports.default = react_dnd_1.DragSource("ui-builder-block", blockSourceSpec, function (connect, monitor) { return ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
}); })(dropTarget);
