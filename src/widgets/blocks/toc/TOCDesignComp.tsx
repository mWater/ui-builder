import React, { ReactNode } from "react"
import _ from 'lodash'
import { TOCBlockDef, TOCItem, alterItems, iterateItems } from "./toc"
import { BlockDef } from ".."
import { useState } from "react"
import produce from "immer"
import uuid from "uuid"
import { localize } from "../../localization"
import SplitPane from "./SplitPane"
import { LabeledProperty, ContextVarPropertyEditor, PropertyEditor, LocalizedTextPropertyEditor, ContextVarExprPropertyEditor } from "../../propertyEditors"
import { Select } from "react-library/lib/bootstrap"
import { LocalizedString } from "mwater-expressions"
import { DesignCtx } from "../../../contexts"
import { TextBlockDef } from "../text"
import { ContextVarExpr } from "../../../ContextVarExpr"

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

  const handleAddItem = () => {
    renderProps.store.alterBlock(blockDef.id, produce((bd: TOCBlockDef) => {
      bd.items.push({
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
    }
    if (depth === 0) {
      itemLabelStyle.fontWeight = "bold"
    }

    return <div>
      <div key="main" style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", backgroundColor: item.id == selectedId ? "#DDD" : undefined }}>
        <div onClick={handleItemClick.bind(null, item)} style={{ cursor: "pointer", paddingTop: 2, paddingLeft: 5 }}>
          { item.id == selectedId ?
            <i className="fa fa-arrow-circle-right text-primary"/>
           : <i className="fa fa-circle-thin text-muted"/> }
        </div>
        <div onClick={handleItemClick.bind(null, item)} style={itemLabelStyle}>
          {renderProps.renderChildBlock(renderProps, item.labelBlock || null, setItemLabelBlock.bind(null, item)) }
        </div>
        { renderCaretMenu(item) }
      </div>
      { item.children.length > 0 ? 
        <div style={{ marginLeft: 10 }} key="children">
          { item.children.map((child, index) => renderItem(item.children, index, depth + 1)) }
        </div>
      : null}
    </div>
  }
  
  // Get selected item
  const selectedItem = iterateItems(blockDef.items).find(item => item.id === selectedId)
  const selectedWidgetId = selectedItem ? selectedItem.widgetId : null

  const handleLabelBlockChange = (labelBlock: BlockDef | null) => {
    alterBlockItems((draft: TOCItem) => {
      if (draft.id === selectedItem!.id) {
        draft.labelBlock = labelBlock
      }
      return draft
    })
  }

  const handleWidgetIdChange = (widgetId: string | null) => {
    alterBlockItems((draft: TOCItem) => {
      if (draft.id === selectedItem!.id) {
        draft.widgetId = widgetId
      }
      return draft
    })
  }

  const handleTitleChange = (title: LocalizedString | null) => {
    alterBlockItems((draft: TOCItem) => {
      if (draft.id === selectedItem!.id) {
        draft.title = title
      }
      return draft
    })
  }

  const handleContextVarMapChange = (contextVarMap: { [internalContextVarId: string]: string }) => {
    alterBlockItems((draft: TOCItem) => {
      if (draft.id === selectedItem!.id) {
        draft.contextVarMap = contextVarMap
      }
      return draft
    })
  }

  const handleConditionChange = (condition: ContextVarExpr) => {
    alterBlockItems((draft: TOCItem) => {
      if (draft.id === selectedItem!.id) {
        draft.condition = condition
      }
      return draft
    })
  }

  const renderRight = () => {
    if (!selectedItem) {
      return null
    }
    
    // Create widget options 
    const widgetOptions = _.sortBy(Object.values(props.renderProps.widgetLibrary.widgets).map(w => ({ label: w.name, value: w.id })), "label")

    const renderContextVarValues = () => {
      if (!selectedItem!.widgetId) {
        return null
      }

      // Find the widget
      const widgetDef = renderProps.widgetLibrary.widgets[selectedItem!.widgetId]
      if (!widgetDef) {
        return null
      }

      const contextVarMap = selectedItem!.contextVarMap || {}

      return (
        <table className="table table-bordered table-condensed">
          <tbody>
            { widgetDef.contextVars.map(contextVar => {
              const cv = contextVarMap[contextVar.id]
              const handleCVChange = (contextVarId: string | null) => {
                if (contextVarId) {
                  handleContextVarMapChange({ ...contextVarMap, [contextVar.id]: contextVarId })
                }
                else {
                  handleContextVarMapChange(produce(contextVarMap, draft => { delete draft[contextVar.id] }))
                }
              }

              return (
                <tr key={contextVar.id}>
                  <td key="name">{contextVar.name}</td>
                  <td key="value">
                    <ContextVarPropertyEditor 
                      contextVars={renderProps.contextVars}  
                      types={[contextVar.type]}
                      table={contextVar.table}
                      value={cv}
                      onChange={handleCVChange}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )
    }

    return (
      <div style={{ padding: 10 }}>
        <LabeledProperty label="Label">
          { renderProps.renderChildBlock(renderProps, selectedItem.labelBlock || null, handleLabelBlockChange)}
        </LabeledProperty>
        <LabeledProperty label="Widget">
          <Select value={selectedWidgetId} onChange={handleWidgetIdChange} options={widgetOptions} nullLabel="Select Widget" />
        </LabeledProperty>
        <LabeledProperty label="Page title (optional)">
          <LocalizedTextPropertyEditor value={selectedItem.title || null} onChange={handleTitleChange} locale={props.renderProps.locale} />
        </LabeledProperty>
        <LabeledProperty label="Variable Mappings">
          {renderContextVarValues()}
        </LabeledProperty>
        <LabeledProperty label="Conditional display (optional)">
          <ContextVarExprPropertyEditor
            schema={renderProps.schema}          
            dataSource={renderProps.dataSource}
            contextVars={renderProps.contextVars}
            contextVarId={selectedItem.condition ? selectedItem.condition.contextVarId : null}
            expr={selectedItem.condition ? selectedItem.condition.expr : null}
            onChange={(contextVarId, expr) => { handleConditionChange({ contextVarId, expr })}}
            types={["boolean"]}
          />
        </LabeledProperty>
      </div>
    )
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