import * as React from "react"
import * as uuid from 'uuid/v4'
import { WidgetDef } from "../widgets/widgets";
import { Schema, DataSource } from "mwater-expressions";
import WidgetDesigner from "./WidgetDesigner";
import produce from "immer";
import BlockFactory from "../widgets/BlockFactory";
import { CreateBlock } from "../widgets/blocks";
import * as _ from "lodash";
import { ActionFactory } from "../widgets/actions";

export interface WidgetLibrary {
  widgets: { [id: string]: WidgetDef }
}

interface Props {
  blockFactory: BlockFactory
  schema: Schema
  dataSource: DataSource
  actionFactory: ActionFactory
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
      openTabs: ["1234", "1235"],
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

  handleAddWidget = (widgetDef: WidgetDef) => {
    const widgetLibrary = produce(this.props.widgetLibrary, (draft) => {
      draft.widgets[widgetDef.id] = widgetDef
    })
    this.props.onWidgetLibraryChange(widgetLibrary)
    this.setState({ openTabs: this.state.openTabs.concat(widgetDef.id)})
  }

  handleCloseTab = (index: number) => {
    const openTabs = this.state.openTabs.slice()
    openTabs.splice(index, 1)
    this.setState({ openTabs: openTabs })
  }

  handleOpenWidget = (widgetId: string) => {
    this.setState({ openTabs: this.state.openTabs.concat(widgetId)})
  }

  renderTab(tab: string, index: number) {
    const activeTabId = this.state.openTabs[index]
    const widgetDef = this.props.widgetLibrary.widgets[activeTabId]

    return (
      <li className={(index === this.state.activeTabIndex) ? "active" : ""}>
        <a onClick={this.handleSelectTab.bind(null, index)}>
          {widgetDef.name}
          &nbsp;
          { (index === this.state.activeTabIndex) ? <a onClick={this.handleCloseTab.bind(null, index)}><i className="fa fa-remove text-muted"/></a> : null }
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
        dataSource={this.props.dataSource}
        actionFactory={this.props.actionFactory}
        widgetLibrary={this.props.widgetLibrary}
        onWidgetDefChange={this.handleTabChange.bind(null, activeTabId)}
      />
    }
    else {
      return <NewTab widgetLibrary={this.props.widgetLibrary} onAddWidget={this.handleAddWidget} onOpenWidget={this.handleOpenWidget} />
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
    dataSource: DataSource
    actionFactory: ActionFactory
    widgetLibrary: WidgetLibrary
    onWidgetDefChange(widgetDef: WidgetDef): void
  }> {

  render() {
    return <WidgetDesigner 
      widgetDef={this.props.widgetDef}
      createBlock={this.props.createBlock}
      schema={this.props.schema}
      dataSource={this.props.dataSource}
      actionFactory={this.props.actionFactory}
      widgetLibrary={this.props.widgetLibrary}
      onWidgetDefChange={this.props.onWidgetDefChange}
    />
  }
}

/** Tab which lists existing tabs and offers a button to create a new tab */
class NewTab extends React.Component<{  
  widgetLibrary: WidgetLibrary
  onAddWidget: (widgetDef: WidgetDef) => void,
  onOpenWidget: (widgetId: string) => void, 
}> {

  /** Add a new blank widget */
  handleAdd = () => {
    this.props.onAddWidget({
      id: uuid(),
      name: "Untitled",
      description: "",
      blockDef: null,
      contextVars: [],
      contextVarPreviewValues: {}
    })
  }

  renderExistingWidgets() {
    const widgets = _.sortBy(_.values(this.props.widgetLibrary.widgets), "name")

    return (
      <div className="list-group">
        { widgets.map(widget => (
          <a className="list-group-item" key={widget.id} onClick={this.props.onOpenWidget.bind(null, widget.id)}>{widget.name}</a>
        )) }
      </div>
    )
  }

  render() {
    return (
      <div>
        {this.renderExistingWidgets()}
        <button type="button" className="btn btn-primary" onClick={this.handleAdd}>
          <i className="fa fa-plus"/> New Widget
        </button>
      </div>
    )
  }
}