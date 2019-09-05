import * as React from 'react';
import * as _ from 'lodash';
import { BlockDef, RenderDesignProps, RenderInstanceProps, RenderEditorProps, ContextVar, ChildBlock } from '../blocks'
import { LabeledProperty, PropertyEditor } from '../propertyEditors';
import { NumberInput, Select } from 'react-library/lib/bootstrap';
import CompoundBlock from '../CompoundBlock';
import produce from 'immer';
import { LocalizedString } from 'mwater-expressions';
import { useState, ReactNode } from 'react';
import { localize } from '../localization';
import FillDownwardComponent from 'react-library/lib/FillDownwardComponent';
import uuid = require('uuid');

/** Table of contents with nested items each showing a different block in main area */
export interface TOCBlockDef extends BlockDef {
  type: "toc"

  items: TOCItem[]
}

/** An item within the table of contents */
interface TOCItem {
  /** uuid id */
  id: string

  /** Localized label */
  label: LocalizedString

  /** Content to be displayed when the item is selected */
  content: BlockDef | null

  /** Any children items */
  children: TOCItem[]
}

/** Create a flat list of all items */
const iterateItems = (items: TOCItem[]): TOCItem[] => {
  const flatItems: TOCItem[] = _.flatten(items.map(item => iterateItems(item.children)))
  return items.concat(flatItems)
}

/** Alter each item, allowing item to be mutated, replaced (return item or array of items) or deleted (return null) */
const alterItems = (items: TOCItem[], action: (item: TOCItem) => undefined | null | TOCItem | TOCItem[]): TOCItem[] => {
  return _.flatten(_.compact(items.map(item => action(item)))) as TOCItem[]
}

export class TOCBlock extends CompoundBlock<TOCBlockDef> {
  /** Get child blocks */
  getChildren(contextVars: ContextVar[]): ChildBlock[] {
    // Iterate all 
    return _.compact(iterateItems(this.blockDef.items).map(item => item.content)).map(bd => ({ blockDef: bd!, contextVars: contextVars }))
  }

  validate() { return null }

  processChildren(action: (self: BlockDef) => BlockDef | null): BlockDef {
    return produce(this.blockDef, (draft: TOCBlockDef) => {
      // For each item (in flattened list)
      for (const item of iterateItems(draft.items)) {
        if (item.content) {
          item.content = action(item.content)
        }
      }
    })
  }

  renderDesign(props: RenderDesignProps) {
    return <TOCDesignComp renderProps={props} blockDef={this.blockDef} />
  }

  renderInstance(props: RenderInstanceProps): React.ReactElement<any> {
    return <h1>XUZZU</h1>
    // return (
    //   <table className={ this.blockDef.cellPadding === "condensed" ? "table table-bordered table-condensed" : "table table-bordered" }>
    //     <tbody>
    //       { this.blockDef.rows.map((row, rowIndex) => (
    //         <tr>
    //           { row.cells.map((cell, columnIndex) => <td key="index">{props.renderChildBlock(props, cell.content)}</td>) } 
    //         </tr>
    //       ))}
    //     </tbody>
    //   </table>
    // )
  }
}

const TOCDesignComp = (props: { 
  blockDef: TOCBlockDef
  renderProps: RenderDesignProps 
}) => {
  const { blockDef, renderProps } = props

  // Select first item by default
  const [selectedId, setSelectedId] = useState(blockDef.items[0] ? blockDef.items[0].id : null)

  // Edit mode off by default
  const [editMode, setEditMode] = useState(true)

  // Select item
  const handleItemClick = (item: TOCItem) => { setSelectedId(item.id) }

  /** Find an item by id */
  const findItem = (itemId: string): TOCItem | null => {
    return iterateItems(blockDef.items).find(item => item.id === selectedId) || null
  }

  /** Alter items using an action */
  const alterBlockItems = (action: (draft: TOCItem) => TOCItem | TOCItem[] | undefined | null) => {
    renderProps.store.alterBlock(blockDef.id, produce((bd: TOCBlockDef) => {
      bd.items = alterItems(bd.items, action)
    }))
  }

  /** Set content of active item */
  const handleSetContent = (content: BlockDef) => {
    alterBlockItems((item: TOCItem) => {
      if (item.id === selectedId) {
        item.content = content
      }
      return item
    })
  }

  const editItemLabel = (itemId: string) => {
    const newlabel = prompt("Enter new label")
    if (!newlabel) {
      return
    }

    alterBlockItems((item: TOCItem) => {
      if (item.id === itemId) {
        item.label._base = renderProps.locale
        item.label[renderProps.locale] = newlabel
      }
      return item
    })
  }

  const addChildItem = (itemId: string) => {
    alterBlockItems((item: TOCItem) => {
      if (item.id === itemId) {
        item.children.push({ 
          id: uuid(), 
          label: { _base: renderProps.locale, [renderProps.locale]: "New Item" }, 
          children: [], 
          content: null
        })
      }
      return item
    })
  }

  const deleteItem = (itemId: string) => {
    alterBlockItems((item: TOCItem) => item.id === itemId ? null : item)
  }


  // Render the dropdown gear menu to edit an entry
  const renderGearMenu = (item: TOCItem) => {
    return <CaretMenu items={
      [
        { label: "Edit Label", onClick: () => editItemLabel(item.id)},
        { label: "Add Subitem", onClick: () => addChildItem(item.id)},
        { label: "Delete", onClick: () => deleteItem(item.id)}
      ]
    }/>
  }

  /** Render an item at a specified depth which starts at 0 */
  const renderItem = (item: TOCItem, depth: number) => {
    // Determine style of item label
    const itemLabelStyle: React.CSSProperties = {
      padding: 5
    }
    if (depth === 0) {
      itemLabelStyle.fontWeight = "bold"
    }
    if (item.id === selectedId) {
      itemLabelStyle.backgroundColor = "#DDD"
    }

    return <div>
      <div onClick={handleItemClick.bind(null, item)} style={itemLabelStyle}>
        {localize(item.label, renderProps.locale)}
        { editMode ? renderGearMenu(item) : null }
      </div>
      { item.children.length > 0 ? 
        <div style={{ marginLeft: 10 }}>
          { item.children.map(child => renderItem(child, depth + 1)) }
        </div>
      : null}
    </div>
  }
  
  // Get selected item
  const selectedItem = iterateItems(blockDef.items).find(item => item.id === selectedId)
  const selectedContent = selectedItem ? selectedItem.content : null

  // Render overall structure
  return <SplitPane
    left={blockDef.items.map(item => renderItem(item, 0))}
    right={renderProps.renderChildBlock(renderProps, selectedContent, handleSetContent)}
  />
}

const SplitPane = ({ left, right }: { left: ReactNode, right : ReactNode }) => {
  return <FillDownwardComponent>
    <div className="row" style={{ height: "100%"}}>
      <div className="col-xs-3" style={{ height: "100%"}}>
        {left}
      </div>
      <div className="col-xs-9" style={{ height: "100%", borderLeft: "solid 1px #DDD" }}>
        {right}
      </div>
    </div>
  </FillDownwardComponent>
}

const CaretMenu = (props: { items: Array<{ label: ReactNode, onClick: () => void }>}) => {
  return <div className="btn-group">
    <button type="button" className="btn btn-link btn-xs dropdown-toggle" data-toggle="dropdown">
      <i className="fa fa-caret-down"/>
    </button>
    <ul className="dropdown-menu">
      { props.items.map((item, index) => {
        return <li key={index}><a onClick={item.onClick}>{item.label}</a></li>
      })}
    </ul>
  </div>    
}