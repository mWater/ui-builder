import * as React from 'react'
import * as _ from 'lodash'
import { BlockDef, RenderDesignProps, RenderInstanceProps, ContextVar, ChildBlock } from '../blocks'
import CompoundBlock from '../CompoundBlock'
import produce from 'immer'
import { LocalizedString } from 'mwater-expressions'
import { useState, ReactNode } from 'react'
import { localize } from '../localization'
import FillDownwardComponent from 'react-library/lib/FillDownwardComponent'
import uuid = require('uuid')

/** Table of contents with nested items each showing a different block in main area */
export interface TOCBlockDef extends BlockDef {
  type: "toc"

  /** Nestable items in the table of contents */
  items: TOCItem[]

  /** Optional header */
  header: BlockDef | null

  /** Optional footer */
  footer: BlockDef | null
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
  var flatItems: TOCItem[] = []
  for (const item of items) {
    flatItems.push(item)
    flatItems = flatItems.concat(iterateItems(item.children))
  }
  return flatItems
}

/** Alter each item, allowing item to be mutated, replaced (return item or array of items) or deleted (return null) */
const alterItems = (items: TOCItem[], action: (item: TOCItem) => undefined | null | TOCItem | TOCItem[]): TOCItem[] => {
  const newItems = _.flatten(_.compact(items.map(item => action(item)))) as TOCItem[]

  for (const ni of newItems) {
    ni.children = alterItems(ni.children, action)
  }
  return newItems
}

export class TOCBlock extends CompoundBlock<TOCBlockDef> {
  /** Get child blocks */
  getChildren(contextVars: ContextVar[]): ChildBlock[] {
    // Iterate all 
    return _.compact([this.blockDef.header, this.blockDef.footer].concat(
      iterateItems(this.blockDef.items).map(item => item.content))
      .map(bd => ({ blockDef: bd!, contextVars: contextVars })))
  }

  validate() { return null }

  processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef {
    // Prevent recursive immer use

    // For header and footer
    const header = action(this.blockDef.header)
    const footer = action(this.blockDef.footer)
    const flatItemContents = iterateItems(this.blockDef.items).map(item => action(item.content))

    return produce(this.blockDef, (draft: TOCBlockDef) => {
      draft.header = header
      draft.footer = footer

      // For each item (in flattened list)
      iterateItems(draft.items).forEach((item, index) => {
        item.content = flatItemContents[index]
      })
    })
  }

  renderDesign(props: RenderDesignProps) {
    return <TOCDesignComp renderProps={props} blockDef={this.blockDef} />
  }

  renderInstance(props: RenderInstanceProps): React.ReactElement<any> {
    return <TOCInstanceComp renderProps={props} blockDef={this.blockDef} />
  }
}

