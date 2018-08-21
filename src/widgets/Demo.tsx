import * as React from 'react';
import { DropdownBlock, DropdownBlockDef } from './dropdownBlock'
import { HorizontalBlock, HorizontalBlockDef } from './horizontalBlock';
import { BlockDef, Block } from './blocks';
import { WidgetDef } from './widgets';
import WidgetDesigner from './WidgetDesigner';
import HTML5Backend from 'react-dnd-html5-backend'
import { DragDropContext } from 'react-dnd'
import { VerticalBlock, VerticalBlockDef } from './verticalBlock';

const basicBlockFactory = (blockDef: BlockDef): Block => {
  if (blockDef.type === "dropdown") {
    return new DropdownBlock(blockDef as DropdownBlockDef)
  }
  if (blockDef.type === "horizontal") {
    return new HorizontalBlock(blockDef as HorizontalBlockDef, basicBlockFactory)
  }
  if (blockDef.type === "vertical") {
    return new VerticalBlock(blockDef as VerticalBlockDef, basicBlockFactory)
  }

  throw new Error("Type not found")
}

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
      <WidgetDesigner widgetDef={this.state.widgetDef} blockFactory={basicBlockFactory} onWidgetDefChange={this.handleWidgetDefChange} />
    )
  }
}
