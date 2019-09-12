import * as React from "react";
import { ConnectDragSource, DragSource, DragSourceConnector, DragSourceSpec, DragSourceMonitor, ConnectDropTarget, DropTargetSpec, DropTargetMonitor, DropTarget } from "react-dnd"
import { BlockDef, duplicateBlockDef, CreateBlock } from "../widgets/blocks";

var clipboardContents: BlockDef | null = null

interface Props {
  createBlock: CreateBlock
  onSelect(blockId: string): void
  /** Injected by react-dnd */
  connectDragSource?: ConnectDragSource
  /** Injected by react-dnd */
  connectDropTarget?: ConnectDropTarget
  /** Injected by react-dnd */
  isOver?: boolean
}

const blockSourceSpec: DragSourceSpec<Props, { blockDef: BlockDef }> = {
  canDrag: (props: Props) => {
    return clipboardContents != null
  },
  beginDrag: (props: Props) => {
    return {
      blockDef: duplicateBlockDef(clipboardContents!, props.createBlock)
    }
  },
  endDrag: (props: Props, monitor: DragSourceMonitor) => {
    if (monitor.didDrop()) {
      props.onSelect(monitor.getItem().blockDef.id)
    }
  }
}

const blockTargetSpec: DropTargetSpec<Props> = {
  canDrop(props: Props, monitor: DropTargetMonitor) {
    if (!monitor.getItem().blockDef) {
      return false
    }
    
    return true
  },
  drop(props: Props, monitor: DropTargetMonitor, component: any) {
    if (monitor.didDrop()) {
      return
    }
    clipboardContents = monitor.getItem().blockDef
  }
}

/** Button that can be dragged or dropped to access the clipboard */
class ClipboardPalette extends React.Component<Props> {
  render() {
    const className = this.props.isOver ? "btn btn-primary btn-sm active" : "btn btn-default btn-sm active"
    return (
      this.props.connectDropTarget!(
        this.props.connectDragSource!(
          <button type="button" className={className} style={{ cursor: "move" }}>
            <i className="fa fa-arrows"/> Clipboard
          </button>
        )
      )
    )
  }
}

const collect = (connect: DragSourceConnector) => {
  return { connectDragSource: connect.dragSource() }
}

const dropTarget = DropTarget("block", blockTargetSpec, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver({ shallow: true }),
  canDrop: monitor.canDrop()
}))(ClipboardPalette)

export default DragSource("block", blockSourceSpec, collect)(dropTarget)
