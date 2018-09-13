import * as React from 'react';
import LeafBlock from '../LeafBlock'
import { BlockDef, BlockInstance, RenderDesignProps, RenderInstanceProps, CreateBlock, NullBlockStore, Filter } from '../blocks'
import { LookupWidget } from '../widgets';
import { Expr } from 'mwater-expressions'
import BlockPlaceholder from '../BlockPlaceholder';

// Block which contains a widget
export interface WidgetBlockDef extends BlockDef {
  widgetId: string;   // Id of the widget
  contextVarMap: { [contextVarId: string]: string };  // Maps each internal widgets' context variable id to an external one
}

export class WidgetBlock extends LeafBlock<WidgetBlockDef> {
  createBlock: CreateBlock
  lookupWidget: LookupWidget

  constructor(blockDef: WidgetBlockDef, createBlock: CreateBlock, lookupWidget: LookupWidget) {
    super(blockDef)
    this.createBlock = createBlock
    this.lookupWidget = lookupWidget
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

  getContextVarExprs(contextVarId: string) {
    // TODO!!
    return []
  }

  renderDesign(props: RenderDesignProps) {
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

  renderInstance(props: RenderInstanceProps, ref: (blockInstance: BlockInstance | null) => void): React.ReactElement<any> {
    // Find the widget
    const widgetDef = this.lookupWidget(this.blockDef.widgetId)
    if (widgetDef && widgetDef.blockDef) {
      const innerBlock = this.createBlock(widgetDef.blockDef)

      const innerProps : RenderInstanceProps = {
        locale: props.locale,
        database: props.database,
        schema: props.schema,
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
        },
        renderChildBlock: props.renderChildBlock
      }
  
      return innerBlock.renderInstance(innerProps, ref)
    } 
    else { // Handle case of widget with null block
      return <div/>
    }
  }
}