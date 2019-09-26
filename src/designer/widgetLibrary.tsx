import * as React from "react"
import {v4 as uuid} from 'uuid'
import { WidgetDef } from "../widgets/widgets";
import { Schema, DataSource } from "mwater-expressions";
import WidgetDesigner from "./WidgetDesigner";
import produce from "immer";
import BlockFactory from "../widgets/BlockFactory";
import * as _ from "lodash";
import { ActionLibrary } from "../widgets/ActionLibrary";
import { BlockPaletteEntry } from "./blockPaletteEntries";
import { Database } from "../database/Database";
import { useState, useRef, useEffect } from "react";
import { SearchControl } from "../widgets/blocks/search/SearchBlockInstance";
import { NewTab } from "./NewTab";
import { getBlockTree } from "../widgets/blocks";

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
    const widget = this.props.widgetLibrary.widgets[widgetId]!
    if (!confirm(`Permanently delete ${widget.name} widget?`)) {
      return
    }

    const widgetLibrary = produce(this.props.widgetLibrary, (draft) => {
      delete draft.widgets[widgetId]
    })
    this.props.onOpenTabsChange(_.without(this.props.openTabs, widgetId))
    this.props.onWidgetLibraryChange(widgetLibrary)
  }

  /** Validate a single widget */
  validateWidget = (widgetDef: WidgetDef): string | null => {
    if (!widgetDef.blockDef) {
      return null
    }

    for (const childBlock of getBlockTree(widgetDef.blockDef, this.props.blockFactory.createBlock, widgetDef.contextVars)) {
      const block = this.props.blockFactory.createBlock(childBlock.blockDef)
      
      const error = block.validate({ 
        schema: this.props.schema, 
        actionLibrary: this.props.actionLibrary, 
        widgetLibrary: this.props.widgetLibrary,
        contextVars: childBlock.contextVars
       })
       
       if (error) {
         return error
       }
    }

    return null
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
          <i onClick={this.handleCloseTab.bind(null, index)} className="fa fa-remove text-muted"/>
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

      return <WidgetDesigner
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
        locale="en"
      />
    }
    else {
      return <NewTab 
        widgetLibrary={this.props.widgetLibrary} 
        onAddWidget={this.handleAddWidget} 
        onOpenWidget={this.handleOpenWidget} 
        onRemoveWidget={this.handleRemoveWidget}
        onDuplicateWidget={this.handleDuplicateWidget}
        validateWidget={this.validateWidget}
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

