import _ from 'lodash'
import BlockWrapper from "./BlockWrapper"
import * as React from "react"
import { WidgetDef } from "../widgets/widgets"
import { BlockDef, findBlockAncestry, getBlockTree, ContextVar } from "../widgets/blocks"
import BlockPlaceholder from "../widgets/BlockPlaceholder"
import "./WidgetDesigner.css"
import { Toggle } from 'react-library/lib/bootstrap'
import { WidgetEditor } from "./WidgetEditor";
import { PageStackDisplay } from "../PageStackDisplay";
import { Page } from "../PageStack";
import { Database } from "../database/Database";
import { BlockPaletteEntry } from "./blockPaletteEntries";
import ErrorBoundary from "./ErrorBoundary";
import VirtualDatabase from "../database/VirtualDatabase";
import AddWizardPalette from "./AddWizardPalette"
import ClipboardPalette from "./ClipboardPalette"
import { BaseCtx, DesignCtx } from "../contexts"
import { DataSource } from "mwater-expressions"

interface WidgetDesignerProps {
  baseCtx: BaseCtx
  dataSource: DataSource
  widgetDef: WidgetDef
  onWidgetDefChange(widgetDef: WidgetDef): void
  blockPaletteEntries: BlockPaletteEntry[]

  /** Global context variable values to use for preview mode */
  globalContextVarValues?: { [contextVarId: string]: any }
}

enum Mode { Design, Preview }

interface State {
  mode: Mode
  selectedBlockId: string | null
  undoStack: WidgetDef[]
  redoStack: WidgetDef[]
}

/** Design mode for a single widget */
export default class WidgetDesigner extends React.Component<WidgetDesignerProps, State> {
  constructor(props: WidgetDesignerProps) {
    super(props)
    this.state = {
      mode: Mode.Design,
      selectedBlockId: null,
      undoStack: [],
      redoStack: []
    }
  }

  handleSelect = (blockId: string) => {
    this.setState({ selectedBlockId: blockId })
  }

  /** Handle change including undo stack  */
  handleWidgetDefChange = (widgetDef: WidgetDef) => {
    this.setState({ undoStack: this.state.undoStack.concat([this.props.widgetDef]), redoStack: [] })
    this.props.onWidgetDefChange(widgetDef)
  }

  handleUndo = () => {
    if (this.state.undoStack.length === 0) {
      return
    }
    const undoValue = _.last(this.state.undoStack)
    this.setState({ undoStack: _.initial(this.state.undoStack), redoStack: this.state.redoStack.concat([this.props.widgetDef]) })
    this.props.onWidgetDefChange(undoValue)
  }

  handleRedo = () => {
    if (this.state.redoStack.length === 0) {
      return
    }
    const redoValue = _.last(this.state.redoStack)
    this.setState({ redoStack: _.initial(this.state.redoStack), undoStack: this.state.undoStack.concat([this.props.widgetDef]) })
    this.props.onWidgetDefChange(redoValue)
  }


  // Set the widget block
  handleBlockDefChange = (blockDef: BlockDef | null) => {
    // Canonicalize
    if (blockDef) {
      blockDef = this.props.baseCtx.createBlock(blockDef).process(this.props.baseCtx.createBlock, (b: BlockDef) => {
        return this.props.baseCtx.createBlock(b).canonicalize()
      })
    }
    this.handleWidgetDefChange({ ...this.props.widgetDef, blockDef })
  }

  handleUnselect = () => { this.setState({ selectedBlockId: null }) }

  handleRemoveBlock = (blockId: string) => {
    const block = this.props.baseCtx.createBlock(this.props.widgetDef.blockDef!)
    this.handleBlockDefChange(block.process(this.props.baseCtx.createBlock, (b: BlockDef) => (b.id === blockId) ? null : b))
  }

  createBlockStore() {
    const alterBlock = (blockId: string, action: (blockDef: BlockDef) => BlockDef | null, removeBlockId?: string) => {
      let newBlockDef

      const block = this.props.baseCtx.createBlock(this.props.widgetDef.blockDef!)

      // Do not allow self-removal in drag
      if (removeBlockId === this.props.widgetDef.blockDef!.id) {
        return
      }

      // Remove source block
      if (removeBlockId) {
        newBlockDef = block.process(this.props.baseCtx.createBlock, (b: BlockDef) => (b.id === removeBlockId) ? null : b)
      }
      else {
        newBlockDef = block.blockDef
      }

      // If nothing left
      if (!newBlockDef) {
        this.handleBlockDefChange(null)
        return
      }

      newBlockDef = this.props.baseCtx.createBlock(newBlockDef).process(this.props.baseCtx.createBlock, (b: BlockDef) => (b.id === blockId) ? action(b) : b)
      this.handleBlockDefChange(newBlockDef)
    }

    const replaceBlock = (blockDef: BlockDef) => {
      alterBlock(blockDef.id, () => blockDef)
    }

    return { alterBlock, replaceBlock }
  }

