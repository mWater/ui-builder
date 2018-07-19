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
  replaceWidget(widgetId: string, replaceWith: WidgetDefn | null): void,
  addWidget(widgetDefn: WidgetDefn, parentWidgetId: string | null, parentWidgetSection: string): void,
  dropWidget(widgetDefn: WidgetDefn, targetWidgetId: string, dropSide: DropSide): void,
}

// Widget definition
export interface WidgetDefn {
  id: string     // Unique id (globally)
  type: string,  // Type of the widget
}

export interface WidgetFactory {
  create(widgetDefn: WidgetDefn): Widget
}

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
  wrapDesignerElem(widgetDefn: WidgetDefn, elem: React.ReactElement<any>): React.ReactElement<any>,
}

export interface Widget {
  readonly id: string,

  renderDesigner(props: RenderDesignerProps): React.ReactElement<any> // TODO
  renderInstance(props: RenderInstanceProps): React.ReactElement<any> // TODO
  getContextVarExprs(contextVarId: string): Expr[], // Only for self

  getChildWidgetDefns(): WidgetDefn[],

  clone(): WidgetDefn
  replaceWidget(widgetId: string, replacementWidgetDefn: WidgetDefn | null): WidgetDefn | null,
  addWidget(addedWidgetDefn: WidgetDefn, parentWidgetId: string | null, parentWidgetSection: any): WidgetDefn,
  dropWidget(droppedWidgetDefn: WidgetDefn, targetWidgetId: string, dropSide: DropSide): WidgetDefn,
}

export abstract class LeafWidget implements Widget {
  widgetDefn: WidgetDefn

  constructor(widgetDefn: WidgetDefn) {
    this.widgetDefn = widgetDefn
  }

  get id() {
    return this.widgetDefn.id
  }

  abstract renderDesigner(props: RenderDesignerProps): React.ReactElement<any> // TODO

  abstract renderInstance(props: RenderInstanceProps): React.ReactElement<any> // TODO

  abstract getContextVarExprs(contextVarId: string): Expr[]

  getChildWidgetDefns() { return [] }

  clone() { 
    return Object.assign({}, this.widgetDefn, { id: uuid() }) 
  }

  replaceWidget(widgetId: string, replacementWidgetDefn: WidgetDefn | null) {
    if (widgetId === this.id) {
      return replacementWidgetDefn
    }
    return this.widgetDefn
  }

  addWidget(addedWidgetDefn: WidgetDefn, parentWidgetId: string | null, parentWidgetSection: any): WidgetDefn {
    throw new Error("Cannot add to leaf widget")
  }

  dropWidget(droppedWidgetDefn: WidgetDefn, targetWidgetId: string, dropSide: DropSide): WidgetDefn {
    if (targetWidgetId === this.id) {
      return dropWidget(droppedWidgetDefn, this.widgetDefn, dropSide)
    }
    return this.widgetDefn
  }
}

export interface HorizontalWidgetDefn extends WidgetDefn {
  items: WidgetDefn[]
}

export interface VerticalWidgetDefn extends WidgetDefn {
  items: WidgetDefn[]
}

// Handles logic of a simple dropping of a widget on another
export function dropWidget(droppedWidgetDefn: WidgetDefn, targetWidgetDefn: WidgetDefn, dropSide: DropSide): WidgetDefn {
  if (dropSide === DropSide.left) {
    return {
      id: uuid(),
      items: [droppedWidgetDefn, targetWidgetDefn],
      type: "horizontal"
    } as HorizontalWidgetDefn
  }
  if (dropSide === DropSide.right) {
    return {
      id: uuid(),
      items: [targetWidgetDefn, droppedWidgetDefn],
      type: "horizontal"
    } as HorizontalWidgetDefn
  }
  if (dropSide === DropSide.top) {
    return {
      id: uuid(),
      items: [droppedWidgetDefn, targetWidgetDefn],
      type: "vertical"
    } as HorizontalWidgetDefn
  }
  if (dropSide === DropSide.bottom) {
    return {
      id: uuid(),
      items: [targetWidgetDefn, droppedWidgetDefn],
      type: "vertical"
    } as HorizontalWidgetDefn
  }
  throw new Error("Unknown side")
}