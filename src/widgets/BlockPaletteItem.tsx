import * as React from "react";
import { BlockDef, CreateBlock, DropSide } from "./blocks"
import { ConnectDragSource, DragSource } from "react-dnd";

interface Props {
  blockDef: BlockDef;
  createBlock: CreateBlock;
  connectDragSource?: ConnectDragSource;
}

const blockSourceSpec = {
  beginDrag(props: Props) {
    const block = props.createBlock(props.blockDef)
    return {
      blockDef: block.clone()
    }
  }
}

@DragSource("block", blockSourceSpec, (connect, monitor) => ({
  connectDragSource: connect.dragSource()
}))
export default class BlockPlaceholder extends React.Component<Props> {
  renderContents() {
    const block = this.props.createBlock(this.props.blockDef)

    return block.renderDesign({
      contextVars: [],
      store: {
        replaceBlock(blockId: string, replaceWith: BlockDef | null) { return },
        addBlock(blockDef: BlockDef, parentBlockId: string | null, parentBlockSection: string) { return },
        dragAndDropBlock(sourceBlockDef: BlockDef, targetBlockId: string, dropSide: DropSide) { return }
      },
      wrapDesignerElem(blockDef: BlockDef, elem: React.ReactElement<any>) {
        return elem
      },
      renderPlaceholder(parentBlockId: string, parentBlockSection: string) {
        return <div className="block-placeholder"/>
      }
    })
  }

  render() {
    return (
      <div style={{padding: 5, position: "relative", backgroundColor: "white", borderRadius: 4, border: "solid 1px #888", margin: 5 }}>
        {this.renderContents()}
        {this.props.connectDragSource!(<div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}/>)}
      </div>
    )
  }
}
