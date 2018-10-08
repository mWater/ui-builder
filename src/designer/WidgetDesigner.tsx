import BlockWrapper from "./BlockWrapper"
import * as React from "react"
import { WidgetDef } from "../widgets/widgets"
import { CreateBlock, BlockDef, findBlockAncestry, RenderEditorProps, RenderDesignProps, getBlockTree } from "../widgets/blocks"
import BlockPlaceholder from "../widgets/BlockPlaceholder"
import "./WidgetDesigner.css"
import { Schema, DataSource } from "mwater-expressions";
import BlockPalette from "./BlockPalette";
import { Toggle } from 'react-library/lib/bootstrap'
import { WidgetEditor } from "./WidgetEditor";
import { DataSourceDatabase } from "../database/DataSourceDatabase";
import { QueryCompiler } from "../database/QueryCompiler";
import { PageStackDisplay } from "../PageStackDisplay";
import { Page } from "../PageStack";
import { WidgetLibrary } from "./widgetLibrary";
import { ActionLibrary } from "../widgets/ActionLibrary";
import VirtualDatabase from "../database/VirtualDatabase";
import { Database } from "../database/Database";
import { DragDropContext } from "react-dnd";
import HTML5Backend from 'react-dnd-html5-backend'
import { BlockPaletteEntry } from "./blockPaletteEntry";

interface WidgetDesignerProps {
  widgetDef: WidgetDef
  createBlock: CreateBlock
  schema: Schema
  dataSource: DataSource
  actionLibrary: ActionLibrary
  locale: string
  widgetLibrary: WidgetLibrary
  blockPaletteEntries: BlockPaletteEntry[]
  onWidgetDefChange(widgetDef: WidgetDef): void
}

enum Mode { Design, Preview }

interface State {
  mode: Mode
  selectedBlockId: string | null
}

/** Design mode for a single widget */
@DragDropContext(HTML5Backend)
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
    return <BlockPalette 
      key="palette" 
      createBlock={this.props.createBlock} 
      schema={this.props.schema} 
      dataSource={this.props.dataSource} 
      entries={this.props.blockPaletteEntries}
      />
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
        widgetLibrary: this.props.widgetLibrary,
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
        <WidgetEditor widgetDef={this.props.widgetDef} onWidgetDefChange={this.props.onWidgetDefChange} schema={this.props.schema} dataSource={this.props.dataSource}/>
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
      this.renderPalette(),
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

    let database: Database = new DataSourceDatabase(this.props.schema, this.props.dataSource, new QueryCompiler(this.props.schema)) 

    // Make non-live
    database = new VirtualDatabase(database, this.props.schema, this.props.locale)

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
      widgetLibrary={this.props.widgetLibrary}
      />

    return [
      (<div key="palette" className="widget-designer-palette"/>),
      (<div key="preview" className="widget-designer-preview">
        {pageElem}
      </div>),
      (<div key="editor" className="widget-designer-editor"/>)
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