    import BlockWrapper from "./BlockWrapper"

import * as React from "react"
import { WidgetDef } from "../widgets/widgets"
import { CreateBlock, BlockDef, findBlockAncestry, RenderEditorProps, ContextVar, RenderDesignProps, RenderInstanceProps, Filter } from "../widgets/blocks"
import BlockPlaceholder from "../widgets/BlockPlaceholder"
import "./WidgetDesigner.css"
import { Schema, Expr, DataSource } from "mwater-expressions";
import BlockPalette from "./BlockPalette";
import { Toggle } from 'react-library/lib/bootstrap'
import { MockDatabase } from "../Database"
import { WidgetEditor } from "./WidgetEditor";

interface WidgetDesignerProps {
  widgetDef: WidgetDef
  createBlock: CreateBlock
  schema: Schema
  dataSource: DataSource
  onWidgetDefChange(widgetDef: WidgetDef): void
}

enum Mode { Design, Preview }

interface State {
  mode: Mode
  selectedBlockId: string | null
}

/** Design mode for a single widget */
export default class WidgetDesigner extends React.Component<WidgetDesignerProps, State> {
  constructor(props: WidgetDesignerProps) {
    super(props)
    this.state = {
      mode: Mode.Design,
      selectedBlockId: null
    }
  }

  handleSelect = (blockId: string) => {
    this.setState({ selectedBlockId: blockId })
  }

  // Set the widget block
  handleBlockDefChange = (blockDef: BlockDef | null) => {
    // Canonicalize
    if (blockDef) {
      blockDef = this.props.createBlock(blockDef).process(this.props.createBlock, (b: BlockDef) => {
        return this.props.createBlock(b).canonicalize()
      })
    }
    console.log(JSON.stringify({ ...this.props.widgetDef, blockDef }, null, 2))
    this.props.onWidgetDefChange({ ...this.props.widgetDef, blockDef })
  }

  handleUnselect = () => { this.setState({ selectedBlockId: null }) }

  handleRemoveBlock = (blockId: string) => {
    const block = this.props.createBlock(this.props.widgetDef.blockDef!)
    this.handleBlockDefChange(block.process(this.props.createBlock, (b: BlockDef) => (b.id === blockId) ? null : b))
  }

  createBlockStore() {
    const block = this.props.createBlock(this.props.widgetDef.blockDef!)

    return {
      alterBlock: (blockId: string, action: (blockDef: BlockDef) => BlockDef | null, removeBlockId?: string) => {
        let newBlockDef

        // Do not allow self-removal in drag
        if (removeBlockId === this.props.widgetDef.blockDef!.id) {
          return
        }

        // Remove source block
        if (removeBlockId) {
          newBlockDef = block.process(this.props.createBlock, (b: BlockDef) => (b.id === removeBlockId) ? null : b)
        }
        else {
          newBlockDef = block.blockDef
        }

        // If nothing left
        if (!newBlockDef) {
          this.handleBlockDefChange(null)
          return
        }

        newBlockDef = this.props.createBlock(newBlockDef).process(this.props.createBlock, (b: BlockDef) => (b.id === blockId) ? action(b) : b)
        this.handleBlockDefChange(newBlockDef)
      }
    }
  }

  renderPalette() {
    return <BlockPalette createBlock={this.props.createBlock} schema={this.props.schema} dataSource={this.props.dataSource} />
  }