  createDesignCtx() {
    // Create block store
    const store = this.createBlockStore()

    const widgetContextVars = (this.props.baseCtx.globalContextVars || [])
      .concat(this.props.widgetDef.contextVars)
      .concat(this.props.widgetDef.privateContextVars || [])

    const designCtx : DesignCtx = {
      ...this.props.baseCtx,
      dataSource: this.props.dataSource,
      selectedId: this.state.selectedBlockId,
      contextVars: widgetContextVars,
      store,
      blockPaletteEntries: this.props.blockPaletteEntries,
      // Will be set below
      renderChildBlock: {} as any
    }

    // Create renderChildBlock
    const renderChildBlock = (childDesignCtx: DesignCtx, childBlockDef: BlockDef | null, onSet?: (blockDef: BlockDef) => void) => {
      if (childBlockDef) {
        const childBlock = this.props.baseCtx.createBlock(childBlockDef)
        const validationError = childBlock.validate(childDesignCtx)

        // Gets the label of the block which is displayed on hover
        const label = childBlock.getLabel()
    
        return (
          <BlockWrapper 
            blockDef={childBlockDef} 
            selectedBlockId={this.state.selectedBlockId} 
            onSelect={this.handleSelect.bind(null, childBlockDef.id)} 
            onRemove={this.handleRemoveBlock.bind(null, childBlockDef.id)} 
            store={store}
            validationError={validationError}
            label={label}>
            {childBlock.renderDesign(childDesignCtx)}
          </BlockWrapper>
        )
      }
      else {
        return <BlockPlaceholder onSet={onSet}/>
      }
    }

    designCtx.renderChildBlock = renderChildBlock
    return designCtx
  }

  renderDesignBlock() {
    // If there is an existing block, render it
    if (this.props.widgetDef.blockDef) {
      const block = this.props.baseCtx.createBlock(this.props.widgetDef.blockDef)
      const designCtx = this.createDesignCtx()
    
      return designCtx.renderChildBlock(designCtx, block.blockDef, this.handleBlockDefChange)
    }
    else {
      // Create placeholder
      return <BlockPlaceholder onSet={this.handleBlockDefChange} />
    }
  }

  renderEditor() {
    if (this.props.widgetDef.blockDef && this.state.selectedBlockId) {
      // Find selected block ancestry
      const contextVars = (this.props.baseCtx.globalContextVars || [])
        .concat(this.props.widgetDef.contextVars)
        .concat(this.props.widgetDef.privateContextVars || [])
      const selectedBlockAncestry = findBlockAncestry(this.props.widgetDef.blockDef, this.props.baseCtx.createBlock, contextVars, this.state.selectedBlockId)

      // Create props
      if (selectedBlockAncestry) {
        const selectedChildBlock = selectedBlockAncestry[selectedBlockAncestry.length - 1]

        // Create block
        const selectedBlock = this.props.baseCtx.createBlock(selectedChildBlock.blockDef)

        // Use context variables for the block
        const designCtx = { ...this.createDesignCtx(), contextVars: selectedChildBlock.contextVars }

        // Check for errors
        const validationError = selectedBlock.validate(designCtx)

        return (
          <div key="editor" className="widget-designer-editor">
            { validationError ? 
              <div className="text-danger"><i className="fa fa-exclamation-circle"/> {validationError}</div> 
            : null }
            {selectedBlock.renderEditor(designCtx)}
          </div>
        )
      }
    }

    return (
      <div key="editor" className="widget-designer-editor">
        <WidgetEditor widgetDef={this.props.widgetDef} onWidgetDefChange={this.handleWidgetDefChange} designCtx={this.createDesignCtx()}/>
      </div>
    )
  }

  handleSetMode = (mode: Mode) => { 
    if (!this.props.widgetDef.blockDef) {
      return
    }

    // Verify before allowing preview
    if (mode === Mode.Preview) {
      const contextVars = (this.props.baseCtx.globalContextVars || [])
        .concat(this.props.widgetDef.contextVars)
        .concat(this.props.widgetDef.privateContextVars || [])
      for (const childBlock of getBlockTree(this.props.widgetDef.blockDef, this.props.baseCtx.createBlock, contextVars)) {
        const block = this.props.baseCtx.createBlock(childBlock.blockDef)
        
        // Use context vars for the block
        const designCtx = { ...this.createDesignCtx(), contextVars: childBlock.contextVars }

        if (block.validate(designCtx)) {
           alert("Correct errors first")
           return
         }
      }
    }
    this.setState({mode})
  }

  renderDesign() {
    return [
      (
        <div key="designer" className="widget-designer-block" onClick={this.handleUnselect}>
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

    let database: Database = this.props.baseCtx.database

    const virtualizeDatabase = false

    if (virtualizeDatabase) {
      // Make non-live TODO needed? Could make big queries for counts/sums if mutated
      database = new VirtualDatabase(database, this.props.baseCtx.schema, this.props.baseCtx.locale)
    }

    // Include global context values if present
    const contextVarValues = { 
      ...this.props.widgetDef.contextVarPreviewValues, 
      ...(this.props.globalContextVarValues || {}) 
    }

    // Create normal page to display
    const page: Page = {
      type: "normal",
      contextVarValues: contextVarValues,
      database: database,
      widgetId: this.props.widgetDef.id
    }
    const pageElem = <PageStackDisplay 
      baseCtx={this.props.baseCtx}
      initialPage={page} />

    return [
      (<div key="preview" className="widget-preview-block">
        <ErrorBoundary>
          {pageElem}
        </ErrorBoundary>
      </div>),
      (<div key="editor" className="widget-designer-editor"/>)
    ]
  }

  render() {
    return (
      <div className="widget-designer">
        <div className="widget-designer-header">
          <AddWizardPalette onSelect={this.handleSelect}/>
          <div style={{float: "right"}}>
            <ClipboardPalette onSelect={this.handleSelect} createBlock={this.props.baseCtx.createBlock}/>
            <button type="button" className="btn btn-link btn-sm" onClick={this.handleUndo} disabled={this.state.undoStack.length === 0}>
              <i className="fa fa-undo"/> Undo              
            </button>
            <button type="button" className="btn btn-link btn-sm" onClick={this.handleRedo} disabled={this.state.redoStack.length === 0}>
              <i className="fa fa-repeat"/> Redo
            </button>
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
