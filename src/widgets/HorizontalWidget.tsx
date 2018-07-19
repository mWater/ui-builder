import produce from 'immer'
import * as React from 'react';
import { DropSide, RenderDesignerProps, RenderInstanceProps, Widget, WidgetDefn, WidgetFactory } from './Widgets'

interface HorizontalWidgetDefn extends WidgetDefn {
  items: WidgetDefn[]
}

export default class HorizontalWidget implements Widget {
  widgetDefn: HorizontalWidgetDefn
  widgetFactory: WidgetFactory

  constructor(widgetDefn: HorizontalWidgetDefn, widgetFactory: WidgetFactory) {
    this.widgetDefn = widgetDefn
    this.widgetFactory = widgetFactory
  }

  get id() { return this.widgetDefn.id }

  getChildWidgetDefns(): WidgetDefn[] {
    return this.widgetDefn.items
  }

  clone(): WidgetDefn {
    throw new Error("Method not implemented.");
  }

  replaceWidget(widgetId: string, replacementWidgetDefn: WidgetDefn | null): WidgetDefn | null {
    if (widgetId === this.id) {
      return replacementWidgetDefn
    }

    return produce(this.widgetDefn, draft => {
      for (let i = 0; i<draft.items.length; i++) {
        draft.items[i] = this.widgetFactory.create(draft.items[i]).clone()
      }
    })
  }

  addWidget(addedWidgetDefn: WidgetDefn, parentWidgetId: string | null, parentWidgetSection: any): WidgetDefn {
    throw new Error("Method not implemented.");
  }

  dropWidget(droppedWidgetDefn: WidgetDefn, targetWidgetId: string, dropSide: DropSide): WidgetDefn {
    throw new Error("Method not implemented.");
  }

  renderChildDesigner(props: RenderDesignerProps, childWidgetDefn: WidgetDefn) {
    const childWidget = this.widgetFactory.create(childWidgetDefn)

    return (
      <div style={{ display: "inline-block" }}>
        { childWidget.renderDesigner(props) }
      </div>
    )
  }

  renderDesigner(props: RenderDesignerProps) {
    return (
      <div>
        { this.widgetDefn.items.map(childWidget => this.renderChildDesigner(props, childWidget)) }
      </div>
    )      
  }

  renderInstance(props: RenderInstanceProps) {
    return (
      <select>
        <option value="a">A</option>
      </select>
    )      
  }

  getContextVarExprs(contextVarId: string) { return [] }
}