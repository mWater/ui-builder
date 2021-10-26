import * as React from "react"
import * as _ from "lodash"
import LeafBlock from "../LeafBlock"
import { BlockDef, NullBlockStore, Filter, ContextVar } from "../blocks"
import { Expr } from "mwater-expressions"
import BlockPlaceholder from "../BlockPlaceholder"
import { LabeledProperty, ContextVarPropertyEditor } from "../propertyEditors"
import { Select } from "react-library/lib/bootstrap"
import produce from "immer"
import { InstanceCtx, DesignCtx } from "../../contexts"
import ContextVarsInjector from "../ContextVarsInjector"

/** Block which contains a widget */
export interface WidgetBlockDef extends BlockDef {
  type: "widget"
  widgetId: string | null // Id of the widget
  contextVarMap: { [internalContextVarId: string]: string } // Maps each internal widgets' context variable id to an external one
}

export class WidgetBlock extends LeafBlock<WidgetBlockDef> {
  validate(options: DesignCtx) {
    if (!this.blockDef.widgetId) {
      return "Widget required"
    }

    // Ensure that widget exists
    const widget = options.widgetLibrary.widgets[this.blockDef.widgetId]
    if (!widget) {
      return "Invalid widget"
    }

    // Ensure that all context variables exist
    for (const internalContextVarId of Object.keys(this.blockDef.contextVarMap)) {
      if (!options.contextVars.find((cv) => cv.id === this.blockDef.contextVarMap[internalContextVarId])) {
        return "Missing context variable in mapping"
      }
    }

    return null
  }

  getInitialFilters(contextVarId: string, instanceCtx: InstanceCtx): Filter[] {
    const widgetDef = instanceCtx.widgetLibrary.widgets[this.blockDef.widgetId!]
    if (widgetDef && widgetDef.blockDef) {
      const innerBlock = instanceCtx.createBlock(widgetDef.blockDef)

      // Map contextVarId to internal id
      for (const key of Object.keys(this.blockDef.contextVarMap)) {
        const value = this.blockDef.contextVarMap[key]
        if (value === contextVarId) {
          return innerBlock.getInitialFilters(key, instanceCtx)
        }
      }
    }

    return []
  }

  getContextVarExprs(contextVar: ContextVar, ctx: DesignCtx | InstanceCtx) {
    if (!this.blockDef.widgetId) {
      return []
    }

    // Get inner widget
    const widgetDef = ctx.widgetLibrary.widgets[this.blockDef.widgetId]

    if (!widgetDef.blockDef) {
      return []
    }

    // Map context variable
    let innerContextVar = widgetDef.contextVars.find((cv) => contextVar.id === this.blockDef.contextVarMap[cv.id])
    if (!innerContextVar) {
      // Check if global variable
      if ((ctx.globalContextVars || []).find((cv) => cv.id == contextVar.id)) {
        // Pass it straight through
        innerContextVar = contextVar
      } else {
        return []
      }
    }

    // Get complete context variables exprs of inner widget blocks
    let contextVarExprs = ctx.createBlock(widgetDef.blockDef).getSubtreeContextVarExprs(innerContextVar, {
      ...ctx,
      contextVars: widgetDef.contextVars
    })

    // Map any variables of expressions that cross widget boundary
    contextVarExprs = contextVarExprs.map((cve) => this.mapInnerToOuterVariables(cve))
    return contextVarExprs
  }

  /** Maps variables in an expression from inner variable names to outer ones */
  mapInnerToOuterVariables(expr: Expr): Expr {
    return mapObjectTree(expr, (e: any) => {
      if (e.type === "variable") {
        // Change inner id to outer id
        if (this.blockDef.contextVarMap[e.variableId]) {
          return { ...e, variableId: this.blockDef.contextVarMap[e.variableId] }
        } else {
          return e
        }
      } else {
        return e
      }
    })
  }

