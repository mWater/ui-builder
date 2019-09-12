import * as React from 'react';
import LeafBlock from '../LeafBlock'
import { BlockDef, RenderDesignProps, RenderInstanceProps, ValidateBlockOptions, CreateBlock, NullBlockStore, ContextVar, duplicateBlockDef } from '../blocks'
import ModalWindowComponent from 'react-library/lib/ModalWindowComponent'
import { BlockPaletteEntry } from '../../designer/blockPaletteEntries';
import { Schema, DataSource } from 'mwater-expressions';
import BlockPlaceholder from '../BlockPlaceholder';
import { useState, useRef, useEffect } from 'react';
import { SearchControl } from './search/SearchBlockInstance';
import TabbedComponent from 'react-library/lib/TabbedComponent'
import { localize } from '../localization';
import uuid = require('uuid');

export interface AddWizardBlockDef extends BlockDef {
  type: "addWizard"
}

/** Displays a popup and transforms into any other kind of block */
export class AddWizardBlock extends LeafBlock<AddWizardBlockDef> {
  createBlock: CreateBlock

  constructor(blockDef: AddWizardBlockDef, createBlock: CreateBlock) {
    super(blockDef)
    this.createBlock = createBlock;
  }

  validate(options: ValidateBlockOptions) { 
    return null 
  }

  renderDesign(props: RenderDesignProps) {
    const handleSet = (newBlockDef: BlockDef | null) => {
      if (newBlockDef) {
        // Duplicate but keep top level id so that selected
        const duplicatedBlockDef = duplicateBlockDef(newBlockDef, this.createBlock)
        duplicatedBlockDef.id = this.blockDef.id
        props.store.alterBlock(this.blockDef.id, (bd) => duplicatedBlockDef)
      }
      else {
        props.store.alterBlock(this.blockDef.id, (bd) => null)
      }
    }

    return (
      <ModalWindowComponent
        isOpen={true}
        onRequestClose={() => handleSet(null)}>
          <AddWizardPane
            blockPaletteEntries={props.blockPaletteEntries}
            createBlock={this.createBlock}
            schema={props.schema}
            dataSource={props.dataSource}
            onSelect={handleSet}
            contextVars={props.contextVars}
          />
        </ModalWindowComponent>
    )
  }

  renderInstance(props: RenderInstanceProps): React.ReactElement<any> {
    return <div/>
  }
}

// Persist default tab
var defaultCurrentTabId = "palette"

/** Pane with search and allowing clicking on a widget to add */
const AddWizardPane = (props: {
  blockPaletteEntries: BlockPaletteEntry[]
  createBlock: CreateBlock
  schema: Schema
  dataSource: DataSource
  onSelect: (blockDef: BlockDef) => void
  contextVars: ContextVar[]
}) => {
  const [search, setSearch] = useState("")
  const [currentTabId, setCurrentTabId] = useState(defaultCurrentTabId)

  // Focus on load
  const searchControl = useRef<SearchControl>(null)
  useEffect(() => { 
    if (searchControl.current) {
      searchControl.current.focus()
    }
  }, [])

  /** Get entries that are controls based off of columns of first row context variable */
  const getControlEntries = () => {
    const allEntries: BlockPaletteEntry[] = []

    // Find context var of type row
    for (const contextVar of props.contextVars.filter(cv => cv.type == "row")) {
      // Get columns
      const columns = props.schema.getColumns(contextVar.table!)

      for (const column of columns) {
        const createLabeledBlock = (child: BlockDef) => {
          allEntries.push({ 
            title: localize(column.name), 
            blockDef: { 
              id: uuid(),
              type: "labeled", 
              label: column.name,
              child: child
            }
          })
        }
    
        if (column.type == "text") {
          createLabeledBlock({
            id: uuid(),
            type: "textbox",
            rowContextVarId: contextVar.id,
            column: column.id
          })
        }

        if (column.type == "number") {
          createLabeledBlock({
            id: uuid(),
            type: "numberbox",
            rowContextVarId: contextVar.id,
            column: column.id
          })
        }

        if (column.type == "date" || column.type == "datetime") {
          createLabeledBlock({
            id: uuid(),
            type: "datefield",
            rowContextVarId: contextVar.id,
            column: column.id
          })
        }

        if (column.type === "enum" || column.type === "enumset" || (column.type === "join" && column.join!.type === "n-1")) {
          createLabeledBlock({
            id: uuid(),
            type: "dropdown",
            rowContextVarId: contextVar.id,
            column: column.id
          })
        }
      }
    }
    return allEntries
  }

  /** Get entries that are expressions based off of columns of first row context variable */
  const getExpressionEntries = () => {
    const allEntries: BlockPaletteEntry[] = []

    // Find context var of type row
    for (const contextVar of props.contextVars.filter(cv => cv.type == "row")) {  
      // Get columns
      const columns = props.schema.getColumns(contextVar.table!)

      for (const column of columns) {
        allEntries.push({ 
          title: localize(column.name), 
          blockDef: { 
            id: uuid(),
            type: "expression", 
            contextVarId: contextVar.id,
            expr: { type: "field", table: contextVar.table!, column: column.id }
          }
        })
      }
    }

    return allEntries
  }
  
  const displayAndFilterEntries = (entries: BlockPaletteEntry[]) => {
    // Compute visible entries
    const visibleEntries = entries.filter(entry => {
      return search ? entry.title.toLowerCase().includes(search.toLowerCase()) : true
    })

    return <div>
      { visibleEntries.map(entry => {
        return <PaletteItem 
          entry={entry}
          createBlock={props.createBlock}
          schema={props.schema}
          dataSource={props.dataSource}
          onSelect={() => props.onSelect(entry.blockDef)} />
      })}
    </div>
  }

  return <div>
    <div>
      <SearchControl value={search} onChange={setSearch} ref={searchControl} placeholder="Search widgets..."/>
    </div>
    <TabbedComponent 
      tabId={currentTabId}
      onTabClick={tabId => { 
        defaultCurrentTabId = tabId
        setCurrentTabId(tabId) 
      }}
      tabs={
        [
          { id: "palette", label: "Palette", elem: displayAndFilterEntries(props.blockPaletteEntries) },
          { id: "controls", label: "Controls", elem: displayAndFilterEntries(getControlEntries()) },
          { id: "expressions", label: "Expressions", elem: displayAndFilterEntries(getExpressionEntries()) }
        ]
      }    
    />
  </div>
}

/** Single item in the palette of block choices */
class PaletteItem extends React.Component<{
  entry: BlockPaletteEntry
  createBlock: CreateBlock
  schema: Schema
  dataSource: DataSource
  onSelect: () => void
}> {
  renderContents() {
    if (this.props.entry.elem) {
      return this.props.entry.elem
    }

    const block = this.props.createBlock(this.props.entry.blockDef)

    return block.renderDesign({
      selectedId: null,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      locale: "en",
      widgetLibrary: { widgets: {} },
      contextVars: [],
      store: new NullBlockStore(),
      blockPaletteEntries: [],
      renderChildBlock: (props, childBlockDef) => {
        if (childBlockDef) {
          const childBlock = this.props.createBlock(childBlockDef)
          return childBlock.renderDesign(props)
        }
        else {
          return <BlockPlaceholder/>
        }
      },
    })
  }

  render() {
    return (
      <div className="add-wizard-palette-item">
        <div className="add-wizard-palette-item-title">{this.props.entry.title}</div>
        {this.renderContents()}
        <div onClick={this.props.onSelect} className="add-wizard-palette-item-cover"/>
      </div>
    )
  }
}
