import * as React from 'react';
import { WidgetDef, LookupWidget } from './widgets/widgets';
import WidgetDesigner from './designer/WidgetDesigner';
import HTML5Backend from 'react-dnd-html5-backend'
import { DragDropContext } from 'react-dnd'
import BlockFactory from './widgets/BlockFactory';
import { Schema } from 'mwater-expressions';

const lookupWidget : LookupWidget = () => null

const basicBlockFactory = new BlockFactory(lookupWidget)

const initialWidgetDef: WidgetDef = {
  "id": "1234",
  "name": "Test",
  "description": "Test",
  "blockDef": {
    "id": "71e7e315-fb7a-4309-a13e-9c1e72d94dd4",
    "items": [
      {
        "id": "fc2269a6-c74c-4005-b06d-2f9cddd0815e",
        "type": "text",
        "text": {
          "_base": "en",
          "en": "This is a test"
        },
        "style": "h1"
      },
      {
        "id": "76ecb1c1-b9a8-4760-a7b6-40dae77b3c24",
        "type": "text",
        "text": {
          "_base": "en",
          "en": "First section"
        },
        "style": "h3"
      },
      {
        "id": "62dc6a7d-9630-485f-8675-8477410a5047",
        "items": [
          {
            "id": "ec78e543-bef7-4f49-8581-7649e383c667",
            "type": "text",
            "text": {
              "_base": "en",
              "en": "I wonder why I wonder..."
            },
            "style": "p"
          },
          {
            "id": "ffdaa670-5e26-4e7f-90c1-038612511166",
            "type": "text",
            "text": {
              "_base": "en",
              "en": "Would this solve it?"
            },
            "style": "p"
          }
        ],
        "type": "horizontal"
      }
    ],
    "type": "vertical"
  },
  "contextVars": []
}

const schema = new Schema()

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
      <WidgetDesigner 
        widgetDef={this.state.widgetDef} 
        createBlock={basicBlockFactory.createBlock} 
        schema={schema}
        onWidgetDefChange={this.handleWidgetDefChange} />
    )
  }
}
