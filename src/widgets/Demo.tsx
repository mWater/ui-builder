import * as React from 'react';
import DropdownWidget from './DropdownWidget'
import HorizontalWidget from './HorizontalWidget';
import * as Widgets from './Widgets'

const rootWidget = {
  id: "a",
  type: "horizontal",
  items: [
    { id: "a1", type: "dropdown" },
    { id: "a2", type: "dropdown" }
  ]
}

class BasicWidgetFactory {
  create = (widgetDefn: Widgets.WidgetDefn): Widgets.Widget => {
    if (widgetDefn.type === "dropdown") {
      return new DropdownWidget(widgetDefn)
    }
    if (widgetDefn.type === "horizontal") {
      return new HorizontalWidget(widgetDefn as Widgets.HorizontalWidgetDefn, this)
    }

    throw new Error("Type not found")
  }
}

const widgetFactory = new BasicWidgetFactory()

class WidgetComponentDesigner extends React.Component {
  render() {
    const widget = widgetFactory.create(rootWidget)

    const props = {
      contextVars: [],
      store: {} as Widgets.Store,
      wrapDesignerElem(widgetDefn: Widgets.WidgetDefn, elem: React.ReactElement<any>) {
        return <div style={{ border: "solid 1px blue", padding: 10 }}>
          {elem}
        </div>
      }
    } as Widgets.RenderDesignerProps

    return widget.renderDesigner(props)
  }
}

export default WidgetComponentDesigner;
