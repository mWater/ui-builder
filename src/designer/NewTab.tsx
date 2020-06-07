import _ from 'lodash'
import { WidgetLibrary } from "./widgetLibrary"
import { WidgetDef } from "../widgets/widgets"
import { useState, useRef, useEffect } from "react"
import uuid = require("uuid")
import { SearchControl } from "../widgets/blocks/search/SearchBlockInstance"
import React from "react"
import { getBlockTree, CreateBlock } from "../widgets/blocks"

/** Tab which lists existing tabs and offers a button to create a new tab */
export const NewTab = (props: {  
  widgetLibrary: WidgetLibrary
  onAddWidget: (widgetDef: WidgetDef) => void,
  onOpenWidget: (widgetId: string) => void, 
  onRemoveWidget: (widgetId: string) => void, 
  onDuplicateWidget: (widgetDef: WidgetDef) => void, 
  /** Validates a widget returning error if any */
  validateWidget: (widgetDef: WidgetDef) => string | null
}) => {

  const [search, setSearch] = useState("")

  // Which widgets have errors
  const [errors, setErrors] = useState<string[]>([])

  // Check each widget for errors
  useEffect(() => {
    // For each widget
    const widgetErrors = []
    for (const widgetDef of Object.values(props.widgetLibrary.widgets)) {
      const error = props.validateWidget(widgetDef)
      if (error) {
        widgetErrors.push(widgetDef.id)
      }
    }
    setErrors(widgetErrors)
  }, [])

  // Focus on load
  const searchControl = useRef<SearchControl>(null)
  useEffect(() => { 
    if (searchControl.current) {
      searchControl.current.focus()
    }
  }, [])

  /** Add a new blank widget */
  const handleAdd = () => {
    props.onAddWidget({
      id: uuid(),
      name: "Untitled",
      description: "",
      blockDef: null,
      contextVars: [],
      contextVarPreviewValues: {},
      privateContextVars: [],
      privateContextVarValues: {}
    })
  }

  const handleDuplicateWidget = (widgetDef: WidgetDef, ev: React.MouseEvent) => {
    ev.stopPropagation()
    props.onDuplicateWidget(widgetDef)
  }

  const handleRemoveWidget = (widgetId: string, ev: React.MouseEvent) => {
    ev.stopPropagation()
    props.onRemoveWidget(widgetId)
  }

  const renderExistingWidgets = () => {
    var widgets: WidgetDef[] = _.sortBy(Object.values(props.widgetLibrary.widgets), "name")

    widgets = widgets.filter(widget => {
      return search ? widget.name.toLowerCase().includes(search.toLowerCase()) : true
    })

    return (
      <ul className="list-group">
        { widgets.map(widget => (
          <li className="list-group-item" style={{ cursor: "pointer" }} key={widget.id} onClick={props.onOpenWidget.bind(null, widget.id)}>
            <span style={{ float: "right" }} onClick={handleRemoveWidget.bind(null, widget.id)}>
              <i className="fa fa-fw fa-remove"/>
            </span>
            <span style={{ float: "right" }} onClick={handleDuplicateWidget.bind(null, widget)}>
              <i className="fa fa-fw fa-files-o"/>
            </span>
            { errors.includes(widget.id) ? 
              <span>
                <i className="fa fa-fw fa-exclamation-circle text-danger"/>
              </span>
            : null }
            {widget.name}
            { widget.description ? <span className="text-muted"> - {widget.description}</span> : null }
          </li>
        )) }
      </ul>
    )
  }

  return (
    <div style={{ padding: 10 }}>
      <div style={{ paddingBottom: 10 }}>
        <SearchControl value={search} onChange={setSearch} ref={searchControl} placeholder="Search widgets..."/>
        <button type="button" className="btn btn-primary" onClick={handleAdd}>
          <i className="fa fa-plus"/> New Widget
        </button>
      </div>
      {renderExistingWidgets()}
    </div>
  )
}