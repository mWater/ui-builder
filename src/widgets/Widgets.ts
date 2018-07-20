import * as React from 'react'
import * as uuid from 'uuid/v4'
import { Database } from './Database'
import Expr from './Expr'

export enum DropSide {
  top = "Top",
  bottom = "Bottom",
  left = "Left",
  right = "Right"
}

export interface Store {
  replaceWidget(widgetId: string, replaceWith: WidgetDef | null): void,
  addWidget(widgetDef: WidgetDef, parentWidgetId: string | null, parentWidgetSection: string): void,
  dragAndDropWidget(sourceWidgetDef: WidgetDef, targetWidgetId: string, dropSide: DropSide): void,
}

// Widget definition
export interface WidgetDef {
  id: string     // Unique id (globally)
  type: string,  // Type of the widget
  [index: string]: any  // Other props
}

export type WidgetFactory = (widgetDef: WidgetDef) => Widget

export interface ContextVar {
  id: string;     // Id of context variable
  name: string;   // Name of context variable
  type: string;   // row, rowset, ...
  table?: string;  // table of database (when type = "rowset")
  aggrOnly?: boolean; // true if only aggregate expressions are allowed (when type = "rowset")
  selectable?: boolean;  // true if row can be selected (when type = "rowset")
}

export interface RenderInstanceProps {
  database: Database,
  contextVars: ContextVar[],
  getContextVarValue(contextVarId: string): any,
  getContextVarExprValue(contextVarId: string, expr: Expr): any,
  onSelectContextVar(contextVarId: string, primaryKey: any): void; // selection call on context var (when type = "rowset" and selectable)
}

export interface RenderDesignerProps {
  contextVars: ContextVar[],
  store: Store,

  // Designer element and all sub-widget elements must wrapped using this function
  wrapDesignerElem(widgetDef: WidgetDef, elem: React.ReactElement<any>): React.ReactElement<any>,
}

export interface Widget {
  readonly id: string

  renderDesigner(props: RenderDesignerProps): React.ReactElement<any> // TODO
  renderInstance(props: RenderInstanceProps): React.ReactElement<any> // TODO
  getContextVarExprs(contextVarId: string): Expr[] // Only for self

  getChildWidgetDefs(): WidgetDef[]
  // getCreatedContextVars(): ContextVar[]

  // TODO filters? how to get default value pre-render? how to gather from the widget instances?

  clone(): WidgetDef
  replaceWidget(widgetId: string, replacementWidgetDef: WidgetDef | null): WidgetDef | null
  addWidget(addedWidgetDef: WidgetDef, parentWidgetId: string | null, parentWidgetSection: any): WidgetDef
  dropWidget(droppedWidgetDef: WidgetDef, targetWidgetId: string, dropSide: DropSide): WidgetDef

}

// Handles logic of a simple dropping of a widget on another
export function dropWidget(droppedWidgetDef: WidgetDef, targetWidgetDef: WidgetDef, dropSide: DropSide): WidgetDef {
  if (dropSide === DropSide.left) {
    return {
      id: uuid(),
      items: [droppedWidgetDef, targetWidgetDef],
      type: "horizontal"
    }
  }
  if (dropSide === DropSide.right) {
    return {
      id: uuid(),
      items: [targetWidgetDef, droppedWidgetDef],
      type: "horizontal"
    }
  }
  if (dropSide === DropSide.top) {
    return {
      id: uuid(),
      items: [droppedWidgetDef, targetWidgetDef],
      type: "vertical"
    }
  }
  if (dropSide === DropSide.bottom) {
    return {
      id: uuid(),
      items: [targetWidgetDef, droppedWidgetDef],
      type: "vertical"
    }
  }
  throw new Error("Unknown side")
}