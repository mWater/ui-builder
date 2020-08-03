import _ from 'lodash'
import * as React from 'react';
import LeafBlock from '../LeafBlock'
import { BlockDef, CreateBlock, NullBlockStore, ContextVar, duplicateBlockDef } from '../blocks'
import ModalWindowComponent from 'react-library/lib/ModalWindowComponent'
import { BlockPaletteEntry } from '../../designer/blockPaletteEntries';
import { Schema, DataSource, LocalizedString } from 'mwater-expressions';
import BlockPlaceholder from '../BlockPlaceholder';
import { useState, useRef, useEffect } from 'react';
import { SearchControl } from './search/SearchBlockInstance';
import TabbedComponent from 'react-library/lib/TabbedComponent'
import { localize } from '../localization';
import uuid = require('uuid');
import { ExpressionBlock, ExpressionBlockDef } from './expression';
import { DesignCtx, InstanceCtx } from '../../contexts';
import { LabeledBlockDef } from './labeled';
import { TextboxBlockDef } from './controls/textbox';
import { NumberboxBlockDef } from './controls/numberbox';
import { DatefieldBlockDef } from './controls/datefield';
import { DropdownBlockDef } from './controls/dropdown';
import { WidgetBlockDef } from './widget';
import { Toggle } from 'react-library/lib/bootstrap';
import { HorizontalBlockDef } from './horizontal';
import { TextBlockDef } from './text';

export interface AddWizardBlockDef extends BlockDef {
  type: "addWizard"
}

/** Displays a popup and transforms into any other kind of block */
export class AddWizardBlock extends LeafBlock<AddWizardBlockDef> {
  constructor(blockDef: AddWizardBlockDef) {
    super(blockDef)
  }

  validate(options: DesignCtx) { 
    return null 
  }