/** Designer component for TOC */
const TOCDesignComp = (props: { 
  blockDef: TOCBlockDef
  renderProps: RenderDesignProps 
}) => {
  const { blockDef, renderProps } = props

  // Select first item by default
  const [selectedId, setSelectedId] = useState(blockDef.items[0] ? blockDef.items[0].id : null)

  // Select item
  const handleItemClick = (item: TOCItem) => { setSelectedId(item.id) }

  /** Alter items using an action */
  const alterBlockItems = (action: (draft: TOCItem) => TOCItem | TOCItem[] | undefined | null) => {
    renderProps.store.alterBlock(blockDef.id, produce((bd: TOCBlockDef) => {
      bd.items = alterItems(bd.items, action)
    }))
  }

  const handleAddItem = () => {
    renderProps.store.alterBlock(blockDef.id, produce((bd: TOCBlockDef) => {
      bd.items.push({
        id: uuid(), 
        label: { _base: renderProps.locale, [renderProps.locale]: "New Item" }, 
        children: [], 
        content: null
      })
    }))
  }

  const handleHeaderSet = (header: BlockDef | null) => {
    renderProps.store.alterBlock(blockDef.id, produce((bd: TOCBlockDef) => {
      bd.header = header
    }))
  }

  const handleFooterSet = (footer: BlockDef | null) => {
    renderProps.store.alterBlock(blockDef.id, produce((bd: TOCBlockDef) => {
      bd.footer = footer
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

  const editItemLabel = (item: TOCItem) => {
    const newlabel = prompt("Enter new label", localize(item.label, renderProps.locale))
    if (!newlabel) {
      return
    }

    alterBlockItems((draft: TOCItem) => {
      if (draft.id === item.id) {
        draft.label._base = renderProps.locale
        draft.label[renderProps.locale] = newlabel
      }
      return draft
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
  const renderCaretMenu = (item: TOCItem) => {
    return <CaretMenu items={
      [
        { label: "Edit Label", onClick: () => editItemLabel(item)},
        { label: "Add Subitem", onClick: () => addChildItem(item.id)},
        { label: "Delete", onClick: () => deleteItem(item.id)}
      ]
    }/>
  }

  const renderLeft = () => {
    return <div>
      { renderProps.renderChildBlock(renderProps, blockDef.header, handleHeaderSet) }
      { blockDef.items.map((item, index) => renderItem(blockDef.items, index, 0)) }
      <button type="button" className="btn btn-link btn-xs" onClick={handleAddItem}>
        <i className="fa fa-plus"/> Add Item
      </button>
      { renderProps.renderChildBlock(renderProps, blockDef.footer, handleFooterSet) }
    </div>
  }

  /** Render an item at a specified depth which starts at 0 */
  const renderItem = (items: TOCItem[], index: number, depth: number) => {
    const item = items[index]

    // Determine style of item label
    const itemLabelStyle: React.CSSProperties = {
      padding: 5,
      cursor: "pointer"
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
        { renderCaretMenu(item) }
      </div>
      { item.children.length > 0 ? 
        <div style={{ marginLeft: 10 }}>
          { item.children.map((child, index) => renderItem(item.children, index, depth + 1)) }
        </div>
      : null}
    </div>
  }
  
  // Get selected item
  const selectedItem = iterateItems(blockDef.items).find(item => item.id === selectedId)
  const selectedContent = selectedItem ? selectedItem.content : null

  // Render overall structure
  return <SplitPane
    left={renderLeft()}
    right={selectedItem ? renderProps.renderChildBlock(renderProps, selectedContent, handleSetContent) : null }
  />
}

/** Instance component for TOC */
const TOCInstanceComp = (props: { 
  blockDef: TOCBlockDef
  renderProps: RenderInstanceProps 
}) => {
  const { blockDef, renderProps } = props

  // Select first item with content by default
  const firstItem = iterateItems(blockDef.items).find(item => item.content)
  const [selectedId, setSelectedId] = useState(firstItem ? firstItem.id : null)

  // Select item
  const handleItemClick = (item: TOCItem) => { 
    // Only allow selecting with content
    if (item.content) {
      setSelectedId(item.id) 
    }
  }

  /** Render an item at a specified depth which starts at 0 */
  const renderItem = (items: TOCItem[], index: number, depth: number) => {
    const item = items[index]

    // Determine style of item label
    const itemLabelStyle: React.CSSProperties = {
      padding: 5,
      cursor: item.content ? "pointer" : "default"
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
      </div>
      { item.children.length > 0 ? 
        <div style={{ marginLeft: 10 }}>
          { item.children.map((child, index) => renderItem(item.children, index, depth + 1)) }
        </div>
      : null}
    </div>
  }

  const renderLeft = () => {
    return <div>
      <div key="header">{ renderProps.renderChildBlock(renderProps, blockDef.header) }</div>
      { blockDef.items.map((item, index) => renderItem(blockDef.items, index, 0)) }
      <div key="footer">{ renderProps.renderChildBlock(renderProps, blockDef.footer) }</div>
    </div>
  }
  
  // Get selected item
  const selectedItem = iterateItems(blockDef.items).find(item => item.id === selectedId)
  const selectedContent = selectedItem ? selectedItem.content : null

  // Render overall structure
  return <SplitPane
    left={renderLeft()}
    right={renderProps.renderChildBlock(renderProps, selectedContent)}
  />
}

/** Pane that is split left right */
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

/** Drop down menu that shows as a downward caret */
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