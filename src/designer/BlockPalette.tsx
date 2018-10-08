import * as React from "react";
import { CreateBlock } from "../widgets/blocks"
import { Schema, DataSource } from "mwater-expressions"
import { BlockPaletteEntry } from "./blockPaletteEntry";
import BlockPaletteItem from "./BlockPaletteItem";

interface Props {
  createBlock: CreateBlock
  schema: Schema
  dataSource: DataSource
  entries: BlockPaletteEntry[]
}

export default class BlockPalette extends React.Component<Props> {
  render() {
    return (
      <div className="widget-designer-palette">
        { this.props.entries.map((entry, index) => <BlockPaletteItem key={index} entry={entry} createBlock={this.props.createBlock} schema={this.props.schema} dataSource={this.props.dataSource} />) }
      </div>
    )
  }
}
 