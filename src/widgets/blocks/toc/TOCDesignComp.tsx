import React, { ReactNode } from "react"
import { TOCBlockDef, TOCItem, alterItems, iterateItems } from "./toc"
import { BlockDef } from ".."
import { useState } from "react"
import produce from "immer"
import uuid from "uuid"
import SplitPane from "./SplitPane"
import { DesignCtx } from "../../../contexts"
import { TextBlockDef } from "../text"
import { TOCDesignRightPane } from "./TOCDesignRightPane"

/** Designer component for TOC */
export default function TOCDesignComp(props: { 
  blockDef: TOCBlockDef
  renderProps: DesignCtx 
}) {
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

  function handleSetItems(items: TOCItem[]) {
    renderProps.store.alterBlock(blockDef.id, produce((bd: TOCBlockDef) => {
      bd.items = items
    }))
  }

  const handleAddItem = () => {
    handleSetItems(produce(blockDef.items, draft => {
      draft.push({
        id: uuid(), 
        labelBlock: { type: "text", id: uuid.v4(), text: { _base: renderProps.locale, [renderProps.locale]: "New Item" }} as TextBlockDef, 
        children: [],
        contextVarMap: {}
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

  const setItemLabelBlock = (item: TOCItem, labelBlock: BlockDef | null) => {
    alterBlockItems((draft: TOCItem) => {
      if (draft.id === item.id) {
        draft.labelBlock = labelBlock
      }
      return draft
    })
  }

  function handleSetChildren(item: TOCItem, children: TOCItem[]) {
    alterBlockItems((draft: TOCItem) => {
      if (draft.id === item.id) {
        draft.children = children
      }
      return draft
    })
  }

  const addChildItem = (itemId: string) => {
    alterBlockItems((item: TOCItem) => {
      if (item.id === itemId) {
        item.children.push({ 
          id: uuid(), 
          labelBlock: { type: "text", id: uuid.v4(), text: { _base: renderProps.locale, [renderProps.locale]: "New Item" }} as TextBlockDef, 
          children: []
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
        { label: "Add Subitem", onClick: () => addChildItem(item.id)},
        { label: "Delete", onClick: () => deleteItem(item.id)}
      ]
    }/>
  }

  const renderLeft = () => {
    return <div style={{ padding: 10 }}>
      { renderProps.renderChildBlock(renderProps, blockDef.header, handleHeaderSet) }
      { renderItems(blockDef.items, 0, handleSetItems) }
      <button type="button" className="btn btn-link btn-xs" onClick={handleAddItem}>
        <i className="fa fa-plus"/> Add Item
      </button>
      { renderProps.renderChildBlock(renderProps, blockDef.footer, handleFooterSet) }
    </div>
  }

  function renderItems(items: TOCItem[], depth: number, onItemsChange: (items: TOCItem[]) => void) {
    return items.map((item, index) => renderItem(blockDef.items, index, depth))
  }

  /** Render an item at a specified depth which starts at 0 */
  function renderItem(items: TOCItem[], index: number, depth: number) {
    const item = items[index]

    // Determine style of item label
    const itemLabelStyle: React.CSSProperties = {
      padding: 5,
    }
    if (depth === 0) {
      itemLabelStyle.fontWeight = "bold"
    }

    return <div>
      <div key="main" style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", backgroundColor: item.id == selectedId ? "#DDD" : undefined }}>
        <div onClick={handleItemClick.bind(null, item)} style={{ cursor: "pointer", paddingTop: 2, paddingLeft: 5 }}>
          {item.id == selectedId ?
            <i className="fa fa-arrow-circle-right text-primary" />
            : <i className="fa fa-circle-thin" style={{ color: "#EEE" }} />}
        </div>
        <div onClick={handleItemClick.bind(null, item)} style={itemLabelStyle}>
          {renderProps.renderChildBlock(renderProps, item.labelBlock || null, setItemLabelBlock.bind(null, item))}
        </div>
        {renderCaretMenu(item)}
      </div>
      {item.children.length > 0 ?
        <div style={{ marginLeft: 10 }} key="children">
          { renderItems(item.children, depth + 1, handleSetChildren.bind(null, item)) }
        </div>
        : null}
    </div>
  }
  
  // Get selected item
  const selectedItem = iterateItems(blockDef.items).find(item => item.id === selectedId)

  const renderRight = () => {
    if (!selectedItem) {
      return null
    }

    return <TOCDesignRightPane
      selectedItem={selectedItem}
      renderProps={renderProps}
      onItemChange={ item => {
        alterBlockItems(draft => {
          if (draft.id == selectedItem.id) {
            return item
          }
          return draft
        })
      }}
    />
  }

  // Render overall structure
  return <SplitPane
    left={renderLeft()}
    right={renderRight()}
    removePadding={false}
  />
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

