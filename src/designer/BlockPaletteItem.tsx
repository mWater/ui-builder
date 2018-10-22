import * as React from "react";
import { BlockDef, CreateBlock, DropSide } from "../widgets/blocks"
import { ConnectDragSource, DragSource } from "react-dnd"
import { Schema, DataSource } from "mwater-expressions"
import {v4 as uuid} from 'uuid'
import BlockPlaceholder from "../widgets/BlockPlaceholder"
import { BlockPaletteEntry } from "./blockPaletteEntries";

interface Props {
  entry: BlockPaletteEntry
  createBlock: CreateBlock
  schema: Schema
  dataSource: DataSource
  connectDragSource?: ConnectDragSource
}

const blockSourceSpec = {
  beginDrag(props: Props) {
    // Create deep clone
    const block = props.createBlock(props.entry.blockDef)
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
    if (this.props.entry.elem) {
      return this.props.entry.elem
    }

    const block = this.props.createBlock(this.props.entry.blockDef)

    return block.renderDesign({
      selectedId: null,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      locale: "en",
      widgetLibrary: { widgets: {} },
      contextVars: [],
      store: {
        alterBlock(blockId: string, action: (blockDef: BlockDef) => BlockDef | null) { return }
      },
      renderChildBlock: (props, childBlockDef) => {
        if (childBlockDef) {
          const childBlock = this.props.createBlock(childBlockDef)
          return childBlock.renderDesign(props)
        }
        else {
          return <BlockPlaceholder/>
        }
      },
    })
  }

  render() {
    return (
      <div style={{padding: 5, position: "relative", backgroundColor: "white", border: "solid 1px #AAA", margin: 5 }}>
        <div style={{ position: "relative", textAlign: "center", top: -5, fontSize: 10, marginBottom: -5 }}>{this.props.entry.title}</div>
        {this.renderContents()}
        {this.props.connectDragSource!(<div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}/>)}
      </div>
    )
  }
}
