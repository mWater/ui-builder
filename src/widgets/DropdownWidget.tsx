import * as React from 'react';
import LeafWidget from './LeafWidget'
import { RenderDesignProps, RenderEditorProps, RenderInstanceProps, WidgetDef } from './Widgets'

export interface DropdownWidgetDef extends WidgetDef {
  column: string
}

export class DropdownWidget extends LeafWidget {
  widgetDef: DropdownWidgetDef

  constructor(widgetDef: DropdownWidgetDef) {
    super(widgetDef)
  }

  renderDesign(props: RenderDesignProps) {
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

  renderEditor(props: RenderEditorProps) {
    return null
  }

  getContextVarExprs(contextVarId: string) { return [] }
}