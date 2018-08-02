import * as React from 'react';
import { DropdownWidget, DropdownWidgetDef } from './DropdownWidget'
import { HorizontalWidget, HorizontalWidgetDef } from './HorizontalWidget';
import * as Widgets from './Widgets'

class BasicWidgetFactory {
  create = (widgetDef: Widgets.WidgetDef): Widgets.Widget => {
    if (widgetDef.type === "dropdown") {
      return new DropdownWidget(widgetDef as DropdownWidgetDef)
    }
    if (widgetDef.type === "horizontal") {
      return new HorizontalWidget(widgetDef as HorizontalWidgetDef, this.create)
    }

    throw new Error("Type not found")
  }
}

const widgetFactory = new BasicWidgetFactory()

let rootWidgetDef: Widgets.WidgetDef = {
  id: "a",
  type: "horizontal",
  items: [
    { id: "a1", type: "dropdown" },
    { id: "a2", type: "dropdown" }
  ]
}
const rootWidget = widgetFactory.create(rootWidgetDef)
rootWidgetDef = rootWidget.dropWidget({ id: "a3", type: "dropdown" }, "a2", Widgets.DropSide.right)

class WidgetComponentDesigner extends React.Component {
  render() {
    const widget = widgetFactory.create(rootWidgetDef)

    const props = {
      contextVars: [],
      store: {} as Widgets.WidgetStore,
      wrapDesignerElem(widgetDef: Widgets.WidgetDef, elem: React.ReactElement<any>) {
        return <div style={{ border: "solid 1px blue", padding: 10 }}>
          {elem}
        </div>
      }
    } as Widgets.RenderDesignProps

    return widget.renderDesign(props)
  }
}

export default WidgetComponentDesigner;
