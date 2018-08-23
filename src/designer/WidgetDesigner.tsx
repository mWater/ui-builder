import BlockWrapper from "./BlockWrapper"

import * as React from "react"
import { WidgetDef } from "../widgets/widgets"
import { CreateBlock, BlockDef, DropSide, findBlockAncestry, BlockStore, RenderEditorProps, ContextVar } from "../widgets/blocks"
import BlockPlaceholder from "./BlockPlaceholder"
import BlockPaletteItem from "./BlockPaletteItem"
import "./WidgetDesigner.css"
import { Schema } from "mwater-expressions";

interface Props {
  widgetDef: WidgetDef
  createBlock: CreateBlock
  schema: Schema
  onWidgetDefChange(widgetDef: WidgetDef): void
}

interface State {
  selectedBlockId: string | null
}
  
export default class WidgetDesigner extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      selectedBlockId: null
    }
  }

  handleSelect = (blockId: string) => {
    this.setState({ selectedBlockId: blockId })
  }

  wrapDesignerElem = (store: BlockStore, blockDef: BlockDef, elem: React.ReactElement<any>) => {
    return (
      <BlockWrapper 
        blockDef={blockDef} 
        selectedBlockId={this.state.selectedBlockId} 
        onSelect={this.handleSelect.bind(null, blockDef.id)} 
        onRemove={this.handleRemoveBlock.bind(null, blockDef.id)} 
        store={store}
      >
        {elem}
      </BlockWrapper>
    )
  }

  handlePlaceholderSet = (parentBlockId: string, parentBlockSection: string, blockDef: BlockDef) => {
    const block = this.props.createBlock(this.props.widgetDef.blockDef!)
    this.handleBlockDefChange(block.addBlock(blockDef, parentBlockId, parentBlockSection))
  }

  // Render a placeholder for blocks that can be dropped on
  renderPlaceholder = (parentBlockId: string, parentBlockSection: string) => {
    return <BlockPlaceholder onSet={this.handlePlaceholderSet.bind(null, parentBlockId, parentBlockSection)} />
  }

  // Set the widget block
  handleBlockDefChange = (blockDef: BlockDef | null) => {
    // Canonicalize
    if (blockDef) {
      blockDef = this.props.createBlock(blockDef).canonicalize()
    }
    this.props.onWidgetDefChange({ ...this.props.widgetDef, blockDef })
  }

  handleUnselect = () => { this.setState({ selectedBlockId: null }) }

  handleRemoveBlock = (blockId: string) => {
    const block = this.props.createBlock(this.props.widgetDef.blockDef!)
    this.handleBlockDefChange(block.replaceBlock(blockId, null))
  }

  createBlockStore() {
    const block = this.props.createBlock(this.props.widgetDef.blockDef!)

    return {
      replaceBlock: (blockId: string, replaceWith: BlockDef | null) => {
        this.handleBlockDefChange(block.replaceBlock(blockId, replaceWith))
      },
      addBlock: (blockDef: BlockDef, parentBlockId: string | null, parentBlockSection: string) => {
        this.handleBlockDefChange(block.addBlock(blockDef, parentBlockId, parentBlockSection))
      },
      dragAndDropBlock: (sourceBlockDef: BlockDef, targetBlockId: string, dropSide: DropSide) => {
        // Remove source block
        let newBlockDef = block.replaceBlock(sourceBlockDef.id, null)

        // Drop block (if no block, just use new block)
        newBlockDef = newBlockDef ? this.props.createBlock(newBlockDef).dropBlock(sourceBlockDef, targetBlockId, dropSide) : newBlockDef

        this.handleBlockDefChange(newBlockDef)
      }
    }
  }

  renderPalette() {
    return (
      <div className="widget-designer-palette">
        <BlockPaletteItem 
          blockDef={{ id: "text", type: "text", text: { _base: "en", en: "" }, style: "p" }}
          createBlock={this.props.createBlock}
          schema={this.props.schema}
        />
        <BlockPaletteItem 
          blockDef={{ id: "x", type: "dropdown" }}
          createBlock={this.props.createBlock}
          schema={this.props.schema}
        />
      </div>
    )
  }

  renderBlock() {
    // If there is an existing block, render it
    if (this.props.widgetDef.blockDef) {
      const block = this.props.createBlock(this.props.widgetDef.blockDef!)
      const store = this.createBlockStore()
    
      // Create block store
      return block.renderDesign({
        schema: this.props.schema,
        selectedId: this.state.selectedBlockId,
        locale: "en",
        contextVars: this.props.widgetDef.contextVars,
        store,
        wrapDesignerElem: this.wrapDesignerElem.bind(null, store),
        renderPlaceholder: this.renderPlaceholder
      })
    }
    else {
      // Create placeholder
      return <BlockPlaceholder onSet={this.handleBlockDefChange.bind(null)} />
    }
  }

  renderEditor() {
    if (this.props.widgetDef.blockDef && this.state.selectedBlockId) {
      // Find selected block ancestry
      const selectedBlockAncestry = findBlockAncestry(this.props.widgetDef.blockDef, this.props.createBlock, this.state.selectedBlockId)

      // Create properties
      if (selectedBlockAncestry) {
        const selectedBlock = selectedBlockAncestry[selectedBlockAncestry.length - 1]

        let contextVars : ContextVar[] = []
        for (let i = 0; i < selectedBlockAncestry.length - 1 ; i++) {
          contextVars = contextVars.concat(selectedBlockAncestry[i].getCreatedContextVars())
        }

        const props : RenderEditorProps = {
          contextVars: contextVars,
          locale: "en",
          onChange: (blockDef: BlockDef) => {
            const block = this.props.createBlock(this.props.widgetDef.blockDef!)
            this.handleBlockDefChange(block.replaceBlock(selectedBlock.id, blockDef))
          }
        }

        return (
          <div className="widget-designer-editor">
            {selectedBlock.renderEditor(props)}
          </div>
        )
      }
    }

    return (
      <div className="widget-designer-editor"/>
    )
  }

  render() {
    return (
      <div style={{ height: "100%", padding: 20 }}>
        {this.renderPalette()}
        <div className="widget-designer-block" onClick={this.handleUnselect}>
          {this.renderBlock()}
        </div>
        {this.renderEditor()}
      </div>
    )
  }
}

