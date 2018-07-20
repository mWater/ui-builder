import * as uuid from 'uuid/v4'
import Expr from './Expr';
import { DropSide, dropWidget, RenderDesignerProps, RenderInstanceProps,Widget, WidgetDef } from './Widgets';

export default abstract class LeafWidget implements Widget {
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
