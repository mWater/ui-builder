import _ from 'lodash'
import { TOCBlockDef, iterateItems, TOCItem, TOCBlock } from "./toc"
import { CreateBlock, createExprVariables, createExprVariableValues } from '../../blocks'
import { useState, useRef } from "react"
import { localize } from '../../localization'
import SplitPane from "./SplitPane"
import React from "react"
import { Page } from "../../../PageStack"
import { PageStackDisplay } from "../../../PageStackDisplay"
import { InstanceCtx } from "../../../contexts"
import { ExprUtils } from 'mwater-expressions'

/** Instance component for TOC */
export default function TOCInstanceComp(props: { 
  blockDef: TOCBlockDef
  instanceCtx: InstanceCtx 
  createBlock: CreateBlock
}) {
  const { blockDef, instanceCtx } = props

  // Ref to page stack to ensure closed properly
  const pageStackRef = useRef<PageStackDisplay>(null)

  // Select first item with widget by default
  const firstItem = iterateItems(blockDef.items).find(item => item.widgetId)
  const [selectedId, setSelectedId] = useState(firstItem ? firstItem.id : null)

  // Store collapsed state for items. If not listed, is expanded
  const [collapsedItems, setCollapsedItems] = useState(() => {
    return iterateItems(blockDef.items).filter(item => item.collapse == "startCollapsed").map(item => item.id)
  })

  // Select item
  const handleItemClick = (item: TOCItem) => { 
    // Toggle collapse
    if (item.children.length > 0 && (item.collapse == "startCollapsed" || item.collapse == "startExpanded")) {
      if (collapsedItems.includes(item.id)) {
        setCollapsedItems(_.without(collapsedItems, item.id))
      }
      else {
        setCollapsedItems(_.union(collapsedItems, [item.id]))
      }
    }

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

    // Determine if visible
    if (item.condition && item.condition.expr) {
      const conditionValue = instanceCtx.getContextVarExprValue(item.condition.contextVarId, item.condition.expr)
      if (conditionValue === false) {
        return null
      }
    }

    const collapsible = item.children.length > 0 && (item.collapse == "startCollapsed" || item.collapse == "startExpanded")

    const labelClasses = ["toc-item-label", `toc-item-label-level${depth}`]
    if (item.id === selectedId) {
      labelClasses.push(`toc-item-label-selected bg-primary`)
    }
    if (item.widgetId || collapsible) {
      labelClasses.push("toc-item-label-selectable")
    }

    // Determine if collapsed
    const collapsed = collapsedItems.includes(item.id)

    return <div key={item.id} className={`toc-item toc-item-level${depth}`}>
      <div key="label" className={labelClasses.join(" ")} onClick={handleItemClick.bind(null, item)}>
        <div key="expand" className="chevron">
          { collapsible ?
            ( collapsed ? <i className="fas fa-fw fa-caret-right"/> : <i className="fas fa-fw fa-caret-down"/>)
          : <i className="fas fa-fw fa-caret-right" style={{ visibility: "hidden" }}/> }
        </div>
        { item.label != null ? 
          localize(item.label, instanceCtx.locale) // Legacy support of label
          : 
          instanceCtx.renderChildBlock(instanceCtx, item.labelBlock || null)
        }
      </div>
      { item.children.length > 0 && !collapsed ? 
        <div key="children" className="toc-item-children">
          { item.children.map((child, index) => renderItem(item.children, index, depth + 1)) }
        </div>
      : null}
    </div>
  }

  const renderLeft = () => {
    return <div>
      <div key="header" style={{ padding: 5 }}>{ instanceCtx.renderChildBlock(instanceCtx, blockDef.header) }</div>
      { blockDef.items.map((item, index) => renderItem(blockDef.items, index, 0)) }
      <div key="footer" style={{ padding: 5 }}>{ instanceCtx.renderChildBlock(instanceCtx, blockDef.footer) }</div>
    </div>
  }

  // Get selected item
  const selectedItem = iterateItems(blockDef.items).find(item => item.id === selectedId)
  const selectedWidgetId = selectedItem ? selectedItem.widgetId : null
  
  const renderRight = () => {
    if (!selectedId || !selectedWidgetId || !selectedItem) {
      return null
    }

    // Get widget
    const widget = instanceCtx.widgetLibrary.widgets[selectedWidgetId]

    // Map context var values
    const mappedContextVarValues = {} as object

    // For each context variable that the widget needs
    for (const innerContextVar of widget.contextVars) {
      const outerContextVarId = (selectedItem.contextVarMap || {})[innerContextVar.id]

      if (outerContextVarId) {
        // Look up outer context variable
        const outerCV = instanceCtx.contextVars.find(cv => cv.id == outerContextVarId)
        if (!outerCV) {
          throw new Error("Outer context variable not found")
        }

        // Get value 
        let outerCVValue = instanceCtx.contextVarValues[outerCV.id]

        // Add filters if rowset
        if (outerCV.type == "rowset") {
          outerCVValue = {
            type: "op",
            op: "and",
            table: outerCV.table!,
            exprs: _.compact([outerCVValue].concat(_.map(instanceCtx.getFilters(outerCV.id), f => f.expr)))
          }
        }

        // Inline variables used in rowsets as they may depend on context variables that aren't present in new page
        if (outerCV.type == "rowset") {
          outerCVValue = new ExprUtils(instanceCtx.schema, createExprVariables(instanceCtx.contextVars)).inlineVariableValues(outerCVValue, createExprVariableValues(instanceCtx.contextVars, instanceCtx.contextVarValues))
        }

        mappedContextVarValues[innerContextVar.id] = outerCVValue
      }
      else {
        mappedContextVarValues[innerContextVar.id] = null
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
    theme={blockDef.theme || "light"}
  />
}