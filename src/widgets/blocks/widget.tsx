import * as React from 'react';
import * as _ from 'lodash';
import LeafBlock from '../LeafBlock'
import { BlockDef, RenderDesignProps, RenderInstanceProps, CreateBlock, NullBlockStore, Filter, RenderEditorProps, ContextVar, ValidateBlockOptions, getBlockTree } from '../blocks'
import { Expr } from 'mwater-expressions'
import BlockPlaceholder from '../BlockPlaceholder';
import { WidgetLibrary } from '../../designer/widgetLibrary';
import { ActionLibrary } from '../ActionLibrary';

// Block which contains a widget
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

  validate(options: ValidateBlockOptions) { 
    if (!this.blockDef.widgetId) {
      return "Widget required"
    }

    // Ensure that all context variables exist
    for (const internalContextVarId of Object.keys(this.blockDef.contextVarMap)) {
      if (!options.contextVars.find(cv => cv.id === this.blockDef.contextVarMap[internalContextVarId])) {
        return "Missing context variable in mapping"
      }
    }

    return null 
  }

  // TODO get initial filters, mapped
  // async getInitialFilters(contextVarId: string): Promise<Filter[]> { 
  //   const widgetDef = this.lookupWidget(this.blockDef.widgetId)
  //   if (widgetDef && widgetDef.blockDef) {
  //     const innerBlock = this.createBlock(widgetDef.blockDef)

  //     // Map contextVarId to internal id
  //     for (const key of Object.keys(this.blockDef.contextVarMap)) {
  //       const value = this.blockDef.contextVarMap[key]
  //       if (value === contextVarId) {
  //         return innerBlock.getInitialFilters(key)
  //       }
  //     }
  //   }

  //   return []
  // }

  getContextVarExprs(contextVar: ContextVar, widgetLibrary: WidgetLibrary, actionLibrary: ActionLibrary) {
    if (!this.blockDef.widgetId) {
      return []
    }

    // Get inner widget
    const widgetDef = widgetLibrary.widgets[this.blockDef.widgetId]

    if (!widgetDef.blockDef) {
      return []
    }

    // Map context variable
    const innerContextVar = widgetDef.contextVars.find(cv => contextVar.id === this.blockDef.contextVarMap[cv.id])
    if (!innerContextVar) {
      return []
    }

    // Get complete context variables exprs of inner widget blocks
    const contextVarExprs = _.flatten(getBlockTree(widgetDef.blockDef, this.createBlock, widgetDef.contextVars).map(cb => {
      const block = this.createBlock(cb.blockDef)
      return block.getContextVarExprs(innerContextVar, widgetLibrary, actionLibrary)
    }))

    // Map any variables of expressions that cross widget boundary
    
    return contextVarExprs
  }

  renderDesign(props: RenderDesignProps) {
    if (!this.blockDef.widgetId) {
      return <div/>
    }

    // Find the widget
    const widgetDef = props.widgetLibrary.widgets[this.blockDef.widgetId]
    if (widgetDef && widgetDef.blockDef) {
      const innerBlock = this.createBlock(widgetDef.blockDef)

      // Create props for rendering inner block
      const innerProps : RenderDesignProps = {
        schema: props.schema,
        dataSource: props.dataSource,
        selectedId: null,
        locale: props.locale,
        contextVars: widgetDef.contextVars,
        widgetLibrary: props.widgetLibrary,
        store: new NullBlockStore(),
        renderChildBlock: (childProps, childBlockDef) => { 
          if (childBlockDef) {
            const childBlock = this.createBlock(childBlockDef)
            return childBlock.renderDesign(props)
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

  renderInstance(props: RenderInstanceProps): React.ReactElement<any> {
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

      const innerProps : RenderInstanceProps = {
        ...props,
        contextVars: widgetDef.contextVars,
        contextVarValues: { ...props.contextVarValues, ...mappedContextVarValues }, 
        getContextVarExprValue: (contextVarId: string, expr: Expr) => {
          // Lookup outer id
          const outerContextVarId = this.blockDef.contextVarMap[contextVarId]
          if (outerContextVarId) {
            return props.getContextVarExprValue(outerContextVarId, expr)
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

  renderEditor(props: RenderEditorProps) {
    return <div>TODO</div>
  }
}