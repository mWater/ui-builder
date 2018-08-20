import BlockWrapper from "./BlockWrapper";

import * as React from "react";
import { WidgetDef } from "./Widgets";
import { BlockFactory, BlockDef, DropSide, Block } from "./blocks";

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

  wrapDesignerElem = (blockDef: BlockDef, elem: React.ReactElement<any>) => {
    return (
      <BlockWrapper blockDef={blockDef} selectedBlockId={this.state.selectedBlockId} onSelect={this.handleSelect.bind(null, blockDef.id)} isOver={true}>
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

  renderBlock() {
    // If there is an existing block, render it
    if (this.props.widgetDef.blockDef) {
      const block = this.props.blockFactory(this.props.widgetDef.blockDef)
    
      // Create block store
      return block.renderDesign({
        contextVars: this.props.widgetDef.contextVars,
        store: this.createBlockStore(block),
        wrapDesignerElem: this.wrapDesignerElem,
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
      <div style={{ height: "100%", padding: 20 }} onClick={this.handleUnselect}>
        { /* TODO LEFT PANE */ }
        {this.renderBlock()}
        { /* TODO RIGHT PANE */ }
      </div>
    )
  }
}

class BlockPlaceholder extends React.Component<{ onSet: (blockDef: BlockDef) => void}> {
  render() {
    return <div/>
  }
}