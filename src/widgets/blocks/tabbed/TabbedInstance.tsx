import React, { useState } from "react"
import * as _ from 'lodash'
import { TabbedBlockDef, TabbedBlockTab } from "./tabbed"
import { localize } from "../../localization"
import { InstanceCtx } from "../../../contexts"
import { usePageWidth } from "../../../hooks"

export function TabbedInstance(props: {
  blockDef: TabbedBlockDef
  instanceCtx: InstanceCtx
}) {

  /** Index of currently active tab */
  const [activeIndex, setActiveIndex] = useState(0)

  /** List of indexes of open tabs. This is to *not* render tabs that have not been opened, as maps in particular
   * don't handle rendering when invisible.
   */
  const [openTabIndexes, setOpenTabIndexes] = useState<number[]>([0])
  
  // Store overall page width and update it
  const pageWidth = usePageWidth()

  function handleSelectTab(index: number) {
    setActiveIndex(index)
    setOpenTabIndexes(openTabIndexes => _.union(openTabIndexes, [index]))
  }

  function renderTab(tab: TabbedBlockTab, index: number) {
    const labelText = localize(tab.label, props.instanceCtx.locale)

    return (
      <li className={(activeIndex === index) ? "active" : ""} key={index}>
        <a onClick={handleSelectTab.bind(null, index)} style={{ cursor: "pointer" }}>
          {labelText}
        </a>
      </li>
    )  
  }

  function renderTabContent(tab: TabbedBlockTab, index: number) {
    // If not opened, do not render
    if (!openTabIndexes.includes(index)) {
      return null
    }
    
    const content = props.instanceCtx.renderChildBlock(props.instanceCtx, tab.content)

    return (
      <div key={index} style={{ display: (activeIndex === index) ? "block" : "none" }}>
        {content}
      </div>
    )  
  }

  // If below minimum, use collapsed view
  if (props.blockDef.collapseWidth != null && pageWidth <= props.blockDef.collapseWidth) {
    function getTabLabel(tab: TabbedBlockTab) {
      return localize(tab.label, props.instanceCtx.locale)
    }

    // Get current tab label
    const labelText = getTabLabel(props.blockDef.tabs[activeIndex])

    return (
      <div style={{ paddingTop: 5, paddingBottom: 5 }}>
        <div className="btn-group" key="selector" style={{ marginBottom: 10 }}>
          <button type="button" className="btn btn-default dropdown-toggle" data-toggle="dropdown">
            {labelText} <i className="fa fa-caret-down"/>
          </button>
          <ul className="dropdown-menu">
            { props.blockDef.tabs.map((tab, index) => {
              return <li key={index}><a onClick={handleSelectTab.bind(null, index)}>{getTabLabel(tab)}</a></li>
            })}
          </ul>
        </div>    
        {props.blockDef.tabs.map((tab, index) => renderTabContent(tab, index))}
      </div>
    )
  }

  // Render tabs
  return (
    <div style={{ paddingTop: 5, paddingBottom: 5 }}>
      <ul className="nav nav-tabs" style={{ marginBottom: 5 }}>
        {props.blockDef.tabs.map((tab, index) => renderTab(tab, index))}
      </ul>
      {props.blockDef.tabs.map((tab, index) => renderTabContent(tab, index))}
    </div>
  )
}
