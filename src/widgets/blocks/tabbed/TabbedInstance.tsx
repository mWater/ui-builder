import React from "react"
import * as _ from 'lodash'
import { TabbedBlockDef, TabbedBlockTab } from "./tabbed"
import { localize } from "../../localization"
import { InstanceCtx } from "../../../contexts"

interface Props {
  tabbedBlockDef: TabbedBlockDef
  instanceCtx: InstanceCtx
}

interface State {
  /** Index of currently active tab */
  activeIndex: number

  /** List of indexes of open tabs. This is to *not* render tabs that have not been opened, as maps in particular
   * don't handle rendering when invisible.
   */
  openTabIndexes: number[]
}

export default class TabbedInstance extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      activeIndex: 0,
      openTabIndexes: [0]
    }
  }

  handleSelectTab = (index: number) => {
    this.setState({ 
      activeIndex: index,
      openTabIndexes: _.union(this.state.openTabIndexes, [index])
    })
  }

  renderTab(tab: TabbedBlockTab, index: number) {
    const labelText = localize(tab.label, this.props.instanceCtx.locale)

    return (
      <li className={(this.state.activeIndex === index) ? "active" : ""} key={index}>
        <a onClick={this.handleSelectTab.bind(null, index)}>
          {labelText}
        </a>
      </li>
    )  
  }

  renderTabContent(tab: TabbedBlockTab, index: number) {
    // If not opened, do not render
    if (!this.state.openTabIndexes.includes(index)) {
      return null
    }
    
    const content = this.props.instanceCtx.renderChildBlock(this.props.instanceCtx, tab.content)

    return (
      <div key={index} style={{ display: (this.state.activeIndex === index) ? "block" : "none" }}>
        {content}
      </div>
    )  
  }

  render() {
    // Render tabs
    return (
      <div style={{ paddingTop: 5, paddingBottom: 5 }}>
        <ul className="nav nav-tabs" style={{ marginBottom: 5 }}>
          {this.props.tabbedBlockDef.tabs.map((tab, index) => this.renderTab(tab, index))}
        </ul>
        {this.props.tabbedBlockDef.tabs.map((tab, index) => this.renderTabContent(tab, index))}
      </div>
    )
  }
}
