import * as React from "react"
import {v4 as uuid} from 'uuid'
import { WidgetDef } from "../widgets/widgets";
import { Schema, DataSource } from "mwater-expressions";
import WidgetDesigner from "./WidgetDesigner";
import produce from "immer";
import BlockFactory from "../widgets/BlockFactory";
import { CreateBlock } from "../widgets/blocks";
import * as _ from "lodash";
import { ActionLibrary } from "../widgets/ActionLibrary";
import { BlockPaletteEntry } from "./blockPaletteEntries";
import { Database } from "../database/Database";

/** All widgets in current project */
export interface WidgetLibrary {
  widgets: { [id: string]: WidgetDef }
}

interface Props {
  blockFactory: BlockFactory
  database: Database
  schema: Schema
  dataSource: DataSource
  actionLibrary: ActionLibrary
  widgetLibrary: WidgetLibrary
  /** Ids of widgets in open tabs */
  openTabs: string[]
  blockPaletteEntries: BlockPaletteEntry[]
  onOpenTabsChange(openTabs: string[]): void
  onWidgetLibraryChange(widgetLibrary: WidgetLibrary): void
}

interface State {
  activeTabIndex: number     // Index of active tab. Can be one past end for new tab
}

/** Design mode for a library of widgets */
export default class WidgetLibraryDesigner extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      activeTabIndex: 0
    }
  }

  handleTabChange = (widgetId: string, widgetDef: WidgetDef) => {
    this.props.onWidgetLibraryChange(produce(this.props.widgetLibrary, (draft) => {
      draft.widgets[widgetId] = widgetDef
    }))
  }

  handleSelectTab = (index: number) => {
    this.setState({ activeTabIndex: index })
  }

  handleAddWidget = (widgetDef: WidgetDef) => {
    const widgetLibrary = produce(this.props.widgetLibrary, (draft) => {
      draft.widgets[widgetDef.id] = widgetDef
    })
    this.props.onWidgetLibraryChange(widgetLibrary)
    this.props.onOpenTabsChange(this.props.openTabs.concat(widgetDef.id))
  }

  handleDuplicateWidget = (widgetDef: WidgetDef) => {
    const newId = uuid()
    const widgetLibrary = produce(this.props.widgetLibrary, (draft) => {
      const newDef = _.cloneDeep(widgetDef)
      newDef.id = newId
      newDef.name = newDef.name + " (duplicate)"
      draft.widgets[newId] = newDef
    })
    this.props.onWidgetLibraryChange(widgetLibrary)
  }


  handleCloseTab = (index: number) => {
    const openTabs = this.props.openTabs.slice()
    openTabs.splice(index, 1)
    this.props.onOpenTabsChange(openTabs)
  }

  handleOpenWidget = (widgetId: string) => {
    this.props.onOpenTabsChange(this.props.openTabs.concat(widgetId))
  }

  handleRemoveWidget = (widgetId: string) => {
    if (!confirm("Permanently delete widget?")) {
      return
    }

    const widgetLibrary = produce(this.props.widgetLibrary, (draft) => {
      delete draft.widgets[widgetId]
    })
    this.props.onOpenTabsChange(_.without(this.props.openTabs, widgetId))
    this.props.onWidgetLibraryChange(widgetLibrary)
  }

  renderTab(tab: string, index: number) {
    const activeTabId = this.props.openTabs[index]
    const widgetDef = this.props.widgetLibrary.widgets[activeTabId]

    // For immediately deleted tabs
    if (!widgetDef) {
      return null
    }

    return (
      <li className={(index === this.state.activeTabIndex) ? "active" : ""} key={index}>
        <a onClick={this.handleSelectTab.bind(null, index)}>
          {widgetDef.name}
          &nbsp;
          { (index === this.state.activeTabIndex) ? <i onClick={this.handleCloseTab.bind(null, index)} className="fa fa-remove text-muted"/> : null }
        </a>
      </li>
    )
  }

  renderActiveTabContents() {
    if (this.state.activeTabIndex < this.props.openTabs.length) {
      const activeTabId = this.props.openTabs[this.state.activeTabIndex]
      const widgetDef = this.props.widgetLibrary.widgets[activeTabId]
      // For immediately deleted tabs
      if (!widgetDef) {
        return null
      }

      return <WidgetTab
        key={widgetDef.id}
        widgetDef={widgetDef}
        createBlock={this.props.blockFactory.createBlock}
        database={this.props.database}
        schema={this.props.schema}
        dataSource={this.props.dataSource}
        actionLibrary={this.props.actionLibrary}
        widgetLibrary={this.props.widgetLibrary}
        blockPaletteEntries={this.props.blockPaletteEntries}
        onWidgetDefChange={this.handleTabChange.bind(null, activeTabId)}
      />
    }
    else {
      return <NewTab 
        widgetLibrary={this.props.widgetLibrary} 
        onAddWidget={this.handleAddWidget} 
        onOpenWidget={this.handleOpenWidget} 
        onRemoveWidget={this.handleRemoveWidget}
        onDuplicateWidget={this.handleDuplicateWidget}
        />
    }
  }

  render() {
    return (
      <div style={{ height: "100%" }}>
        <ul className="nav nav-tabs" style={{ marginBottom: 5 }}>
          {this.props.openTabs.map((tab, index) => this.renderTab(tab, index))}
          <li 
            className={(this.state.activeTabIndex >= this.props.openTabs.length) ? "active" : ""}
            key="new">
              <a onClick={this.handleSelectTab.bind(null, this.props.openTabs.length)}>
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
    database: Database
    schema: Schema
    dataSource: DataSource
    actionLibrary: ActionLibrary
    widgetLibrary: WidgetLibrary
    blockPaletteEntries: BlockPaletteEntry[]
    onWidgetDefChange(widgetDef: WidgetDef): void
  }> {

  render() {
    return <WidgetDesigner 
      widgetDef={this.props.widgetDef}
      createBlock={this.props.createBlock}
      schema={this.props.schema}
      dataSource={this.props.dataSource}
      database={this.props.database}
      actionLibrary={this.props.actionLibrary}
      widgetLibrary={this.props.widgetLibrary}
      onWidgetDefChange={this.props.onWidgetDefChange}
      blockPaletteEntries={this.props.blockPaletteEntries}
      locale="en"
    />
  }
}

/** Tab which lists existing tabs and offers a button to create a new tab */
class NewTab extends React.Component<{  
  widgetLibrary: WidgetLibrary
  onAddWidget: (widgetDef: WidgetDef) => void,
  onOpenWidget: (widgetId: string) => void, 
  onRemoveWidget: (widgetId: string) => void, 
  onDuplicateWidget: (widgetDef: WidgetDef) => void, 
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

  handleDuplicateWidget = (widgetDef: WidgetDef, ev: React.MouseEvent) => {
    ev.stopPropagation()
    this.props.onDuplicateWidget(widgetDef)
  }

  renderExistingWidgets() {
    const widgets: WidgetDef[] = _.sortBy(Object.values(this.props.widgetLibrary.widgets), "name")

    return (
      <ul className="list-group">
        { widgets.map(widget => (
          <li className="list-group-item" style={{ cursor: "pointer" }} key={widget.id} onClick={this.props.onOpenWidget.bind(null, widget.id)}>
            <span style={{ float: "right" }} onClick={this.props.onRemoveWidget.bind(null, widget.id)}>
              <i className="fa fa-fw fa-remove"/>
            </span>
            <span style={{ float: "right" }} onClick={this.handleDuplicateWidget.bind(null, widget)}>
              <i className="fa fa-fw fa-files-o"/>
            </span>
            {widget.name}
          </li>
        )) }
      </ul>
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