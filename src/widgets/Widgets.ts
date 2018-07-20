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
  onSelect?(primaryKey: any): void; // selection call (when type = "rowset" and selectable)
}

export interface RenderInstanceProps {
  database: Database,
  contextVars: ContextVar[],
  getContextVarValue(contextVarId: string): any,
  getContextVarExprValue(contextVarId: string, expr: Expr): any,
}

export interface RenderDesignerProps {
  contextVars: ContextVar[],
  store: Store,

  // Designer element and all sub-widget elements must wrapped using this function
  wrapDesignerElem(widgetDef: WidgetDef, elem: React.ReactElement<any>): React.ReactElement<any>,
}

export interface Widget {
  readonly id: string,

  renderDesigner(props: RenderDesignerProps): React.ReactElement<any> // TODO
  renderInstance(props: RenderInstanceProps): React.ReactElement<any> // TODO
  getContextVarExprs(contextVarId: string): Expr[], // Only for self

  getChildWidgetDefs(): WidgetDef[],

  clone(): WidgetDef
  replaceWidget(widgetId: string, replacementWidgetDef: WidgetDef | null): WidgetDef | null,
  addWidget(addedWidgetDef: WidgetDef, parentWidgetId: string | null, parentWidgetSection: any): WidgetDef,
  dropWidget(droppedWidgetDef: WidgetDef, targetWidgetId: string, dropSide: DropSide): WidgetDef,
}

export abstract class LeafWidget implements Widget {
  widgetDef: WidgetDef

  constructor(widgetDef: WidgetDef) {
    this.widgetDef = widgetDef
  }

  get id() {
    return this.widgetDef.id
  }

  abstract renderDesigner(props: RenderDesignerProps): React.ReactElement<any> // TODO

  abstract renderInstance(props: RenderInstanceProps): React.ReactElement<any> // TODO

  abstract getContextVarExprs(contextVarId: string): Expr[]

  getChildWidgetDefs() { return [] }

  clone() { 
    return Object.assign({}, this.widgetDef, { id: uuid() }) 
  }

  addWidget(addedWidgetDef: WidgetDef, parentWidgetId: string | null, parentWidgetSection: any): WidgetDef {
    throw new Error("Cannot add to leaf widget")
  }

  replaceWidget(widgetId: string, replacementWidgetDef: WidgetDef | null) {
    return (widgetId === this.id) ? replacementWidgetDef : this.widgetDef
  }

  dropWidget(droppedWidgetDef: WidgetDef, targetWidgetId: string, dropSide: DropSide): WidgetDef {
    if (targetWidgetId === this.id) {
      return dropWidget(droppedWidgetDef, this.widgetDef, dropSide)
    }
    return this.widgetDef
  }
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