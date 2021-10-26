import React from "react"
import produce from "immer"
import { TabbedBlockDef, TabbedBlockTab } from "./tabbed"
import { BlockDef } from "../../blocks"
import { localize } from "../../localization"
import { DesignCtx } from "../../../contexts"

interface Props {
  tabbedBlockDef: TabbedBlockDef
  designCtx: DesignCtx
}

interface State {
  activeIndex: number
}

export default class TabbedDesigner extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      activeIndex: 0
    }
  }
  /** Handle adding a block to a tab */
  handleAddContent = (tabIndex: number, addedBlockDef: BlockDef) => {
    this.props.designCtx.store.alterBlock(
      this.props.tabbedBlockDef.id,
      produce((b: TabbedBlockDef) => {
        b.tabs[tabIndex].content = addedBlockDef
        return b
      }),
      addedBlockDef.id
    )
  }

  handleSelectTab = (index: number) => {
    this.setState({ activeIndex: index })
  }

  renderTab(tab: TabbedBlockTab, index: number) {
    const labelText = localize(tab.label, this.props.designCtx.locale)

    return (
      <li className={this.state.activeIndex === index ? "active" : ""} key={index}>
        <a onClick={this.handleSelectTab.bind(null, index)}>{labelText}</a>
      </li>
    )
  }

  render() {
    const activeTab = this.props.tabbedBlockDef.tabs[this.state.activeIndex]

    const activeTabContent = activeTab
      ? this.props.designCtx.renderChildBlock(
          this.props.designCtx,
          activeTab.content,
          this.handleAddContent.bind(null, this.state.activeIndex)
        )
      : null

    // Render tabs
    return (
      <div style={{ paddingTop: 5, paddingBottom: 5 }}>
        <ul className="nav nav-tabs" style={{ marginBottom: 5 }}>
          {this.props.tabbedBlockDef.tabs.map((tab, index) => this.renderTab(tab, index))}
        </ul>
        {activeTabContent}
      </div>
    )
  }
}
