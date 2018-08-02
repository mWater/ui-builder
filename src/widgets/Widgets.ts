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

export interface WidgetStore {
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
  type: string;   // row, rowset, text, number, date, datetime, enum, enumset, ...
  table?: string;  // table of database (when type = "rowset" or "row")
  aggrOnly?: boolean; // true if only aggregate expressions are allowed (when type = "rowset")
  selectable?: boolean;  // true if row can be selected (when type = "rowset")
}

export interface RenderInstanceProps {
  database: Database,
  contextVars: ContextVar[],
  getContextVarValue(contextVarId: string): any,
  getContextVarExprValue(contextVarId: string, expr: Expr): any,
  onSelectContextVar(contextVarId: string, primaryKey: any): void; // selection call on context var (when type = "rowset" and selectable)

  // Set a filter on a rowset context variable
  setFilter(contextVarId: string, filter: Filter): void;
}

export interface RenderDesignProps {
  contextVars: ContextVar[],
  store: WidgetStore,

  // Designer element and all sub-widget elements must wrapped using this function
  wrapDesignerElem(widgetDef: WidgetDef, elem: React.ReactElement<any>): React.ReactElement<any>,
}

export interface RenderEditorProps {
  contextVars: ContextVar[],
  store: WidgetStore,
}

// A filter that applies to a particular rowset context variable
export interface Filter {
  id: string, // Unique id of the filter
  memo: any,  // For internal use by the widget. Will be passed back unchanged.
  expr: Expr  // Boolean filter expression on the rowset
}

export abstract class Widget {
  widgetDef: WidgetDef

  constructor(widgetDef: WidgetDef) {
    this.widgetDef = widgetDef
  }

  get id() { return this.widgetDef.id; }

  // Render the widget as it looks in design mode
  abstract renderDesign(props: RenderDesignProps): React.ReactElement<any> // TODO

  // Render a live instance of the widget
  abstract renderInstance(props: RenderInstanceProps): React.ReactElement<any> // TODO

  // Render an optional property editor for the widget
  abstract renderEditor(props: RenderEditorProps): React.ReactElement<any> | null // TODO

  // Get any context variables expressions that this widget or any subwidgets need
  abstract getContextVarExprs(contextVarId: string): Expr[] 

  // Get child widgets
  abstract getChildWidgetDefs(): WidgetDef[]

  // Get initial filters for this widget
  abstract getInitialFilters(contextVarId: string): Promise<Filter[]>;
  
  // getCreatedContextVars(): ContextVar[]

  // Make a copy of the widget with a new id
  abstract clone(): WidgetDef

  // Replace/remove the widget with the specified id
  abstract replaceWidget(widgetId: string, replacementWidgetDef: WidgetDef | null): WidgetDef | null

  // Add a widget to a parent widget. parentWidgetSection is widget-specific
  abstract addWidget(addedWidgetDef: WidgetDef, parentWidgetId: string | null, parentWidgetSection: any): WidgetDef

  // Drop a widget on top of another
  abstract dropWidget(droppedWidgetDef: WidgetDef, targetWidgetId: string, dropSide: DropSide): WidgetDef
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