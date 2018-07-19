import * as React from 'react';
import { LeafWidget, RenderDesignerProps, RenderInstanceProps } from './Widgets'

export default class DropdownWidget extends LeafWidget {
  renderDesigner(props: RenderDesignerProps) {
    return props.wrapDesignerElem(this.widgetDefn,
      <select>
        <option value="a">A</option>
      </select>
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