  renderDesign(props: DesignCtx) {
    const handleSet = (newBlockDef: BlockDef | null) => {
      if (newBlockDef) {
        // Duplicate but keep top level id so that selected
        const duplicatedBlockDef = duplicateBlockDef(newBlockDef, props.createBlock)
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
            designCtx={props}
            onSelect={handleSet}
            contextVars={props.contextVars}
          />
        </ModalWindowComponent>
    )
  }

  renderInstance(props: InstanceCtx): React.ReactElement<any> {
    return <div/>
  }
}

// Persist default tab
var defaultCurrentTabId = "palette"

/** Mode of expression adding */
type ExpressionMode = "plain" | "labelAbove" | "labelBefore"

/** Pane with search and allowing clicking on a widget to add */
const AddWizardPane = (props: {
  designCtx: DesignCtx
  onSelect: (blockDef: BlockDef) => void
  contextVars: ContextVar[]
}) => {
  const { designCtx } = props
  const [search, setSearch] = useState("")
  const [currentTabId, setCurrentTabId] = useState(defaultCurrentTabId)

  const [expressionMode, setExpressionMode] = useState<ExpressionMode>("plain")

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
      const columns = designCtx.schema.getColumns(contextVar.table!)

      for (const column of columns) {
        const createLabeledBlock = (child: BlockDef) => {
          allEntries.push({ 
            title: localize(column.name) || "", 
            blockDef: { 
              id: uuid(),
              type: "labeled", 
              label: column.name,
              child: child
            } as LabeledBlockDef
          })
        }
    
        if (column.type == "text") {
          createLabeledBlock({
            id: uuid(),
            type: "textbox",
            rowContextVarId: contextVar.id,
            column: column.id
          } as TextboxBlockDef)
        }

        if (column.type == "number") {
          createLabeledBlock({
            id: uuid(),
            type: "numberbox",
            decimal: true,
            rowContextVarId: contextVar.id,
            column: column.id
          } as NumberboxBlockDef)
        }

        if (column.type == "date" || column.type == "datetime") {
          createLabeledBlock({
            id: uuid(),
            type: "datefield",
            rowContextVarId: contextVar.id,
            column: column.id
          } as DatefieldBlockDef)
        }

        if (column.type === "enum" 
          || column.type === "enumset" 
          || column.type === "id" 
          || column.type === "id[]") {
          createLabeledBlock({
            id: uuid(),
            type: "dropdown",
            rowContextVarId: contextVar.id,
            column: column.id
          } as DropdownBlockDef)
        }
      }
    }
    return allEntries
  }

  /** Get entries that are expressions based off of columns of first row context variable */
  const getExpressionEntries = () => {
    const allEntries: BlockPaletteEntry[] = []

    const wrapBlockDef = (label: LocalizedString, blockDef: ExpressionBlockDef): BlockDef => {
      if (expressionMode == "plain") {
        return blockDef
      }
      else if (expressionMode == "labelAbove") {
        return {
          id: uuid(),
          type: "labeled",
          label: label,
          child: blockDef
        } as LabeledBlockDef
      }
      else if (expressionMode == "labelBefore") {
        return {
          id: uuid(),
          type: "horizontal",
          align: "left",
          verticalAlign: "middle",
          items: [
            { id: uuid(), type: "text", text: appendStr(label, ":"), bold: true } as TextBlockDef,
            blockDef
          ]
        } as HorizontalBlockDef
      }
      throw new Error("Not implemented")
    }

    // Find context var of type row
    for (const contextVar of props.contextVars.filter(cv => cv.type == "row")) {  
      // Get columns
      const columns = designCtx.schema.getColumns(contextVar.table!)

      for (const column of columns) {
        allEntries.push({ 
          title: localize(column.name) || "", 
          blockDef: wrapBlockDef(column.name, { 
            id: uuid(),
            type: "expression", 
            contextVarId: contextVar.id,
            expr: { type: "field", table: contextVar.table!, column: column.id },
            format: column.type == "number" ? "," : null
          } as ExpressionBlockDef)
        })
      }
    }

    return allEntries
  }

  /** Get entries that are other embedded widgets */
  const getWidgetEntries = () => {
    const allEntries: BlockPaletteEntry[] = []

    for (const widgetId in props.designCtx.widgetLibrary.widgets) {
      const widget = props.designCtx.widgetLibrary.widgets[widgetId]

      // TODO Skip self 
      allEntries.push({
        title: widget.name,
        subtitle: widget.description,
        blockDef: {
          id: uuid(),
          type: "widget",
          widgetId: widgetId,
          contextVarMap: {}
         } as WidgetBlockDef,
         elem: <div/>
      })
    }

    return allEntries
  }
  
  const displayAndFilterEntries = (entries: BlockPaletteEntry[]) => {
    // Compute visible entries
    const visibleEntries = entries.filter(entry => {
      return search ? entry.title.toLowerCase().includes(search.toLowerCase()) : true
    })

    return <div>
      { visibleEntries.map((entry, index) => {
        return <PaletteItem 
          entry={entry}
          key={index}
          designCtx={designCtx}
          onSelect={() => props.onSelect(typeof entry.blockDef == "function" ? entry.blockDef(props.contextVars) : entry.blockDef)} />
      })}
    </div>
  }

  const renderExpressionOptions = () => {
    return <div style={{ float: "right", paddingRight: 10 }}>
      <Toggle 
        value={expressionMode}
        onChange={setExpressionMode}
        size="sm"
        options={[
          { value: "plain", label: "Plain" },
          { value: "labelAbove", label: "Label Above" },
          { value: "labelBefore", label: "Label Before" }
        ]} />
    </div>
  }

  return <div>
    <div>
      <SearchControl value={search} onChange={setSearch} ref={searchControl} placeholder="Search widgets..."/>
      { currentTabId == "expressions" ? renderExpressionOptions() : null }
    </div>
    <TabbedComponent 
      tabId={currentTabId}
      onTabClick={tabId => { 
        defaultCurrentTabId = tabId
        setCurrentTabId(tabId) 
      }}
      tabs={
        [
          { id: "palette", label: "Palette", elem: displayAndFilterEntries(designCtx.blockPaletteEntries) },
          { id: "controls", label: "Controls", elem: displayAndFilterEntries(getControlEntries()) },
          { id: "expressions", label: "Expressions", elem: displayAndFilterEntries(getExpressionEntries()) },
          { id: "widgets", label: "Widgets", elem: displayAndFilterEntries(getWidgetEntries()) }
        ]
      }    
    />
  </div>
}

/** Single item in the palette of block choices */
class PaletteItem extends React.Component<{
  entry: BlockPaletteEntry
  designCtx: DesignCtx
  onSelect: () => void
}> {
  renderContents() {
    const designCtx = this.props.designCtx

    if (this.props.entry.elem) {
      return this.props.entry.elem
    }

    const entry = this.props.entry
    const block = designCtx.createBlock(typeof entry.blockDef == "function" ? entry.blockDef(designCtx.contextVars) : entry.blockDef)

    return block.renderDesign({
      ...designCtx,
      selectedId: null,
      contextVars: [],
      store: new NullBlockStore(),
      blockPaletteEntries: [],
      renderChildBlock: (props, childBlockDef) => {
        if (childBlockDef) {
          const childBlock = designCtx.createBlock(childBlockDef)
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
        <div className="add-wizard-palette-item-subtitle">{this.props.entry.subtitle}</div>
        <div onClick={this.props.onSelect} className="add-wizard-palette-item-cover"/>
      </div>
    )
  }
}

/** Appends to a localized string */
function appendStr(str: LocalizedString, append: string) {
  return _.mapValues(str, (v, k) => k == "_base" ? v : v + append)
}