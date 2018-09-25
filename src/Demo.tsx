import * as React from 'react';
import { WidgetDef, LookupWidget } from './widgets/widgets';
import WidgetDesigner from './designer/WidgetDesigner';
import HTML5Backend from 'react-dnd-html5-backend'
import { DragDropContext } from 'react-dnd'
import BlockFactory from './widgets/BlockFactory';
import { Schema } from 'mwater-expressions';
import WidgetLibraryDesigner, { WidgetLibrary } from './designer/widgetLibrary';
import MWaterDataSource from 'mwater-expressions/lib/MWaterDataSource'
import { BasicActionFactory } from './widgets/BasicActionFactory';
const basicBlockFactory = new BlockFactory()

const waterPointsWidgetDef: WidgetDef = {
  "id": "1234",
  "name": "Water Point List",
  "description": "Test",
  "blockDef": {
    "id": "210017a2-7ad8-4a4b-9e26-d43bbdcd723d",
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
      },
      {
        "id": "f3684226-7e0e-4165-b594-b61536e9cc61",
        "type": "queryTable",
        "headers": [
          {
            "id": "62caad04-b7b1-4590-ae9e-e602da8b1cc1",
            "type": "text",
            "text": {
              "_base": "en",
              "en": "Header 1"
            },
            "style": "div"
          },
          {
            "id": "034cdbf1-5855-40a6-b234-36074a68e230",
            "type": "text",
            "text": {
              "_base": "en",
              "en": "Header 2"
            },
            "style": "div"
          }
        ],
        "contents": [
          {
            "id": "b3fabc30-668e-4b93-96f8-b4f85cbcc2b3",
            "type": "expression",
            "expr": {
              "type": "field",
              "table": "entities.water_point",
              "column": "name"
            },
            "contextVarId": "f3684226-7e0e-4165-b594-b61536e9cc61_row"
          },
          {
            "id": "b3fabc30-668e-4b93-96f8-b4f85cbcc2b4",
            "type": "expression",
            "expr": {
              "type": "field",
              "table": "entities.water_point",
              "column": "desc"
            },
            "contextVarId": "f3684226-7e0e-4165-b594-b61536e9cc61_row"
          }
        ],
        limit: 10,
        rowset: "45c4cb2a-7bf5-4f33-b6dc-00d2053357de",
        mode: "singleRow"
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
        { id: "name", type: "text", name: { _base: "en", en: "Name" } },
        { id: "desc", type: "text", name: { _base: "en", en: "Description" } }
      ]
    }
  ]
})

const dataSource = new MWaterDataSource("https://api.mwater.co/v3/", null, { localCaching: false, serverCaching: false })

const actionFactory = new BasicActionFactory()

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
          actionFactory={actionFactory}
          schema={schema}
          dataSource={dataSource}
          onWidgetLibraryChange={this.handleWidgetLibraryChange} />
      </div>
    )
  }
}
