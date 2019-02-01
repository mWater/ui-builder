"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
const react_dnd_1 = require("react-dnd");
require("./BlockPlaceholder.css");
const blockTargetSpec = {
    canDrop(props, monitor) {
        return true;
    },
    drop(props, monitor, component) {
        if (monitor.didDrop()) {
            return;
        }
        // Defer to next cycle to prevent drop error
        const sourceBlockDef = monitor.getItem().blockDef;
        setTimeout(() => {
            if (props.onSet) {
                props.onSet(sourceBlockDef);
            }
        }, 0);
    }
};
class BlockPlaceholder extends React.Component {
    render() {
        return this.props.connectDropTarget(React.createElement("div", { className: this.props.isOver ? "block-placeholder hover" : "block-placeholder" }));
    }
}
exports.default = react_dnd_1.DropTarget("block", blockTargetSpec, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver({ shallow: true }),
    canDrop: monitor.canDrop()
}))(BlockPlaceholder);
//# sourceMappingURL=BlockPlaceholder.js.map