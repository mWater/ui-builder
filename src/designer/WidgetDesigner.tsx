import BlockWrapper from "./BlockWrapper"
import * as React from "react"
import { WidgetDef } from "../widgets/widgets"
import { CreateBlock, BlockDef, findBlockAncestry, RenderEditorProps, RenderDesignProps, getBlockTree } from "../widgets/blocks"
import BlockPlaceholder from "../widgets/BlockPlaceholder"
import "./WidgetDesigner.css"
import { Schema, DataSource } from "mwater-expressions";
import { Toggle } from 'react-library/lib/bootstrap'
import { WidgetEditor } from "./WidgetEditor";
import { PageStackDisplay } from "../PageStackDisplay";
import { Page } from "../PageStack";
import { WidgetLibrary } from "./widgetLibrary";
import { ActionLibrary } from "../widgets/ActionLibrary";
import { Database } from "../database/Database";
import { BlockPaletteEntry } from "./blockPaletteEntries";
import ErrorBoundary from "./ErrorBoundary";
import VirtualDatabase from "../database/VirtualDatabase";
import AddWizardPalette from "./AddWizardPalette"
import ClipboardPalette from "./ClipboardPalette"

interface WidgetDesignerProps {
  widgetDef: WidgetDef
  onWidgetDefChange(widgetDef: WidgetDef): void
  createBlock: CreateBlock
  database: Database
  schema: Schema
  dataSource: DataSource
  actionLibrary: ActionLibrary
  locale: string
  widgetLibrary: WidgetLibrary
  blockPaletteEntries: BlockPaletteEntry[]
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
      blockDef = this.props.createBlock(blockDef).process(this.props.createBlock, (b: BlockDef) => {
        return this.props.createBlock(b).canonicalize()
      })
    }
    this.handleWidgetDefChange({ ...this.props.widgetDef, blockDef })
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
              label={label}
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
        widgetLibrary: this.props.widgetLibrary,
        locale: "en",
        contextVars: this.props.widgetDef.contextVars,
        store,
        blockPaletteEntries: this.props.blockPaletteEntries,
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
      const contextVars = this.props.widgetDef.contextVars
      const selectedBlockAncestry = findBlockAncestry(this.props.widgetDef.blockDef, this.props.createBlock, contextVars, this.state.selectedBlockId)

      // Create props
      if (selectedBlockAncestry) {
        const selectedChildBlock = selectedBlockAncestry[selectedBlockAncestry.length - 1]

        const props : RenderEditorProps = {
          contextVars: selectedChildBlock.contextVars,
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
          <div key="editor" className="widget-designer-editor">
            { validationError ? 
              <div className="text-danger"><i className="fa fa-exclamation-circle"/> {validationError}</div> 
            : null }
            {selectedBlock.renderEditor(props)}
          </div>
        )
      }
    }

    return (
      <div key="editor" className="widget-designer-editor">
        <WidgetEditor widgetDef={this.props.widgetDef} onWidgetDefChange={this.handleWidgetDefChange} schema={this.props.schema} dataSource={this.props.dataSource}/>
      </div>
    )
  }

  handleSetMode = (mode: Mode) => { 
    if (!this.props.widgetDef.blockDef) {
      return
    }

    // Verify before allowing preview
    if (mode === Mode.Preview) {
      for (const childBlock of getBlockTree(this.props.widgetDef.blockDef, this.props.createBlock, this.props.widgetDef.contextVars)) {
        const block = this.props.createBlock(childBlock.blockDef)
        
        if (block.validate({ 
          schema: this.props.schema, 
          actionLibrary: this.props.actionLibrary, 
          widgetLibrary: this.props.widgetLibrary,
          contextVars: childBlock.contextVars
         })) {
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

    let database: Database = this.props.database

    const virtualizeDatabase = false

    if (virtualizeDatabase) {
      // Make non-live TODO needed? Could make big queries for counts/sums if mutated
      database = new VirtualDatabase(database, this.props.schema, this.props.locale)
    }

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
      dataSource={this.props.dataSource}
      createBlock={this.props.createBlock} 
      actionLibrary={this.props.actionLibrary} 
      widgetLibrary={this.props.widgetLibrary}
      />

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
            <ClipboardPalette onSelect={this.handleSelect} createBlock={this.props.createBlock}/>
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
