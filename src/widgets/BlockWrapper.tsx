import * as React from "react"
import { BlockDef, DropSide } from "./blocks"
import { DragSource, DropTarget, DropTargetMonitor, ConnectDragSource, ConnectDropTarget, ConnectDragPreview } from 'react-dnd'
import "./BlockWrapper.css"
import { DragDropMonitor } from "dnd-core";
import * as ReactDOM from "react-dom";

interface Props {
  blockDef: BlockDef;
  selectedBlockId: string | null;
  isOver: boolean;
  connectDragSource?: ConnectDragSource;
  connectDropTarget?: ConnectDropTarget;
  connectDragPreview?: ConnectDragPreview;
  onSelect(): void;
}

interface State {
  hoverSide: DropSide | null
}

const blockSourceSpec = {
  beginDrag(props: Props) {
    return {
      blockDef: props.blockDef
    }
  },

  isDragging(props: Props, monitor: DragDropMonitor) {
    return props.blockDef.id === monitor.getItem().blockDef.id
  }
}

const blockTargetSpec = {
  // Called when an block hovers over this component
  hover(props: Props, monitor: DropTargetMonitor, component: any) {
    // Hovering over self does nothing
    const hoveringId = monitor.getItem().blockDef.id
    const myId = props.blockDef.id

    if (hoveringId === myId) {
      component.setState({ hoverSide: null })
      return
    }

    const side = getDropSide(monitor, component)

    // Set the state
    component.setState({ hoverSide: side })
  },
  canDrop(props: Props, monitor: DropTargetMonitor) {
    const hoveringId = monitor.getItem().blockDef.id
    const myId = props.blockDef.id
    return (hoveringId !== myId)
  },
  drop(props: Props, monitor: DropTargetMonitor, component: any) {
    if (monitor.didDrop()) {
      return
    }

    // const side = component.getDecoratedComponentInstance().state.hoverSide
    // TODO props.onBlockDrop(monitor.getItem().block, props.block, side)
  }
}


// Gets the drop side (top, left, right, bottom)
function getDropSide(monitor: DropTargetMonitor, component: any) {
  // Get underlying component
  // const blockComponent = component.getDecoratedComponentInstance()
  const blockComponent = component

  // Get bounds of component
  const hoverBoundingRect = (ReactDOM.findDOMNode(blockComponent) as Element).getBoundingClientRect()

  const clientOffset = monitor.getClientOffset()

  // Get position within hovered item
  const hoverClientX = clientOffset!.x - hoverBoundingRect.left
  const hoverClientY = clientOffset!.y - hoverBoundingRect.top

  // Determine if over is more left, right, top or bottom
  const fractionX = hoverClientX / (hoverBoundingRect.right - hoverBoundingRect.left)
  const fractionY = hoverClientY / (hoverBoundingRect.bottom - hoverBoundingRect.top)

  if (fractionX > fractionY) { // top or right
    if ((1 - fractionX) > fractionY) { // top or left
      return DropSide.top
    }
    else {
      return DropSide.right
    }
  }
  else { // bottom or left
    if ((1 - fractionX) > fractionY) { // top or left
      return DropSide.left
    }
    else {
      return DropSide.bottom
    }
  }
}


@DragSource("block", blockSourceSpec, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))
@DropTarget("block", blockTargetSpec, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver({ shallow: true }),
  canDrop: monitor.canDrop()
}))
export default class BlockWrapper extends React.Component<Props, State> {
  constructor(props:Props) {
    super(props)
    this.state = { hoverSide: null }
  }

  handleClick = (ev: React.MouseEvent) => {
    ev.stopPropagation()
    this.props.onSelect()
  } 

  renderHover() {
    const lineStyle = {} as React.CSSProperties
    lineStyle.position = "absolute" 
    
    if (this.props.isOver) {
      switch (this.state.hoverSide) {
        case DropSide.left:
          console.log("LEFT")
          lineStyle.borderLeft = "solid 3px #38D"
          lineStyle.top = 0
          lineStyle.bottom = 0
          lineStyle.left = 0
          break
        case DropSide.right:
          lineStyle.borderRight = "solid 3px #38D"
          lineStyle.top = 0
          lineStyle.right = 0
          lineStyle.bottom = 0
          break
        case DropSide.top:
          lineStyle.borderTop = "solid 3px #38D"
          lineStyle.top = 0
          lineStyle.left = 0
          lineStyle.right = 0
          break
        case DropSide.bottom:
          lineStyle.borderBottom = "solid 3px #38D"
          lineStyle.bottom = 0
          lineStyle.left = 0
          lineStyle.right = 0
          break
      }

      return <div style={lineStyle}/>
    }
    else {
      return null
    }
  }

  render() {
    const selected = this.props.selectedBlockId === this.props.blockDef.id;

    return (
      this.props.connectDragSource!(
        this.props.connectDropTarget!(
          <div onClick={this.handleClick} className={selected ? "block-wrapper selected" : "block-wrapper"}>
            {this.renderHover()}
            {this.props.children}
          </div>
        )
      )
    )
  }
}