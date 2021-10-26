import _ from "lodash"
import { WidgetLibrary } from "./widgetLibrary"
import { WidgetDef } from "../widgets/widgets"
import { useState, useRef, useEffect } from "react"
import uuid = require("uuid")
import { SearchControl } from "../widgets/blocks/search/SearchBlockInstance"
import React from "react"

/** Tab which lists existing tabs and offers a button to create a new tab */
export const NewTab = (props: {
  widgetLibrary: WidgetLibrary
  onAddWidget: (widgetDef: WidgetDef) => void
  onOpenWidget: (widgetId: string) => void
  onRemoveWidget: (widgetId: string) => void
  onDuplicateWidget: (widgetDef: WidgetDef) => void
  /** Validates a widget returning error if any */
  validateWidget: (widgetDef: WidgetDef) => string | null
}) => {
  /** Search state */
  const [search, setSearch] = useState("")

  // Which widgets have errors
  const [errors, setErrors] = useState<string[]>([])

  /** Collapsed groups (persisted to local storage) */
  const [collapsedGroups, setCollapsedGroups] = useState<(string | undefined)[]>(
    JSON.parse(window.localStorage.getItem("UIBuilder.collapsedWidgetGroups") || "[]")
  )

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
  function handleAdd() {
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

  function handleDuplicateWidget(widgetDef: WidgetDef, ev: React.MouseEvent) {
    ev.stopPropagation()
    props.onDuplicateWidget(widgetDef)
  }

  function handleRemoveWidget(widgetId: string, ev: React.MouseEvent) {
    ev.stopPropagation()
    props.onRemoveWidget(widgetId)
  }

  function toggleGroup(group: string | undefined) {
    if (collapsedGroups.includes(group)) {
      const newCollapsedGroups = collapsedGroups.filter((g) => g != group)
      setCollapsedGroups(newCollapsedGroups)
      window.localStorage.setItem("UIBuilder.collapsedWidgetGroups", JSON.stringify(newCollapsedGroups))
    } else {
      const newCollapsedGroups = collapsedGroups.concat([group])
      setCollapsedGroups(newCollapsedGroups)
      window.localStorage.setItem("UIBuilder.collapsedWidgetGroups", JSON.stringify(newCollapsedGroups))
    }
  }

  function renderWidgetGroupHeader(group: string | undefined) {
    return (
      <h4 style={{ cursor: "pointer" }} onClick={() => toggleGroup(group)}>
        <span style={{ color: "#38D" }}>
          {collapsedGroups.includes(group) ? (
            <i className="fa fa-fw fa-caret-right" />
          ) : (
            <i className="fa fa-fw fa-caret-down" />
          )}
          &nbsp;
        </span>
        {group || "No Group"}
      </h4>
    )
  }

  function renderWidgetGroup(group: string | undefined, widgets: WidgetDef[], hasGroups: boolean) {
    return (
      <div>
        {hasGroups ? renderWidgetGroupHeader(group) : null}
        {!collapsedGroups.includes(group) ? (
          <ul className="list-group">
            {widgets.map((widget) => (
              <li
                className="list-group-item"
                style={{ cursor: "pointer" }}
                key={widget.id}
                onClick={props.onOpenWidget.bind(null, widget.id)}
              >
                <span style={{ float: "right" }} onClick={handleRemoveWidget.bind(null, widget.id)}>
                  <i className="fa fa-fw fa-remove" />
                </span>
                <span style={{ float: "right" }} onClick={handleDuplicateWidget.bind(null, widget)}>
                  <i className="fa fa-fw fa-files-o" />
                </span>
                {errors.includes(widget.id) ? (
                  <span>
                    <i className="fa fa-fw fa-exclamation-circle text-danger" />
                  </span>
                ) : null}
                {widget.name}
                {widget.description ? <span className="text-muted"> - {widget.description}</span> : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    )
  }

  function renderExistingWidgets() {
    let widgets = Object.values(props.widgetLibrary.widgets)

    // Filter by search
    widgets = widgets.filter((widget) => {
      if (!search) {
        return true
      }

      // Search by name
      if (widget.name.toLowerCase().includes(search.toLowerCase())) {
        return true
      }

      // Search by id
      if (widget.id.toLowerCase().includes(search.toLowerCase())) {
        return true
      }

      // Search by json
      if (search.startsWith("json:")) {
        return JSON.stringify(widget).includes(search.substr(5))
      }

      return false
    })

    // Get groups and sort
    const groups = _.uniq(widgets.map((w) => w.group))
    groups.sort()

    // Render each group
    return groups.map((group) => {
      const groupWidgets = _.sortBy(
        widgets.filter((w) => w.group == group),
        "name"
      )
      return renderWidgetGroup(group, groupWidgets, !(groups.length == 1 && groups[0] == undefined))
    })
  }

  return (
    <div style={{ padding: 10 }}>
      <div style={{ paddingBottom: 10 }}>
        <SearchControl value={search} onChange={setSearch} ref={searchControl} placeholder="Search widgets..." />
        <button type="button" className="btn btn-primary" onClick={handleAdd}>
          <i className="fa fa-plus" /> New Widget
        </button>
      </div>
      {renderExistingWidgets()}
    </div>
  )
}
