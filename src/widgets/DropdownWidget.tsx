import * as React from 'react';
import { LeafWidget, RenderDesignerProps, RenderInstanceProps, WidgetDef } from './Widgets'

export interface DropdownWidgetDef extends WidgetDef {
  column: string
}

export class DropdownWidget extends LeafWidget {
  widgetDef: DropdownWidgetDef

  constructor(widgetDef: DropdownWidgetDef) {
    super(widgetDef)
  }

  renderDesigner(props: RenderDesignerProps) {
    return props.wrapDesignerElem(this.widgetDef,
      <select>
        <option value="a">A {this.id}</option>
      </select>
    )     
  }

  renderInstance(props: RenderInstanceProps) {
    return (
      <select>
        <option value="a">A {this.id}</option>
      </select>
    )      
  }

  getContextVarExprs(contextVarId: string) { return [] }
}