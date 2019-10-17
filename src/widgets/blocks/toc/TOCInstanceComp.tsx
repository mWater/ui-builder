import { TOCBlockDef, iterateItems, TOCItem } from "./toc"
import { RenderInstanceProps, CreateBlock } from '../../blocks'
import { useState, useRef } from "react"
import { localize } from '../../localization'
import SplitPane from "./SplitPane"
import React from "react"
import { Page } from "../../../PageStack"
import { PageStackDisplay } from "../../../PageStackDisplay"

/** Instance component for TOC */
export default function TOCInstanceComp(props: { 
  blockDef: TOCBlockDef
  renderProps: RenderInstanceProps 
  createBlock: CreateBlock
}) {
  const { blockDef, renderProps } = props

  // Ref to page stack to ensure closed properly
  const pageStackRef = useRef<PageStackDisplay>(null)

  // Select first item with widget by default
  const firstItem = iterateItems(blockDef.items).find(item => item.widgetId)
  const [selectedId, setSelectedId] = useState(firstItem ? firstItem.id : null)

  // Select item
  const handleItemClick = (item: TOCItem) => { 
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

    // Only allow selecting with content
    if (item.widgetId) {
      setSelectedId(item.id) 
    }
  }

  /** Render an item at a specified depth which starts at 0 */
  const renderItem = (items: TOCItem[], index: number, depth: number) => {
    const item = items[index]

    // Determine style of item label
    const itemLabelStyle: React.CSSProperties = {
      padding: 5,
      cursor: item.widgetId ? "pointer" : "default"
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
    return <div style={{ padding: 10 }}>
      <div key="header">{ renderProps.renderChildBlock(renderProps, blockDef.header) }</div>
      { blockDef.items.map((item, index) => renderItem(blockDef.items, index, 0)) }
      <div key="footer">{ renderProps.renderChildBlock(renderProps, blockDef.footer) }</div>
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
        mappedContextVarValues[innerContextVarId] = renderProps.contextVarValues[outerContextVarId]
      }
      else {
        mappedContextVarValues[innerContextVarId] = null
      }
    }

    const page: Page = {
      contextVarValues: mappedContextVarValues,
      database: renderProps.database,
      type: "normal",
      title: selectedItem.title ? localize(selectedItem.title, renderProps.locale) : undefined,
      widgetId: selectedWidgetId
    }

    // Create page stack
    return <PageStackDisplay
      key={selectedId}
      actionLibrary={renderProps.actionLibrary}
      createBlock={props.createBlock}
      schema={renderProps.schema}
      dataSource={renderProps.dataSource}
      locale={renderProps.locale}
      widgetLibrary={renderProps.widgetLibrary}
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