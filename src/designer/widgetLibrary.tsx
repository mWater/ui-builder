import React from "react"
import { v4 as uuid } from 'uuid'
import { validateWidget, WidgetDef } from "../widgets/widgets";
import { DataSource } from "mwater-expressions";
import WidgetDesigner from "./WidgetDesigner";
import produce from "immer";
import _ from "lodash";
import { BlockPaletteEntry } from "./blockPaletteEntries";
import { NewTab } from "./NewTab";
import { getBlockTree, NullBlockStore } from "../widgets/blocks";
import { BaseCtx, DesignCtx } from "../contexts";
import { validateContextVarValue } from "../contextVarValues";

/** All widgets in current project */
export interface WidgetLibrary {
  widgets: { [id: string]: WidgetDef }
}

interface Props {
  baseCtx: BaseCtx
  dataSource: DataSource
  /** Ids of widgets in open tabs */
  openTabs: string[]
  blockPaletteEntries: BlockPaletteEntry[]
  onOpenTabsChange(openTabs: string[]): void
  onWidgetLibraryChange(widgetLibrary: WidgetLibrary): void
}

interface State {
  /** Index of active tab. Can be one past end for new tab */
  activeTabIndex: number     
}

/** Design mode for a library of widgets */
export class WidgetLibraryDesigner extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      activeTabIndex: 0
    }
  }

  handleTabChange = (widgetId: string, widgetDef: WidgetDef) => {
    this.props.onWidgetLibraryChange(produce(this.props.baseCtx.widgetLibrary, (draft) => {
      draft.widgets[widgetId] = widgetDef
    }))
  }

  handleSelectTab = (index: number) => {
    this.setState({ activeTabIndex: index })
  }

  handleAddWidget = (widgetDef: WidgetDef) => {
    const widgetLibrary = produce(this.props.baseCtx.widgetLibrary, (draft) => {
      draft.widgets[widgetDef.id] = widgetDef
    })
    this.props.onWidgetLibraryChange(widgetLibrary)
    this.props.onOpenTabsChange(this.props.openTabs.concat(widgetDef.id))
  }

  handleDuplicateWidget = (widgetDef: WidgetDef) => {
    const newId = uuid()
    const widgetLibrary = produce(this.props.baseCtx.widgetLibrary, (draft) => {
      const newDef = _.cloneDeep(widgetDef)
      newDef.id = newId
      newDef.name = newDef.name + " (duplicate)"
      newDef.description = newDef.description
      newDef.group = newDef.group
      draft.widgets[newId] = newDef
    })
    this.props.onWidgetLibraryChange(widgetLibrary)
  }

  handleCloseTab = (index: number, ev: React.MouseEvent) => {
    ev.stopPropagation()

    const openTabs = this.props.openTabs.slice()
    openTabs.splice(index, 1)
    this.props.onOpenTabsChange(openTabs)
  }

  handleOpenWidget = (widgetId: string) => {
    this.props.onOpenTabsChange(this.props.openTabs.concat(widgetId))
  }

  handleRemoveWidget = (widgetId: string) => {
    const widget = this.props.baseCtx.widgetLibrary.widgets[widgetId]!
    if (!confirm(`Permanently delete ${widget.name} widget?`)) {
      return
    }

    const widgetLibrary = produce(this.props.baseCtx.widgetLibrary, (draft) => {
      delete draft.widgets[widgetId]
    })
    this.props.onOpenTabsChange(_.without(this.props.openTabs, widgetId))
    this.props.onWidgetLibraryChange(widgetLibrary)
  }

  /** Validate a single widget */
  validateSingleWidget = (widgetDef: WidgetDef): string | null => {
    return validateWidget(widgetDef, this.props.baseCtx, true)
  }

  renderTab(index: number) {
    const activeTabId = this.props.openTabs[index]
    const widgetDef = this.props.baseCtx.widgetLibrary.widgets[activeTabId]

    // For immediately deleted tabs
    if (!widgetDef) {
      return null
    }

    return (
      <li className={(index === this.state.activeTabIndex) ? "active" : ""} key={index}>
        <a onClick={this.handleSelectTab.bind(null, index)}>
          {widgetDef.name}
          &nbsp;
          <i onClick={this.handleCloseTab.bind(null, index)} className="fa fa-remove text-muted"/>
        </a>
      </li>
    )
  }

  renderActiveTabContents() {
    if (this.state.activeTabIndex < this.props.openTabs.length) {
      const activeTabId = this.props.openTabs[this.state.activeTabIndex]
      const widgetDef = this.props.baseCtx.widgetLibrary.widgets[activeTabId]
      // For immediately deleted tabs
      if (!widgetDef) {
        return null
      }

      return <WidgetDesigner
        key={widgetDef.id}
        widgetDef={widgetDef}
        baseCtx={this.props.baseCtx}
        dataSource={this.props.dataSource}
        blockPaletteEntries={this.props.blockPaletteEntries}
        onWidgetDefChange={this.handleTabChange.bind(null, activeTabId)}
      />
    }
    else {
      return <NewTab 
        widgetLibrary={this.props.baseCtx.widgetLibrary} 
        onAddWidget={this.handleAddWidget} 
        onOpenWidget={this.handleOpenWidget} 
        onRemoveWidget={this.handleRemoveWidget}
        onDuplicateWidget={this.handleDuplicateWidget}
        validateWidget={this.validateSingleWidget}
        />
    }
  }

  render() {
    return (
      <div style={{ height: "100%", display: "grid", gridTemplateRows: "auto 1fr" }}>
        <ul className="nav nav-tabs" style={{ marginBottom: 5 }}>
          {this.props.openTabs.map((tab, index) => this.renderTab(index))}
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

