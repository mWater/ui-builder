import React from "react";
import { TabbedBlockDef, TabbedBlockTab } from "./tabbed";
import { RenderInstanceProps, BlockDef } from "../../blocks";
import { localize } from "../../localization";

interface Props {
  tabbedBlockDef: TabbedBlockDef
  renderInstanceProps: RenderInstanceProps
}

interface State {
  activeIndex: number
}

export default class TabbedInstance extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      activeIndex: 0
    }
  }

  handleSelectTab = (index: number) => {
    this.setState({ activeIndex: index })
  }

  renderTab(tab: TabbedBlockTab, index: number) {
    const labelText = localize(tab.label, this.props.renderInstanceProps.locale)

    return (
      <li className={(this.state.activeIndex === index) ? "active" : ""} key={index}>
        <a onClick={this.handleSelectTab.bind(null, index)}>
          {labelText}
        </a>
      </li>
    )  
  }

  renderTabContent(tab: TabbedBlockTab, index: number) {
    const content = this.props.renderInstanceProps.renderChildBlock(this.props.renderInstanceProps, tab.content)

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
