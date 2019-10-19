import * as React from 'react';
import * as _ from 'lodash';
import LeafBlock from '../LeafBlock'
import { BlockDef, CreateBlock, NullBlockStore, Filter, ContextVar } from '../blocks'
import { Expr, Schema } from 'mwater-expressions'
import BlockPlaceholder from '../BlockPlaceholder';
import { LabeledProperty, ContextVarPropertyEditor } from '../propertyEditors';
import { Select } from 'react-library/lib/bootstrap';
import produce from 'immer';
import { InstanceCtx, DesignCtx } from '../../contexts';

/** Block which contains a widget */
export interface WidgetBlockDef extends BlockDef {
  widgetId: string | null   // Id of the widget
  contextVarMap: { [internalContextVarId: string]: string }  // Maps each internal widgets' context variable id to an external one
}

export class WidgetBlock extends LeafBlock<WidgetBlockDef> {
  createBlock: CreateBlock

  constructor(blockDef: WidgetBlockDef, createBlock: CreateBlock) {
    super(blockDef)
    this.createBlock = createBlock
  }

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
      if (!options.contextVars.find(cv => cv.id === this.blockDef.contextVarMap[internalContextVarId])) {
        return "Missing context variable in mapping"
      }
    }

    return null 
  }

  getInitialFilters(contextVarId: string, instanceCtx: InstanceCtx): Filter[] { 
    const widgetDef = instanceCtx.widgetLibrary.widgets[this.blockDef.widgetId!]
    if (widgetDef && widgetDef.blockDef) {
      const innerBlock = this.createBlock(widgetDef.blockDef)

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
    const innerContextVar = widgetDef.contextVars.find(cv => contextVar.id === this.blockDef.contextVarMap[cv.id])
    if (!innerContextVar) {
      return []
    }

    // Get complete context variables exprs of inner widget blocks
    let contextVarExprs = this.createBlock(widgetDef.blockDef).getSubtreeContextVarExprs(innerContextVar, {
      ...ctx, contextVars: widgetDef.contextVars,
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
        }
        else {
          return e
        }
      }
      else {
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
      const innerBlock = this.createBlock(widgetDef.blockDef)

      // Create props for rendering inner block
      const innerProps : DesignCtx = {
        ...props,
        selectedId: null,
        contextVars: widgetDef.contextVars,
        store: new NullBlockStore(),
        blockPaletteEntries: [],
        renderChildBlock: (childProps, childBlockDef) => { 
          if (childBlockDef) {
            const childBlock = this.createBlock(childBlockDef)
            return childBlock.renderDesign(childProps)
          }
          else {
            return <BlockPlaceholder/>
          }
        },
      }
      return (
        <div>
          {innerBlock.renderDesign(innerProps)}
          {/* Cover up design so it can't be edited */}
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}/>
        </div>
      )     
    } 
    else { // Handle case of widget with null block
      return <div/>
    }
  }

  renderInstance(props: InstanceCtx): React.ReactElement<any> {
    // Map context var values
    const mappedContextVarValues = {} as object

    for (const innerContextVarId of Object.keys(this.blockDef.contextVarMap)) {
      const outerContextVarId = this.blockDef.contextVarMap[innerContextVarId]
      if (outerContextVarId) {
        mappedContextVarValues[innerContextVarId] = props.contextVarValues[outerContextVarId]
      }
      else {
        mappedContextVarValues[innerContextVarId] = null
      }
    }

    // Find the widget
    const widgetDef = props.widgetLibrary.widgets[this.blockDef.widgetId!]
    if (widgetDef && widgetDef.blockDef) {
      const innerBlock = this.createBlock(widgetDef.blockDef)

      const innerProps : InstanceCtx = {
        ...props,
        contextVars: props.contextVars.concat(widgetDef.contextVars),
        contextVarValues: { ...props.contextVarValues, ...mappedContextVarValues }, 
        getContextVarExprValue: (contextVarId: string, expr: Expr) => {
          // Lookup outer id
          const outerContextVarId = this.blockDef.contextVarMap[contextVarId]
          if (outerContextVarId) {
            // Map variable from inner to outer
            return props.getContextVarExprValue(outerContextVarId, this.mapInnerToOuterVariables(expr))
          }
          else {
            return
          }
        }, 
        onSelectContextVar: (contextVarId: string, primaryKey: any) => {
          // Lookup outer id
          const outerContextVarId = this.blockDef.contextVarMap[contextVarId]
          if (outerContextVarId) {
            props.onSelectContextVar(outerContextVarId, primaryKey)
          }
        },
        setFilter: (contextVarId: string, filter: Filter) => {
          // Lookup outer id
          const outerContextVarId = this.blockDef.contextVarMap[contextVarId]
          if (outerContextVarId) {
            props.setFilter(outerContextVarId, filter)
          }
        },
        getFilters: (contextVarId: string) => {
          // Lookup outer id
          const outerContextVarId = this.blockDef.contextVarMap[contextVarId]
          if (outerContextVarId) {
            return props.getFilters(outerContextVarId)
          }
          return []
        }
      }
  
      return innerBlock.renderInstance(innerProps)
    } 
    else { // Handle case of widget with null block
      return <div/>
    }
  }

  renderEditor(props: DesignCtx) {
    // Create widget options 
    const widgetOptions = _.sortBy(Object.values(props.widgetLibrary.widgets).map(w => ({ label: w.name, value: w.id })), "label")

    const handleWidgetIdChange = (widgetId: string | null) => {
      props.store.replaceBlock({ ...this.blockDef, widgetId: widgetId, contextVarMap: {} })
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
        <table className="table table-bordered table-condensed">
          <tbody>
            { widgetDef.contextVars.map(contextVar => {
              const cv = this.blockDef.contextVarMap[contextVar.id]
              const handleCVChange = (contextVarId: string) => {
                props.store.replaceBlock(produce(this.blockDef, (draft) => {
                  draft.contextVarMap[contextVar.id] = contextVarId
                }))
              }

              return (
                <tr key={contextVar.id}>
                  <td>{contextVar.name}</td>
                  <td>
                    <ContextVarPropertyEditor 
                      contextVars={props.contextVars}  
                      types={[contextVar.type]}
                      table={contextVar.table}
                      value={cv}
                      onChange={ handleCVChange }
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )
    }

    return <div>
      <LabeledProperty label="Widget">
        <Select value={this.blockDef.widgetId} onChange={handleWidgetIdChange} options={widgetOptions} nullLabel="Select Widget" />
      </LabeledProperty>
      { renderContextVarValues() }
    </div>
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