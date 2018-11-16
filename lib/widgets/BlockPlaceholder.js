import * as React from "react";
import { DropTarget } from 'react-dnd';
import "./BlockPlaceholder.css";
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
export default DropTarget("block", blockTargetSpec, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver({ shallow: true }),
    canDrop: monitor.canDrop()
}))(BlockPlaceholder);
//# sourceMappingURL=BlockPlaceholder.js.map