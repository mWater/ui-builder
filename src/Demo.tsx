import * as React from 'react';
import { WidgetDef, LookupWidget } from './widgets/widgets';
import WidgetDesigner from './designer/WidgetDesigner';
import HTML5Backend from 'react-dnd-html5-backend'
import { DragDropContext } from 'react-dnd'
import BlockFactory from './widgets/BlockFactory';
import { Schema } from 'mwater-expressions';
import WidgetLibraryDesigner, { WidgetLibrary } from './designer/widgetLibrary';
import MWaterDataSource from 'mwater-expressions/lib/MWaterDataSource'
const basicBlockFactory = new BlockFactory()

const waterPointsWidgetDef: WidgetDef = {
  "id": "1234",
  "name": "Water Point List",
  "description": "Test",
  "blockDef": {
    "id": "dd63a813-55e1-4652-ae99-3dcb75a4b3a1",
    "items": [
      {
        "id": "fc2269a6-c74c-4005-b06d-2f9cddd0815e",
        "type": "text",
        "text": {
          "_base": "en",
          "en": "Water Points"
        },
        "style": "h1"
      },
      {
        "id": "b1ab5d37-a11f-44b9-810c-e1b02f98c32a",
        "type": "expression",
        "expr": {
          "type": "op",
          "op": "count",
          "table": "entities.water_point",
          "exprs": []
        },
        "contextVarId": "45c4cb2a-7bf5-4f33-b6dc-00d2053357de"
      }
    ],
    "type": "vertical"
  },
  "contextVars": [
    {
      "id": "45c4cb2a-7bf5-4f33-b6dc-00d2053357de",
      "name": "Water Points Rowset",
      "type": "rowset",
      "table": "entities.water_point"
    }
  ],
  "contextVarPreviewValues": {}
}

const waterPointWidgetDef: WidgetDef = {
  "id": "1235",
  "name": "Water Point",
  "description": "Test",
  "blockDef": {
    "id": "71e7e315-fb7a-4309-a13e-9c1e72d94dd4",
    "items": [
      {
        "id": "fc2269a6-c74c-4005-b06d-2f9cddd0815e",
        "type": "text",
        "text": {
          "_base": "en",
          "en": "Water Point Page"
        },
        "style": "h1"
      },
    ],
    "type": "vertical"
  },
  "contextVars": [],
  contextVarPreviewValues: {}
}

const initialWidgetLibrary : WidgetLibrary = {
  widgets: {
    "1234": waterPointsWidgetDef,
    "1235": waterPointWidgetDef
  }
}

const schema = new Schema({
  tables: [
    { 
      id: "entities.water_point",
      name: { _base: "en", en: "Water Points" },
      primaryKey: "_id",
      contents: [
        { id: "name", type: "text", name: { _base: "en", en: "Name" } }
      ]
    }
  ]
})

const dataSource = new MWaterDataSource("https://api.mwater.co/v3/")

@DragDropContext(HTML5Backend)
export default class Demo extends React.Component<{}, { widgetLibrary: WidgetLibrary}> {
  constructor(props: object) {
    super(props)

    this.state = {
      widgetLibrary: initialWidgetLibrary
    }
  }

  handleWidgetLibraryChange = (widgetLibrary: WidgetLibrary) => {
    this.setState({ widgetLibrary })
  }
  
  render() {
    return (
      <div style={{ padding: 5, height: "100%" }}>
        <WidgetLibraryDesigner
          widgetLibrary={this.state.widgetLibrary} 
          blockFactory={basicBlockFactory} 
          schema={schema}
          dataSource={dataSource}
          onWidgetLibraryChange={this.handleWidgetLibraryChange} />
      </div>
    )
  }
}
