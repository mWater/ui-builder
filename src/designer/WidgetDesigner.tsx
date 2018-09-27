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
import { DataSourceDatabase } from "../DataSourceDatabase";
import { QueryCompiler } from "../QueryCompiler";
import ContextVarsInjector from "../widgets/ContextVarsInjector";
import { PageStackDisplay } from "../PageStackDisplay";
import { Page } from "../PageStack";
import { WidgetLibrary } from "./widgetLibrary";
import { ActionLibrary } from "../widgets/ActionLibrary";

interface WidgetDesignerProps {
  widgetDef: WidgetDef
  createBlock: CreateBlock
  schema: Schema
  dataSource: DataSource
  actionLibrary: ActionLibrary
  widgetLibrary: WidgetLibrary
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
          const validationError = childBlock.validate({
            schema: this.props.schema, 
            contextVars: props.contextVars,
            actionLibrary: this.props.actionLibrary,
            widgetLibrary: this.props.widgetLibrary
          })
      
          return (
            <BlockWrapper 
              blockDef={childBlockDef} 
              selectedBlockId={this.state.selectedBlockId} 
              onSelect={this.handleSelect.bind(null, childBlockDef.id)} 
              onRemove={this.handleRemoveBlock.bind(null, childBlockDef.id)} 
              store={store}
              validationError={validationError}
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
      let contextVars = this.props.widgetDef.contextVars
      const selectedBlockAncestry = findBlockAncestry(this.props.widgetDef.blockDef, this.props.createBlock, contextVars, this.state.selectedBlockId)

      // Create props
      if (selectedBlockAncestry) {
        const selectedChildBlock = selectedBlockAncestry[selectedBlockAncestry.length - 1]

        for (let i = 0; i < selectedBlockAncestry.length - 1 ; i++) {
          contextVars = contextVars.concat(selectedBlockAncestry[i].contextVars)
        }

        const props : RenderEditorProps = {
          contextVars: contextVars,
          locale: "en",
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          actionLibrary: this.props.actionLibrary,
          widgetLibrary: this.props.widgetLibrary,
          onChange: (blockDef: BlockDef) => {
            store.alterBlock(blockDef.id, () => blockDef)
          }
        }

        // Create block
        const selectedBlock = this.props.createBlock(selectedChildBlock.blockDef)

        // Check for errors
        const validationError = selectedBlock.validate({
          schema: this.props.schema, 
          contextVars: props.contextVars,
          actionLibrary: this.props.actionLibrary,
          widgetLibrary: this.props.widgetLibrary
        })

        return (
          <div className="widget-designer-editor">
            { validationError ? <div className="text-danger">{validationError}</div> : null }
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

  /** Render a preview of the widget in a page */
  renderPreview() {
    if (!this.props.widgetDef.blockDef) {
      return null 
    }

    const database = new DataSourceDatabase(this.props.schema, this.props.dataSource, new QueryCompiler(this.props.schema)) // TODO make non-live

    const lookupWidget = (widgetId: string) => this.props.widgetLibrary.widgets[widgetId]

    // Create normal page to display
    const page: Page = {
      type: "normal",
      contextVarValues: this.props.widgetDef.contextVarPreviewValues,
      database: database,
      widgetId: this.props.widgetDef.id
    }
    const pageElem = <PageStackDisplay 
      initialPage={page} 
      locale="en" 
      schema={this.props.schema} 
      createBlock={this.props.createBlock} 
      actionLibrary={this.props.actionLibrary} 
      lookupWidget={lookupWidget}
      />

    return [
      (<div className="widget-designer-palette"/>),
      (<div className="widget-designer-preview">
        {pageElem}
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