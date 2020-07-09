import { TOCBlockDef, iterateItems, TOCItem } from "./toc"
import { CreateBlock } from '../../blocks'
import { useState, useRef } from "react"
import { localize } from '../../localization'
import SplitPane from "./SplitPane"
import React from "react"
import { Page } from "../../../PageStack"
import { PageStackDisplay } from "../../../PageStackDisplay"
import { InstanceCtx } from "../../../contexts"

/** Instance component for TOC */
export default function TOCInstanceComp(props: { 
  blockDef: TOCBlockDef
  instanceCtx: InstanceCtx 
  createBlock: CreateBlock
}) {
  const { blockDef, instanceCtx: instanceCtx } = props

  // Ref to page stack to ensure closed properly
  const pageStackRef = useRef<PageStackDisplay>(null)

  // Select first item with widget by default
  const firstItem = iterateItems(blockDef.items).find(item => item.widgetId)
  const [selectedId, setSelectedId] = useState(firstItem ? firstItem.id : null)

  // Select item
  const handleItemClick = (item: TOCItem) => { 
    // Only allow selecting with content
    if (!item.widgetId) {
      return
    }

    // Do nothing if same id
    if (item.id == selectedId) {
      return
    }

    // Close all pages
    if (pageStackRef.current) {
      if (!pageStackRef.current.closeAllPages()) {
        return
      }
    }

    setSelectedId(item.id) 
  }

  /** Render an item at a specified depth which starts at 0 */
  const renderItem = (items: TOCItem[], index: number, depth: number) => {
    const item = items[index]

    // Determine style of item label
    const itemLabelStyle: React.CSSProperties = {
      padding: 5,
      cursor: item.widgetId ? "pointer" : "default",
      color: item.widgetId ? undefined : "#737373"
    }
    if (depth === 0) {
      itemLabelStyle.fontWeight = "bold"
    }
    if (item.id === selectedId) {
      itemLabelStyle.backgroundColor = "#DDD"
    }

    return <div key={item.id}>
      <div key="label" onClick={handleItemClick.bind(null, item)} style={itemLabelStyle}>
        {localize(item.label, instanceCtx.locale)}
      </div>
      { item.children.length > 0 ? 
        <div key="children" style={{ marginLeft: 10 }}>
          { item.children.map((child, index) => renderItem(item.children, index, depth + 1)) }
        </div>
      : null}
    </div>
  }

  const renderLeft = () => {
    return <div style={{ padding: 10 }}>
      <div key="header">{ instanceCtx.renderChildBlock(instanceCtx, blockDef.header) }</div>
      { blockDef.items.map((item, index) => renderItem(blockDef.items, index, 0)) }
      <div key="footer">{ instanceCtx.renderChildBlock(instanceCtx, blockDef.footer) }</div>
    </div>
  }

  // Get selected item
  const selectedItem = iterateItems(blockDef.items).find(item => item.id === selectedId)
  const selectedWidgetId = selectedItem ? selectedItem.widgetId : null
  
  const renderRight = () => {
    if (!selectedId || !selectedWidgetId || !selectedItem) {
      return null
    }

    // Map context var values
    const mappedContextVarValues = {} as object

    for (const innerContextVarId of Object.keys(selectedItem.contextVarMap || {})) {
      const outerContextVarId = (selectedItem.contextVarMap || {})[innerContextVarId]
      if (outerContextVarId) {
        mappedContextVarValues[innerContextVarId] = instanceCtx.contextVarValues[outerContextVarId]
      }
      else {
        mappedContextVarValues[innerContextVarId] = null
      }
    }

    // Include global context variables
    for (const globalContextVar of props.instanceCtx.globalContextVars || []) {
      mappedContextVarValues[globalContextVar.id] = props.instanceCtx.contextVarValues[globalContextVar.id]
    }
    
    const page: Page = {
      contextVarValues: mappedContextVarValues,
      database: instanceCtx.database,
      type: "normal",
      title: selectedItem.title ? localize(selectedItem.title, instanceCtx.locale) : undefined,
      widgetId: selectedWidgetId
    }

    // Create page stack
    return <PageStackDisplay
      key={selectedId}
      baseCtx={props.instanceCtx}
      initialPage={page}
      ref={pageStackRef}
      />
  }

  // Render overall structure
  return <SplitPane
    left={renderLeft()}
    right={renderRight()}
    removePadding={blockDef.removePadding || false}
  />
}