import * as React from "react"
import { WidgetDef } from "../widgets/widgets";
import { Schema } from "mwater-expressions";
import WidgetDesigner from "./WidgetDesigner";
import produce from "immer";
import BlockFactory from "../widgets/BlockFactory";
import { CreateBlock } from "../widgets/blocks";

export interface WidgetLibrary {
  widgets: { [id: string]: WidgetDef }
}

interface Props {
  blockFactory: BlockFactory
  schema: Schema
  widgetLibrary: WidgetLibrary
  onWidgetLibraryChange(widgetLibrary: WidgetLibrary): void
}

interface State {
  openTabs: string[]         // Ids of widgets in open tabs
  activeTabIndex: number     // Index of active tab. Can be one past end for new tab
}

/** Design mode for a library of widgets */
export default class WidgetLibraryDesigner extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      openTabs: ["1234"],
      activeTabIndex: 0
    }
  }

  handleTabChange = (widgetId: string, widgetDef: WidgetDef) => {
    this.props.onWidgetLibraryChange(produce(this.props.widgetLibrary, (draft) => {
      draft.widgets[widgetId] = widgetDef
    }))
  }

  lookupWidget(widgetId: string): WidgetDef | null {
    return this.props.widgetLibrary.widgets[widgetId]
  }

  handleSelectTab = (index: number) => {
    this.setState({ activeTabIndex: index })
  }

  renderTab(tab: string, index: number) {
    const activeTabId = this.state.openTabs[index]
    const widgetDef = this.props.widgetLibrary.widgets[activeTabId]

    return (
      <li className={(index === this.state.activeTabIndex) ? "active" : ""}>
        <a onClick={this.handleSelectTab.bind(null, index)}>
          {widgetDef.name}
        </a>
      </li>
    )
  }

  renderActiveTabContents() {
    if (this.state.activeTabIndex < this.state.openTabs.length) {
      const activeTabId = this.state.openTabs[this.state.activeTabIndex]
      const widgetDef = this.props.widgetLibrary.widgets[activeTabId]

      return <WidgetTab
        widgetDef={widgetDef}
        createBlock={this.props.blockFactory.createBlock.bind(null, this.lookupWidget)}
        schema={this.props.schema}
        onWidgetDefChange={this.handleTabChange.bind(null, activeTabId)}
      />
    }
    else {
      return "TODO"
    }
  }

  render() {
    return (
      <div style={{ height: "100%" }}>
        <ul className="nav nav-tabs" style={{ marginBottom: 5 }}>
          {this.state.openTabs.map((tab, index) => this.renderTab(tab, index))}
          <li 
            className={(this.state.activeTabIndex >= this.state.openTabs.length) ? "active" : ""}>
              <a onClick={this.handleSelectTab.bind(null, this.state.openTabs.length)}>
                <i className="fa fa-plus"/>
              </a>
          </li>
        </ul>
        {this.renderActiveTabContents()}
      </div>
    )
  }
}

class WidgetTab extends React.Component<{
    widgetDef: WidgetDef
    createBlock: CreateBlock
    schema: Schema
    onWidgetDefChange(widgetDef: WidgetDef): void
  }> {

  render() {
    return <WidgetDesigner 
      widgetDef={this.props.widgetDef}
      createBlock={this.props.createBlock}
      schema={this.props.schema}
      onWidgetDefChange={this.props.onWidgetDefChange}
    />
  }

}