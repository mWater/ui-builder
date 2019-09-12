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
var react_dnd_1 = require("react-dnd");
var blocks_1 = require("../widgets/blocks");
var clipboardContents = null;
var blockSourceSpec = {
    canDrag: function (props) {
        return clipboardContents != null;
    },
    beginDrag: function (props) {
        return {
            blockDef: blocks_1.duplicateBlockDef(clipboardContents, props.createBlock)
        };
    },
    endDrag: function (props, monitor) {
        if (monitor.didDrop()) {
            props.onSelect(monitor.getItem().blockDef.id);
        }
    }
};
var blockTargetSpec = {
    canDrop: function (props, monitor) {
        if (!monitor.getItem().blockDef) {
            return false;
        }
        return true;
    },
    drop: function (props, monitor, component) {
        if (monitor.didDrop()) {
            return;
        }
        clipboardContents = monitor.getItem().blockDef;
    }
};
/** Button that can be dragged or dropped to access the clipboard */
var ClipboardPalette = /** @class */ (function (_super) {
    __extends(ClipboardPalette, _super);
    function ClipboardPalette() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ClipboardPalette.prototype.render = function () {
        var className = this.props.isOver ? "btn btn-primary btn-sm active" : "btn btn-default btn-sm active";
        return (this.props.connectDropTarget(this.props.connectDragSource(React.createElement("button", { type: "button", className: className, style: { cursor: "move" } },
            React.createElement("i", { className: "fa fa-arrows" }),
            " Clipboard"))));
    };
    return ClipboardPalette;
}(React.Component));
var collect = function (connect) {
    return { connectDragSource: connect.dragSource() };
};
var dropTarget = react_dnd_1.DropTarget("block", blockTargetSpec, function (connect, monitor) { return ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver({ shallow: true }),
    canDrop: monitor.canDrop()
}); })(ClipboardPalette);
exports.default = react_dnd_1.DragSource("block", blockSourceSpec, collect)(dropTarget);
