var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
let BlockPlaceholder = class BlockPlaceholder extends React.Component {
    render() {
        return this.props.connectDropTarget(React.createElement("div", { className: this.props.isOver ? "block-placeholder hover" : "block-placeholder" }));
    }
};
BlockPlaceholder = __decorate([
    DropTarget("block", blockTargetSpec, (connect, monitor) => ({
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop()
    }))
], BlockPlaceholder);
export default BlockPlaceholder;
//# sourceMappingURL=BlockPlaceholder.js.map