import * as React from "react";
import { BlockDef, CreateBlock, DropSide } from "../widgets/blocks"
import { ConnectDragSource, DragSource } from "react-dnd";
import { Schema } from "mwater-expressions";
import * as uuid from 'uuid/v4'

interface Props {
  blockDef: BlockDef
  createBlock: CreateBlock
  schema: Schema
  connectDragSource?: ConnectDragSource
}

const blockSourceSpec = {
  beginDrag(props: Props) {
    // Create deep clone
    const block = props.createBlock(props.blockDef)
    return {
      blockDef: block.process(props.createBlock, (b) => Object.assign({}, b, { id: uuid() }))
    }
  }
}

@DragSource("block", blockSourceSpec, (connect, monitor) => ({
  connectDragSource: connect.dragSource()
}))
export default class BlockPaletteItem extends React.Component<Props> {
  renderContents() {
    const block = this.props.createBlock(this.props.blockDef)

    return block.renderDesign({
      selectedId: null,
      schema: this.props.schema,
      locale: "en", // TODO hardcoded
      contextVars: [],
      store: {
        alterBlock(blockId: string, action: (blockDef: BlockDef) => BlockDef | null) { return },
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