  renderDesignBlock() {
    // If there is an existing block, render it
    if (this.props.widgetDef.blockDef) {
      const block = this.props.createBlock(this.props.widgetDef.blockDef)

      // Create block store
      const store = this.createBlockStore()

      // Create renderChildBlock
      const renderChildBlock = (props: RenderDesignProps, childBlockDef: BlockDef | null, onSet?: (blockDef: BlockDef) => void) => {
        if (childBlockDef) {
          const childBlock = this.props.createBlock(childBlockDef)
          return (
            <BlockWrapper 
              blockDef={childBlockDef} 
              selectedBlockId={this.state.selectedBlockId} 
              onSelect={this.handleSelect.bind(null, childBlockDef.id)} 
              onRemove={this.handleRemoveBlock.bind(null, childBlockDef.id)} 
              store={store}
            >
              {childBlock.renderDesign(props)}
            </BlockWrapper>
          )
        }
        else {
          return <BlockPlaceholder onSet={onSet}/>
        }
      }

      const renderDesignProps : RenderDesignProps = {
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        selectedId: this.state.selectedBlockId,
        locale: "en",
        contextVars: this.props.widgetDef.contextVars,
        store,
        renderChildBlock: renderChildBlock
      }
    
      return renderChildBlock(renderDesignProps, block.blockDef, this.handleBlockDefChange)
    }
    else {
      // Create placeholder
      return <BlockPlaceholder onSet={this.handleBlockDefChange} />
    }
  }

  renderEditor() {
    if (this.props.widgetDef.blockDef && this.state.selectedBlockId) {
      const store = this.createBlockStore()

      // Find selected block ancestry
      const selectedBlockAncestry = findBlockAncestry(this.props.widgetDef.blockDef, this.props.createBlock, this.state.selectedBlockId)

      // Create props
      if (selectedBlockAncestry) {
        const selectedBlock = selectedBlockAncestry[selectedBlockAncestry.length - 1]

        let contextVars : ContextVar[] = []
        for (let i = 0; i < selectedBlockAncestry.length - 1 ; i++) {
          contextVars = contextVars.concat(selectedBlockAncestry[i].getCreatedContextVars())
        }

        const props : RenderEditorProps = {
          contextVars: contextVars,
          locale: "en",
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          onChange: (blockDef: BlockDef) => {
            store.alterBlock(blockDef.id, () => blockDef)
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
      <div className="widget-designer-editor">
        <WidgetEditor widgetDef={this.props.widgetDef} onWidgetDefChange={this.props.onWidgetDefChange} schema={this.props.schema} dataSource={this.props.dataSource}/>
      </div>
    )
  }

  handleSetMode = (mode: Mode) => { 
    this.setState({mode})
  }

  renderDesign() {
    return [
      this.renderPalette(),
      (
        <div className="widget-designer-block" onClick={this.handleUnselect}>
          {this.renderDesignBlock()}
        </div>
      ),
      this.renderEditor()
    ]
  }

  renderPreview() {
    if (!this.props.widgetDef.blockDef) {
      return null 
    }
    const block = this.props.createBlock(this.props.widgetDef.blockDef)

    const props: RenderInstanceProps = {
      locale: "en",
      database: new MockDatabase(),
      schema: this.props.schema,
      contextVars: this.props.widgetDef.contextVars,
      getContextVarValue(contextVarId: string) { return null },
      getContextVarExprValue(contextVarId: string, expr: Expr) { return null },
      onSelectContextVar(contextVarId: string, primaryKey: any) { return },
      setFilter(contextVarId: string, filter: Filter) { return },
      getFilters(contextVarId: string) { return [] },
      renderChildBlock: (childProps: RenderInstanceProps, childBlockDef: BlockDef | null) => {
        if (!childBlockDef) {
          return <div/>
        }
        
        const childBlock = this.props.createBlock(childBlockDef)
        return childBlock.renderInstance(childProps)
      }
    }
    
    return [
      (<div className="widget-designer-palette"/>),
      (<div className="widget-designer-preview">
        {block.renderInstance(props)}
      </div>),
      (<div className="widget-designer-editor"/>)
    ]
  }

  render() {
    return (
      <div style={{ height: "100%" }}>
        <div className="widget-designer-header">
          <div style={{float: "right"}}>
            <Toggle 
              value={this.state.mode}
              options={[
                { value: Mode.Design, label: [<i key="design" className="fa fa-pencil"/>, " Design"] }, 
                { value: Mode.Preview, label: [<i key="design" className="fa fa-play"/>, " Preview"] }]}
              onChange={this.handleSetMode}
              size="sm"
              />
          </div>
        </div>
        { this.state.mode === Mode.Design ? this.renderDesign() : this.renderPreview() }
      </div>
    )
  }
}

