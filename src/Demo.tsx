import * as React from 'react';
import { WidgetDef, LookupWidget } from './widgets/widgets';
import WidgetDesigner from './designer/WidgetDesigner';
import HTML5Backend from 'react-dnd-html5-backend'
import { DragDropContext } from 'react-dnd'
import BlockFactory from './widgets/BlockFactory';

const lookupWidget : LookupWidget = () => null

const basicBlockFactory = new BlockFactory(lookupWidget)

const initialWidgetDef: WidgetDef = {
  id: "1234",
  name: "Test",
  description: "Test",
  blockDef: {
    id: "a",
    type: "horizontal",
    items: [
      { id: "a1", type: "dropdown" },
      { id: "a2", type: "dropdown" }
    ]
  },
  contextVars: []
}

@DragDropContext(HTML5Backend)
export default class Demo extends React.Component<{}, { widgetDef: WidgetDef}> {
  constructor(props: object) {
    super(props)

    this.state = {
      widgetDef: initialWidgetDef
    }
  }

  handleWidgetDefChange = (widgetDef: WidgetDef) => {
    this.setState({ widgetDef })
  }
  
  render() {
    return (
      <WidgetDesigner widgetDef={this.state.widgetDef} createBlock={basicBlockFactory.createBlock} onWidgetDefChange={this.handleWidgetDefChange} />
    )
  }
}