  /** Maps variables in an expression from outer variable names to inner ones */
  mapOuterToInnerVariables(expr: Expr): Expr {
    return mapObjectTree(expr, (e: any) => {
      if (e.type === "variable") {
        // Change outer id to inner id
        for (const key in this.blockDef.contextVarMap) {
          if (this.blockDef.contextVarMap[key] == e.variableId) {
            return { ...e, variableId: key }
          }
        }
        return e
      } else {
        return e
      }
    })
  }

  renderDesign(props: DesignCtx) {
    if (!this.blockDef.widgetId) {
      return <div style={{ fontStyle: "italic" }}>Select widget...</div>
    }

    // Find the widget
    const widgetDef = props.widgetLibrary.widgets[this.blockDef.widgetId]
    if (widgetDef && widgetDef.blockDef) {
      const innerBlock = props.createBlock(widgetDef.blockDef)

      const innerContextVars = (props.globalContextVars || [])
        .concat(widgetDef.contextVars)
        .concat(widgetDef.privateContextVars || [])

      // Create props for rendering inner block
      const innerProps: DesignCtx = {
        ...props,
        selectedId: null,
        contextVars: innerContextVars,
        store: new NullBlockStore(),
        blockPaletteEntries: [],
        renderChildBlock: (childProps, childBlockDef) => {
          if (childBlockDef) {
            const childBlock = props.createBlock(childBlockDef)
            return childBlock.renderDesign(childProps)
          } else {
            return <BlockPlaceholder />
          }
        }
      }
      return (
        <div>
          {innerBlock.renderDesign(innerProps)}
          {/* Cover up design so it can't be edited */}
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
        </div>
      )
    } else {
      // Handle case of widget with null block
      return <div />
    }
  }

  renderInstance(instanceCtx: InstanceCtx): React.ReactElement<any> {
    // Map context var values
    const mappedContextVarValues = {} as object

    for (const innerContextVarId of Object.keys(this.blockDef.contextVarMap)) {
      const outerContextVarId = this.blockDef.contextVarMap[innerContextVarId]
      if (outerContextVarId) {
        mappedContextVarValues[innerContextVarId] = instanceCtx.contextVarValues[outerContextVarId]
      } else {
        mappedContextVarValues[innerContextVarId] = null
      }
    }

    // Include global context variables
    for (const globalContextVar of instanceCtx.globalContextVars || []) {
      mappedContextVarValues[globalContextVar.id] = instanceCtx.contextVarValues[globalContextVar.id]
    }

    // Find the widget
    const widgetDef = instanceCtx.widgetLibrary.widgets[this.blockDef.widgetId!]
    if (widgetDef && widgetDef.blockDef) {
      const innerBlock = instanceCtx.createBlock(widgetDef.blockDef)

      // Include outer context variables, even though widget does not technically need them
      // They are included as the widget might receive expressions such as rowsets that reference
      // variables that are only present in the outer scope.
      const innerContextVars = (instanceCtx.globalContextVars || [])
        .concat(instanceCtx.contextVars)
        .concat(widgetDef.contextVars)

      const innerContextVarValues = {
        ...instanceCtx.contextVarValues,
        ...mappedContextVarValues,
        // Exclude stale values
        ..._.pick(
          widgetDef.privateContextVarValues || {},
          (widgetDef.privateContextVars || []).map((cv) => cv.id)
        )
      }

      const innerInstanceCtx: InstanceCtx = {
        ...instanceCtx,
        contextVars: innerContextVars,
        contextVarValues: innerContextVarValues,
        getContextVarExprValue: (contextVarId: string, expr: Expr) => {
          // Lookup outer id
          const outerContextVarId = this.blockDef.contextVarMap[contextVarId]
          if (outerContextVarId) {
            // Map variable from inner to outer
            return instanceCtx.getContextVarExprValue(outerContextVarId, this.mapInnerToOuterVariables(expr))
          } else {
            // If global variable, pass through
            if ((instanceCtx.globalContextVars || []).find((cv) => cv.id == contextVarId)) {
              return instanceCtx.getContextVarExprValue(contextVarId, expr)
            }
            return
          }
        },
        onSelectContextVar: (contextVarId: string, primaryKey: any) => {
          // Lookup outer id
          const outerContextVarId = this.blockDef.contextVarMap[contextVarId]
          if (outerContextVarId) {
            instanceCtx.onSelectContextVar(outerContextVarId, primaryKey)
          }
        },
        setFilter: (contextVarId: string, filter: Filter) => {
          // Lookup outer id
          const outerContextVarId = this.blockDef.contextVarMap[contextVarId]
          if (outerContextVarId) {
            instanceCtx.setFilter(outerContextVarId, { ...filter, expr: this.mapInnerToOuterVariables(filter.expr) })
          }
        },
        getFilters: (contextVarId: string) => {
          // Lookup outer id, mapping any variables
          const outerContextVarId = this.blockDef.contextVarMap[contextVarId]
          if (outerContextVarId) {
            return instanceCtx
              .getFilters(outerContextVarId)
              .map((f) => ({ ...f, expr: this.mapOuterToInnerVariables(f.expr) }))
          }
          return []
        }
      }

      // Inject private context vars
      return (
        <ContextVarsInjector
          instanceCtx={innerInstanceCtx}
          innerBlock={widgetDef.blockDef}
          injectedContextVars={widgetDef.privateContextVars || []}
          injectedContextVarValues={_.pick(
            widgetDef.privateContextVarValues || {},
            (widgetDef.privateContextVars || []).map((cv) => cv.id)
          )}
        >
          {(instanceCtx: InstanceCtx, loading: boolean, refreshing: boolean) => {
            if (loading) {
              return (
                <div style={{ color: "#AAA", textAlign: "center" }}>
                  <i className="fa fa-circle-o-notch fa-spin" />
                </div>
              )
            }
            return innerBlock.renderInstance(instanceCtx)
          }}
        </ContextVarsInjector>
      )
    } else {
      // Handle case of widget with null block
      return <div />
    }
  }

