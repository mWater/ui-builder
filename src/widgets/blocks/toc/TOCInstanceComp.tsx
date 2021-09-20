import _ from 'lodash'
import { TOCBlockDef, iterateItems, TOCItem, TOCBlock } from "./toc"
import { CreateBlock, createExprVariables, createExprVariableValues } from '../../blocks'
import { useState, useRef, useEffect, MouseEvent } from "react"
import { localize } from '../../localization'
import SplitPane from "./SplitPane"
import React from "react"
import { Page } from "../../../PageStack"
import { PageStackDisplay } from "../../../PageStackDisplay"
import { InstanceCtx } from "../../../contexts"
import { ExprUtils } from 'mwater-expressions'
import FillDownwardComponent from 'react-library/lib/FillDownwardComponent'
import { usePageWidth } from '../../../hooks'
import { formatEmbeddedExprString } from '../../../embeddedExprs'

/** Instance component for TOC */
export default function TOCInstanceComp(props: { 
  blockDef: TOCBlockDef
  instanceCtx: InstanceCtx 
  createBlock: CreateBlock
}) {
  const { blockDef, instanceCtx } = props

  // Store overall page width and update it
  const pageWidth = usePageWidth()

  // Ref to page stack to ensure closed properly
  const pageStackRef = useRef<PageStackDisplay>(null)

  const allItems = iterateItems(blockDef.items)

  // Select first item with widget by default
  const firstItem = allItems.find(item => item.widgetId)
  const [selectedId, setSelectedId] = useState(firstItem ? firstItem.id : null)

  // Store collapsed state for items. If not listed, is expanded
  const [collapsedItems, setCollapsedItems] = useState(() => {
    return allItems
      .filter(item => item.collapse == "startCollapsed" || (item.collapse == "startExpanded" && item.collapseWidth != null && pageWidth <= item.collapseWidth))
      .map(item => item.id)
  })

  // When TOC selector is open in collapsed mode
  const [selectorOpen, setSelectorOpen] = useState(false)
  
  /** Only toggle item */
  function handleItemToggle(item: TOCItem, ev: MouseEvent) { 
    ev.stopPropagation()

    // Toggle collapse
    if (item.children.length > 0 && (item.collapse == "startCollapsed" || item.collapse == "startExpanded")) {
      if (collapsedItems.includes(item.id)) {
        setCollapsedItems(_.without(collapsedItems, item.id))
      }
      else {
        setCollapsedItems(_.union(collapsedItems, [item.id]))
      }
    }
  }

  // Select item
  function handleItemClick(item: TOCItem, ev: MouseEvent) { 
    ev.stopPropagation()

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
    setSelectorOpen(false)
  }

  function renderItem(item: TOCItem) {
    // Legacy support of label
    if (item.label != null) {
      return <div>{localize(item.label, instanceCtx.locale)}</div>
    } 
    return instanceCtx.renderChildBlock(instanceCtx, item.labelBlock || null)
  }

  /** Render an item at a specified depth which starts at 0 with children, taking into account visibility */
  const renderItemTree = (items: TOCItem[], index: number, depth: number) => {
    const item = items[index]

    // Determine if visible
    if (item.condition && item.condition.expr) {
      const conditionValue = instanceCtx.getContextVarExprValue(item.condition.contextVarId, item.condition.expr)
      if (conditionValue !== true) {
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
        <div key="expand" className="chevron" onClick={handleItemToggle.bind(null, item)}>
          { collapsible ?
            ( collapsed ? <i className="fas fa-fw fa-caret-right"/> : <i className="fas fa-fw fa-caret-down"/>)
          : <i className="fas fa-fw fa-caret-right" style={{ visibility: "hidden" }}/> }
        </div>
        { renderItem(item) }
      </div>
      { item.children.length > 0 && !collapsed ? 
        <div key="children" className="toc-item-children">
          { item.children.map((child, index) => renderItemTree(item.children, index, depth + 1)) }
        </div>
      : null}
    </div>
  }

  function renderLeft() {
    return <div>
      <div key="header" style={{ padding: 5 }}>{ instanceCtx.renderChildBlock(instanceCtx, blockDef.header) }</div>
      { blockDef.items.map((item, index) => renderItemTree(blockDef.items, index, 0)) }
      <div key="footer" style={{ padding: 5 }}>{ instanceCtx.renderChildBlock(instanceCtx, blockDef.footer) }</div>
    </div>
  }

  // Get selected item
  const selectedItem = iterateItems(blockDef.items).find(item => item.id === selectedId)
  const selectedWidgetId = selectedItem ? selectedItem.widgetId : null

  function getTitle(item: TOCItem): string | undefined {
    if (!item.title) {
      return undefined
    }

    // Get any embedded expression values
    const exprValues = _.map(item.titleEmbeddedExprs || [], ee => instanceCtx.getContextVarExprValue(ee.contextVarId!, ee.expr))

    // Format and replace
    let title = localize(item.title, instanceCtx.locale) 
    title = formatEmbeddedExprString({
      text: title, 
      embeddedExprs: item.titleEmbeddedExprs || [],
      exprValues: exprValues,
      schema: instanceCtx.schema,
      contextVars: instanceCtx.contextVars,
      locale: instanceCtx.locale, 
      formatLocale: instanceCtx.formatLocale
    })
    
    return title
  }
  
  /** Render the right pane (or only pane if collapsed) 
   * @param noTitle do not render title even if item has one
   */
  function renderRight(noTitle: boolean) {
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
      title: !noTitle ? getTitle(selectedItem) : undefined,
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

  // If below minimum, use collapsed view
  if (blockDef.collapseWidth != null && pageWidth <= blockDef.collapseWidth) {
    if (selectedId == null) {
      return <div/>
    }

    const selectedItem = allItems.find(item => item.id == selectedId)
    if (!selectedItem) {
      return <div/>
    }

    const title = getTitle(selectedItem)

    return <div onClick={() => setSelectorOpen(false)}>
      <FillDownwardComponent>
        <div key="header">
          <div 
              key="selected" 
              onClick={ev => {
                ev.stopPropagation()
                setSelectorOpen(v => !v)
              }} 
              className={`toc-select-button${selectorOpen ? " open" : ""}`}
            >
            <i className="fa fa-bars"/>
          </div>
          {" "}
          <div className="toc-select-title">{title}</div>
          { selectorOpen ?
            <div className="toc-selector">
              { renderLeft() }
            </div>
          : null }
        </div>
        { renderRight(true) }
      </FillDownwardComponent>
    </div>
  }

  // Render overall structure
  return <SplitPane
    left={renderLeft()}
    right={renderRight(false)}
    theme={blockDef.theme || "light"}
  />
}
