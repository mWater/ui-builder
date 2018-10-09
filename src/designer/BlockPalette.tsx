import * as React from "react";
import { CreateBlock } from "../widgets/blocks"
import { Schema, DataSource } from "mwater-expressions"
import { BlockPaletteEntry } from "./blockPaletteEntries";
import BlockPaletteItem from "./BlockPaletteItem";

interface Props {
  createBlock: CreateBlock
  schema: Schema
  dataSource: DataSource
  entries: BlockPaletteEntry[]
}

interface State {
  searchText: string
}

export default class BlockPalette extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      searchText: ""
    }
  }

  handleSearchChange = (ev: any) => {
    this.setState({ searchText: ev.target.value })
  }

  render() {
    const filteredItems = this.props.entries.filter(entry => {
      if (!this.state.searchText) {
        return true
      }
      return entry.title.toLowerCase().includes(this.state.searchText.toLowerCase())
    })

    return (
      <div className="widget-designer-palette">
        <input type="text" className="form-control input-sm" placeholder="Search..." value={this.state.searchText} onChange={this.handleSearchChange} />
        { filteredItems.map((entry, index) => <BlockPaletteItem key={index} entry={entry} createBlock={this.props.createBlock} schema={this.props.schema} dataSource={this.props.dataSource} />) }
      </div>
    )
  }
}
 