  renderEditor(props: DesignCtx) {
    // Create widget options
    const widgetOptions = _.sortByAll(Object.values(props.widgetLibrary.widgets), "group", "name").map((w) => ({
      label: (w.group ? `${w.group}: ` : "") + w.name,
      value: w.id
    }))

    const handleWidgetIdChange = (widgetId: string | null) => {
      props.store.replaceBlock({ ...this.blockDef, widgetId: widgetId, contextVarMap: {} } as WidgetBlockDef)
    }

    const renderContextVarValues = () => {
      if (!this.blockDef.widgetId) {
        return null
      }

      // Find the widget
      const widgetDef = props.widgetLibrary.widgets[this.blockDef.widgetId]
      if (!widgetDef) {
        return null
      }

      return (
        <table className="table table-bordered table-sm">
          <tbody>
            {widgetDef.contextVars.map((contextVar) => {
              const cv = this.blockDef.contextVarMap[contextVar.id]
              const handleCVChange = (contextVarId: string) => {
                props.store.replaceBlock(
                  produce(this.blockDef, (draft) => {
                    draft.contextVarMap[contextVar.id] = contextVarId
                  })
                )
              }

              return (
                <tr key={contextVar.id}>
                  <td key="name">{contextVar.name}</td>
                  <td key="value">
                    <ContextVarPropertyEditor
                      contextVars={props.contextVars}
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
      <div>
        <LabeledProperty label="Widget">
          <Select
            value={this.blockDef.widgetId}
            onChange={handleWidgetIdChange}
            options={widgetOptions}
            nullLabel="Select Widget"
          />
        </LabeledProperty>
        {renderContextVarValues()}
      </div>
    )
  }
}

// Run a possibly deep object through a mapping function. Automatically maps all values of objects and arrays recursively
export const mapObjectTree = (obj: any, mapping: (input: any) => any): any => {
  // If array, map items
  if (_.isArray(obj)) {
    return obj.map((elem) => mapObjectTree(elem, mapping))
  }
  if (_.isObject(obj)) {
    // First map object itself
    const res = mapping(obj)

    // Then map values
    return _.mapValues(res, (value) => mapObjectTree(value, mapping))
  }
  return obj
}
