import * as React from "react";
import { BlockDef } from "../widgets/blocks"
import { DropTarget, DropTargetMonitor, ConnectDropTarget } from 'react-dnd'
import "./BlockPlaceholder.css"

interface Props {
  isOver?: boolean;
  connectDropTarget?: ConnectDropTarget;
  onSet: (blockDef: BlockDef) => void;
}

const blockTargetSpec = {
  canDrop(props: Props, monitor: DropTargetMonitor) {
    return true
  },
  drop(props: Props, monitor: DropTargetMonitor, component: any) {
    if (monitor.didDrop()) {
      return
    }

    props.onSet(monitor.getItem().blockDef)
  }
}

@DropTarget("block", blockTargetSpec, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver({ shallow: true }),
  canDrop: monitor.canDrop()
}))
export default class BlockPlaceholder extends React.Component<Props> {
  render() {
    return this.props.connectDropTarget!(
      <div className={this.props.isOver ? "block-placeholder hover" : "block-placeholder"}/>
    )
  }
}