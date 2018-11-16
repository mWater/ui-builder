import * as React from "react"
import { BlockDef, DropSide, BlockStore, dropBlock, CreateBlock } from "../widgets/blocks"
import { DragSource, DropTarget, DropTargetMonitor, ConnectDragSource, ConnectDropTarget, ConnectDragPreview } from 'react-dnd'
import "./BlockWrapper.css"
import { DragDropMonitor } from "dnd-core";
import * as ReactDOM from "react-dom";

interface Props {
  blockDef: BlockDef;
  selectedBlockId: string | null;
  store: BlockStore;
  validationError: string | null;

  /** Injected by react-dnd */
  isOver?: boolean;
  /** Injected by react-dnd */
  connectDragSource?: ConnectDragSource;
  /** Injected by react-dnd */
  connectDropTarget?: ConnectDropTarget;
  /** Injected by react-dnd */
  connectDragPreview?: ConnectDragPreview;

  onSelect(): void;
  onRemove(): void;
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

    // Defer to next cycle to prevent drop error
    const dropSide = component.state.hoverSide
    const sourceBlockDef = monitor.getItem().blockDef
    const targetBlockDef = props.blockDef

    setTimeout(() => {
      props.store.alterBlock(targetBlockDef.id, (b) => dropBlock(sourceBlockDef, b, dropSide), sourceBlockDef.id)
    }, 0)
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

/** Wraps a block in a draggable control with an x to remove */
class BlockWrapper extends React.Component<Props, State> {
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
    const selected = this.props.selectedBlockId === this.props.blockDef.id

    let className = "block-wrapper"
    if (this.props.validationError) {
      className += " validation-error"
    }
    else if (selected) {
      className += " selected"
    }

    return (
      this.props.connectDragSource!(
        this.props.connectDropTarget!(
          <div onClick={this.handleClick} className={className}>
            {selected ? <span className="delete-block" onClick={this.props.onRemove}><i className="fa fa-remove"/></span> : null}
            {this.renderHover()}
            {this.props.children}
          </div>
        )
      )
    )
  }
}

const dropTarget = DropTarget("block", blockTargetSpec, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver({ shallow: true }),
  canDrop: monitor.canDrop()
}))(BlockWrapper)

export default DragSource("block", blockSourceSpec, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))(dropTarget)