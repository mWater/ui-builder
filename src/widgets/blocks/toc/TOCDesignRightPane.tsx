import React from "react"
import _ from "lodash"
import { TOCItem } from "./toc"
import { BlockDef } from ".."
import produce from "immer"
import {
  LabeledProperty,
  ContextVarPropertyEditor,
  LocalizedTextPropertyEditor,
  PropertyEditor,
  ResponsiveWidthSelector,
  ContextVarExprPropertyEditor,
  EmbeddedExprsEditor
} from "../../propertyEditors"
import { Select, Toggle } from "react-library/lib/bootstrap"
import { LocalizedString } from "mwater-expressions"
import { DesignCtx } from "../../../contexts"
import { ContextVarExpr } from "../../../ContextVarExpr"
import { EmbeddedExpr } from "../../../embeddedExprs"

export function TOCDesignRightPane(props: {
  item: TOCItem
  renderProps: DesignCtx
  onItemChange: (item: TOCItem) => void
}) {
  const { item, onItemChange, renderProps } = props

  const selectedWidgetId = item.widgetId

  const handleLabelBlockChange = (labelBlock: BlockDef | null) => {
    onItemChange(
      produce(item, (draft) => {
        draft.labelBlock = labelBlock
      })
    )
  }

  const handleWidgetIdChange = (widgetId: string | null) => {
    onItemChange(
      produce(item, (draft) => {
        draft.widgetId = widgetId
      })
    )
  }

  const handleTitleChange = (title: LocalizedString | null) => {
    onItemChange(
      produce(item, (draft) => {
        draft.title = title
      })
    )
  }

  const handleContextVarMapChange = (contextVarMap: { [internalContextVarId: string]: string }) => {
    onItemChange(
      produce(item, (draft) => {
        draft.contextVarMap = contextVarMap
      })
    )
  }

  const handleConditionChange = (condition: ContextVarExpr) => {
    onItemChange(
      produce(item, (draft) => {
        draft.condition = condition
      })
    )
  }

  // Create widget options
  const widgetOptions = _.sortByAll(Object.values(renderProps.widgetLibrary.widgets), "group", "name").map((w) => ({
    label: (w.group ? `${w.group}: ` : "") + w.name,
    value: w.id
  }))

  const renderContextVarValues = () => {
    if (!item!.widgetId) {
      return null
    }

    // Find the widget
    const widgetDef = renderProps.widgetLibrary.widgets[item!.widgetId]
    if (!widgetDef) {
      return null
    }

    const contextVarMap = item!.contextVarMap || {}

    return (
      <table className="table table-bordered table-sm">
        <tbody>
          {widgetDef.contextVars.map((contextVar) => {
            const cv = contextVarMap[contextVar.id]
            const handleCVChange = (contextVarId: string | null) => {
              if (contextVarId) {
                handleContextVarMapChange({ ...contextVarMap, [contextVar.id]: contextVarId })
              } else {
                handleContextVarMapChange(
                  produce(contextVarMap, (draft) => {
                    delete draft[contextVar.id]
                  })
                )
              }
            }

            return (
              <tr key={contextVar.id}>
                <td key="name">{contextVar.name}</td>
                <td key="value">
                  <ContextVarPropertyEditor
                    contextVars={renderProps.contextVars}
                    types={[contextVar.type]}
                    table={contextVar.table}
                    value={cv}
                    onChange={handleCVChange}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    )
  }

  return (
    <div style={{ padding: 10 }}>
      <LabeledProperty label="Label">
        {renderProps.renderChildBlock(renderProps, item.labelBlock || null, handleLabelBlockChange)}
      </LabeledProperty>
      <LabeledProperty label="Widget">
        <Select
          value={selectedWidgetId}
          onChange={handleWidgetIdChange}
          options={widgetOptions}
          nullLabel="Select Widget"
        />
      </LabeledProperty>
      <LabeledProperty label="Page title (optional)">
        <LocalizedTextPropertyEditor
          value={item.title || null}
          onChange={handleTitleChange}
          locale={props.renderProps.locale}
        />
      </LabeledProperty>
      {item.title ? (
        <LabeledProperty label="Title embedded expressions" help="Reference in text as {0}, {1}, etc.">
          <PropertyEditor obj={item} onChange={onItemChange} property="titleEmbeddedExprs">
            {(value: EmbeddedExpr[] | null | undefined, onChange) => (
              <EmbeddedExprsEditor
                value={value}
                onChange={onChange}
                schema={renderProps.schema}
                dataSource={renderProps.dataSource}
                contextVars={renderProps.contextVars}
              />
            )}
          </PropertyEditor>
        </LabeledProperty>
      ) : null}
      <LabeledProperty label="Variable Mappings">{renderContextVarValues()}</LabeledProperty>
      {item.children.length > 0 ? (
        <LabeledProperty label="Collapse/Expand">
          <PropertyEditor obj={item} onChange={onItemChange} property="collapse">
            {(value, onChange) => {
              return (
                <Toggle
                  value={value || "expanded"}
                  onChange={onChange}
                  options={[
                    { value: "expanded", label: "Always Expanded" },
                    { value: "startExpanded", label: "Start Expanded" },
                    { value: "startCollapsed", label: "Start Collapsed" }
                  ]}
                />
              )
            }}
          </PropertyEditor>
        </LabeledProperty>
      ) : null}
      {item.children.length > 0 && item.collapse == "startExpanded" ? (
        <LabeledProperty label="Collapse at width">
          <PropertyEditor obj={item} onChange={onItemChange} property="collapseWidth">
            {(value, onChange) => <ResponsiveWidthSelector value={value} onChange={onChange} />}
          </PropertyEditor>
        </LabeledProperty>
      ) : null}
      <LabeledProperty label="Conditional display (optional)">
        <ContextVarExprPropertyEditor
          schema={renderProps.schema}
          dataSource={renderProps.dataSource}
          contextVars={renderProps.contextVars}
          contextVarExpr={item.condition}
          onChange={handleConditionChange}
          types={["boolean"]}
        />
      </LabeledProperty>
    </div>
  )
}
