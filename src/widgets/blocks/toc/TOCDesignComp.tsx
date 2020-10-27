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
import { DraggableProvidedDragHandleProps, ReorderableList } from "./ReorderableList"

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
  const alterBlockItems = (action: (item: TOCItem) => TOCItem | TOCItem[] | undefined | null) => {
    renderProps.store.replaceBlock(produce(blockDef, draft => {
      draft.items = alterItems(blockDef.items, action)
    }))
  }

  function handleSetItems(items: TOCItem[]) {
    renderProps.store.replaceBlock(produce(blockDef, draft => {
      draft.items = items
    }))
  }

  const handleAddItem = () => {
    renderProps.store.replaceBlock(produce(blockDef, draft => {
      draft.items.push({
        id: uuid(), 
        labelBlock: { type: "text", id: uuid.v4(), text: { _base: renderProps.locale, [renderProps.locale]: "New Item" }} as TextBlockDef, 
        children: [],
        contextVarMap: {}
      })
    }))
  }

  const handleHeaderSet = (header: BlockDef | null) => {
    renderProps.store.replaceBlock(produce(blockDef, draft => {
      draft.header = header
    }))
  }

  const handleFooterSet = (footer: BlockDef | null) => {
    renderProps.store.replaceBlock(produce(blockDef, draft => {
      draft.footer = footer
    }))
  }

  const setItemLabelBlock = (itemId: string, labelBlock: BlockDef | null) => {
    alterBlockItems((item: TOCItem) => {
      if (item.id === itemId) {
        return { ...item, labelBlock }
      }
      return item
    })
  }

  function handleSetChildren(itemId: string, children: TOCItem[]) {
    alterBlockItems((item: TOCItem) => {
      if (item.id === itemId) {
        return { ...item, children }
      }
      return item
    })
  }

  const addChildItem = (itemId: string) => {
    alterBlockItems((item: TOCItem) => {
      if (item.id === itemId) {
        return produce(item, draft => {
          draft.children.push({ 
            id: uuid(), 
            labelBlock: { type: "text", id: uuid.v4(), text: { _base: renderProps.locale, [renderProps.locale]: "New Item" }} as TextBlockDef, 
            children: []
          })
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
    return <ReorderableList
      items={items}
      onItemsChange={onItemsChange}
      getItemId={item => item.id}
      renderItem={(item, index, innerRef, draggableProps, dragHandleProps) => (
        <div {...draggableProps} ref={innerRef}>
          { renderItem(item, index, depth, dragHandleProps) }
        </div>
      )}
    />
  }

  /** Render an item at a specified depth which starts at 0 */
  function renderItem(item: TOCItem, index: number, depth: number, dragHandleProps?: DraggableProvidedDragHandleProps) {
    const labelClasses = ["toc-item-label", `toc-item-label-level${depth}`]
    if (item.id === selectedId) {
      labelClasses.push(`toc-item-label-selected bg-primary`)
    }
    if (item.widgetId) {
      labelClasses.push("toc-item-label-selectable")
    }

    return <div className={`toc-item toc-item-level${depth}`}>
      <div key="main" 
        className={labelClasses.join(" ")}
        style={{ display: "grid", gridTemplateColumns: "auto auto 1fr auto", alignItems: "center" }}
        onClick={handleItemClick.bind(null, item)}>
        <div style={{ cursor: "pointer", paddingTop: 2, paddingLeft: 5 }} {...dragHandleProps}>
          <i className="fa fa-bars text-muted" />
        </div>
        <div>
          {renderProps.renderChildBlock(renderProps, item.labelBlock || null, setItemLabelBlock.bind(null, item.id))}
        </div>
        {renderCaretMenu(item)}
      </div>
      {item.children.length > 0 ?
        <div key="children">
          { renderItems(item.children, depth + 1, handleSetChildren.bind(null, item.id)) }
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
      item={selectedItem}
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
    theme={blockDef.theme || "light"}
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

