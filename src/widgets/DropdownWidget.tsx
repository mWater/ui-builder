import * as React from 'react';
import LeafWidget from './LeafWidget'
import { RenderDesignProps, RenderEditorProps, RenderInstanceProps, WidgetDef, WidgetInstance } from './Widgets'

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

  renderInstance(props: RenderInstanceProps, ref: (widgetInstance: WidgetInstance | null) => void): React.ReactElement<any> {
    return <DropdownWidgetInstance id={this.id} ref={ref}/>
  }

  renderEditor(props: RenderEditorProps) {
    return null
  }

  getContextVarExprs(contextVarId: string) { return [] }
}

class DropdownWidgetInstance extends React.Component<{ id: string }> implements WidgetInstance {
  // validate() { return [] }

  render() {
    return (
      <select>
        <option value="a">A {this.props.id}</option>
      </select>
    )      
  }
}