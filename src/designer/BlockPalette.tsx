import * as React from "react";
import BlockPaletteItem from "./BlockPaletteItem";
import { CreateBlock } from "../widgets/blocks";
import { Schema } from "mwater-expressions";

interface Props {
  createBlock: CreateBlock
  schema: Schema
}

export default class BlockPalette extends React.Component<Props> {
  render() {
    return (
      <div className="widget-designer-palette">
        <BlockPaletteItem 
          blockDef={{ id: "text", type: "text", text: { _base: "en", en: "" }, style: "div" }}
          createBlock={this.props.createBlock}
          schema={this.props.schema}
        />
        <BlockPaletteItem 
          blockDef={{ id: "labeled", type: "labeled", label: { _base: "en", en: "" }, child: null }}
          createBlock={this.props.createBlock}
          schema={this.props.schema}
        />
        <BlockPaletteItem 
          blockDef={{ id: "x", type: "collapsible", label: { id: "text", type: "text", text: { _base: "en", en: "Collapsible" }, style: "div" }, content: null }}
          createBlock={this.props.createBlock}
          schema={this.props.schema}
        />
        <BlockPaletteItem 
          blockDef={{ id: "x", type: "textInput", column: "Name" }}
          createBlock={this.props.createBlock}
          schema={this.props.schema}
        />
        <BlockPaletteItem 
          blockDef={{ id: "x", type: "expression", expr: "Name" }}
          createBlock={this.props.createBlock}
          schema={this.props.schema}
        />
        <BlockPaletteItem 
          blockDef={{ id: "x", type: "dropdownInput", column: "Type" }}
          createBlock={this.props.createBlock}
          schema={this.props.schema}
        />
        <BlockPaletteItem 
          blockDef={{ id: "x", type: "expression", expr: "Type" }}
          createBlock={this.props.createBlock}
          schema={this.props.schema}
        />
        <BlockPaletteItem 
          blockDef={{ id: "x", type: "dropdownInput", column: "Status" }}
          createBlock={this.props.createBlock}
          schema={this.props.schema}
        />
        <BlockPaletteItem 
          blockDef={{ id: "x", type: "expression", expr: "Status" }}
          createBlock={this.props.createBlock}
          schema={this.props.schema}
        />
        <BlockPaletteItem 
          blockDef={{ 
            id: "x", 
            type: "queryTable", 
            headers: [
              { id: "h1", type: "text", text: { _base: "en", en: "Header 1" }, style: "div" },
              { id: "h2", type: "text", text: { _base: "en", en: "Header 2" }, style: "div" }
            ], 
            contents: [null, null] 
          }}
          createBlock={this.props.createBlock}
          schema={this.props.schema}
        />
        <BlockPaletteItem 
          blockDef={{ 
            id: "x", 
            type: "search"
          }}
          createBlock={this.props.createBlock}
          schema={this.props.schema}
        />
      </div>
    )
  }
}
 