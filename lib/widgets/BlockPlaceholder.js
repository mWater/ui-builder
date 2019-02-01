"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
require("./BlockPlaceholder.css");
var blockTargetSpec = {
    canDrop: function (props, monitor) {
        return true;
    },
    drop: function (props, monitor, component) {
        if (monitor.didDrop()) {
            return;
        }
        // Defer to next cycle to prevent drop error
        var sourceBlockDef = monitor.getItem().blockDef;
        setTimeout(function () {
            if (props.onSet) {
                props.onSet(sourceBlockDef);
            }
        }, 0);
    }
};
var BlockPlaceholder = /** @class */ (function (_super) {
    __extends(BlockPlaceholder, _super);
    function BlockPlaceholder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BlockPlaceholder.prototype.render = function () {
        return this.props.connectDropTarget(React.createElement("div", { className: this.props.isOver ? "block-placeholder hover" : "block-placeholder" }));
    };
    return BlockPlaceholder;
}(React.Component));
exports.default = react_dnd_1.DropTarget("block", blockTargetSpec, function (connect, monitor) { return ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver({ shallow: true }),
    canDrop: monitor.canDrop()
}); })(BlockPlaceholder);
//# sourceMappingURL=BlockPlaceholder.js.map