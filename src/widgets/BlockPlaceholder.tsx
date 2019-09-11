import * as React from "react";
import { BlockDef } from "./blocks"
import { DropTarget, DropTargetMonitor, ConnectDropTarget } from 'react-dnd'
import "./BlockPlaceholder.css"
import uuid = require("uuid");

interface Props {
  isOver?: boolean;
  connectDropTarget?: ConnectDropTarget;
  onSet?: (blockDef: BlockDef) => void;
}

const blockTargetSpec = {
  canDrop(props: Props, monitor: DropTargetMonitor) {
    return true
  },
  drop(props: Props, monitor: DropTargetMonitor, component: any) {
    if (monitor.didDrop()) {
      return
    }

    // Defer to next cycle to prevent drop error
    const sourceBlockDef = monitor.getItem().blockDef

    setTimeout(() => {
      if (props.onSet) {
        props.onSet(sourceBlockDef)
      }
    }, 0)
  }
}

/** Empty space with a dashed border that blocks can be dragged into */
class BlockPlaceholder extends React.Component<Props> {
  handleNew = () => {
    if (this.props.onSet) {
      this.props.onSet({ id: uuid(), type: "addWizard" })
    }
  }
  render() {
    return this.props.connectDropTarget!(
      <div className={this.props.isOver ? "block-placeholder drop" : "block-placeholder"} onDoubleClick={this.handleNew}/>
    )
  }
}

export default DropTarget("block", blockTargetSpec, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver({ shallow: true }),
  canDrop: monitor.canDrop()
}))(BlockPlaceholder)