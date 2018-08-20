import BlockWrapper from "./BlockWrapper"

import * as React from "react"
import { WidgetDef } from "./Widgets"
import { BlockFactory, BlockDef, DropSide, Block, BlockStore } from "./blocks"
import BlockPlaceholder from "./BlockPlaceholder"
import BlockPaletteItem from "./BlockPaletteItem"
import "./WidgetDesigner.css"

interface Props {
  widgetDef: WidgetDef
  blockFactory: BlockFactory
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
        store={store}
      >
        {elem}
      </BlockWrapper>
    )
  }

  handlePlaceholderSet = (parentBlockId: string, parentBlockSection: string, blockDef: BlockDef) => {
    const block = this.props.blockFactory(this.props.widgetDef.blockDef!)
    this.handleBlockDefChange(block.addBlock(blockDef, parentBlockId, parentBlockSection))
  }

  // Render a placeholder for blocks that can be dropped on
  renderPlaceholder = (parentBlockId: string, parentBlockSection: string) => {
    return <BlockPlaceholder onSet={this.handlePlaceholderSet.bind(null, parentBlockId, parentBlockSection)} />
  }

  // Set the widget block
  handleBlockDefChange = (blockDef: BlockDef | null) => {
    this.props.onWidgetDefChange({ ...this.props.widgetDef, blockDef })
  }

  handleUnselect = () => { this.setState({ selectedBlockId: null }) }

  handleKeyDown = (e: any) => {
    console.log(e.keyCode)
    if (e.keyCode === 46) {  // Delete
      if (this.state.selectedBlockId) {
        const block = this.props.blockFactory(this.props.widgetDef.blockDef!)
        this.handleBlockDefChange(block.replaceBlock(this.state.selectedBlockId, null))
      }
    }
  }
  
  createBlockStore(block: Block) {
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
        newBlockDef = newBlockDef ? this.props.blockFactory(newBlockDef).dropBlock(sourceBlockDef, targetBlockId, dropSide) : newBlockDef

        this.handleBlockDefChange(newBlockDef)
      }
    }
  }

  renderPalette() {
    return (
      <div className="widget-designer-palette">
        <BlockPaletteItem 
          blockDef={{ id: "x", type: "dropdown" }}
          blockFactory={this.props.blockFactory}
        />
        <BlockPaletteItem 
          blockDef={{ id: "x", type: "dropdown" }}
          blockFactory={this.props.blockFactory}
        />
      </div>
    )
  }

  renderBlock() {
    // If there is an existing block, render it
    if (this.props.widgetDef.blockDef) {
      const block = this.props.blockFactory(this.props.widgetDef.blockDef)
      const store = this.createBlockStore(block)
    
      // Create block store
      return block.renderDesign({
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

  render() {
    return (
      <div style={{ height: "100%", padding: 20 }}>
        {this.renderPalette()}
        <div className="widget-designer-block" onClick={this.handleUnselect} onKeyDown={this.handleKeyDown} tabIndex={0}>
          {this.renderBlock()}
        </div>
        { /* TODO RIGHT PANE */ }
      </div>
    )
  }
}

