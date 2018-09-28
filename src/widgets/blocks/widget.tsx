import * as React from 'react';
import LeafBlock from '../LeafBlock'
import { BlockDef, RenderDesignProps, RenderInstanceProps, CreateBlock, NullBlockStore, Filter, RenderEditorProps, ContextVar } from '../blocks'
import { LookupWidget } from '../widgets';
import { Expr } from 'mwater-expressions'
import BlockPlaceholder from '../BlockPlaceholder';

// Block which contains a widget
export interface WidgetBlockDef extends BlockDef {
  widgetId: string | null   // Id of the widget
  contextVarMap: { [contextVarId: string]: string }  // Maps each internal widgets' context variable id to an external one
}

export class WidgetBlock extends LeafBlock<WidgetBlockDef> {
  createBlock: CreateBlock
  lookupWidget: LookupWidget

  constructor(blockDef: WidgetBlockDef, createBlock: CreateBlock, lookupWidget: LookupWidget) {
    super(blockDef)
    this.createBlock = createBlock
    this.lookupWidget = lookupWidget
  }

  validate() { 
    if (!this.blockDef.widgetId) {
      return "Widget required"
    }
    // TODO!!!
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

  getContextVarExprs(contextVar: ContextVar) {
    // TODO!!
    return []
  }

  renderDesign(props: RenderDesignProps) {
    if (!this.blockDef.widgetId) {
      return <div/>
    }

    // Find the widget
    const widgetDef = this.lookupWidget(this.blockDef.widgetId)
    if (widgetDef && widgetDef.blockDef) {
      const innerBlock = this.createBlock(widgetDef.blockDef)

      // Create props for rendering inner block
      const innerProps : RenderDesignProps = {
        schema: props.schema,
        dataSource: props.dataSource,
        selectedId: null,
        locale: props.locale,
        contextVars: widgetDef.contextVars,
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
    // Find the widget
    const widgetDef = this.lookupWidget(this.blockDef.widgetId!)
    if (widgetDef && widgetDef.blockDef) {
      const innerBlock = this.createBlock(widgetDef.blockDef)

      const innerProps : RenderInstanceProps = {
        ...props,
        contextVars: widgetDef.contextVars,
        getContextVarValue: (contextVarId: string) => {
          // Lookup outer id
          const outerContextVarId = this.blockDef.contextVarMap[contextVarId]
          if (outerContextVarId) {
            return props.getContextVarValue(outerContextVarId)
          }
          else {
            return
          }
        }, 
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
          // TODO
          // Lookup outer id
          const outerContextVarId = this.blockDef.contextVarMap[contextVarId]
          if (outerContextVarId) {
            props.onSelectContextVar(outerContextVarId, primaryKey)
          }
        },
        setFilter: (contextVarId: string, filter: Filter) => {
          // TODO
          // Lookup outer id
          const outerContextVarId = this.blockDef.contextVarMap[contextVarId]
          if (outerContextVarId) {
            props.setFilter(outerContextVarId, filter)
          }
        },
        getFilters: (contextVarId: string) => {
          // TODO
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