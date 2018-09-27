import * as React from 'react';
import { WidgetDef, LookupWidget } from './widgets/widgets';
import WidgetDesigner from './designer/WidgetDesigner';
import HTML5Backend from 'react-dnd-html5-backend'
import { DragDropContext } from 'react-dnd'
import BlockFactory from './widgets/BlockFactory';
import { Schema } from 'mwater-expressions';
import WidgetLibraryDesigner, { WidgetLibrary } from './designer/widgetLibrary';
import MWaterDataSource from 'mwater-expressions/lib/MWaterDataSource'
import { ActionLibrary } from './widgets/ActionLibrary';
import * as _ from 'lodash';
const basicBlockFactory = new BlockFactory()

// const defaultWidgetLibrary : WidgetLibrary = {
//   "widgets": {
//     "1234": {
//       "id": "1234",
//       "name": "Water Point List",
//       "description": "Test",
//       "blockDef": {
//         "id": "210017a2-7ad8-4a4b-9e26-d43bbdcd723d",
//         "items": [
//           {
//             "id": "fc2269a6-c74c-4005-b06d-2f9cddd0815e",
//             "type": "text",
//             "text": {
//               "_base": "en",
//               "en": "Water Points"
//             },
//             "style": "h1"
//           },
//           {
//             "id": "e7c62d7c-949e-47c4-bf4d-b1082dad66e5",
//             "items": [
//               {
//                 "id": "1cc1c18b-535e-4db4-93e1-809ec209cf6c",
//                 "type": "text",
//                 "text": {
//                   "_base": "en",
//                   "en": "Number of Water Points:"
//                 },
//                 "style": "div"
//               },
//               {
//                 "id": "b1ab5d37-a11f-44b9-810c-e1b02f98c32a",
//                 "type": "expression",
//                 "expr": {
//                   "type": "op",
//                   "op": "count",
//                   "table": "entities.water_point",
//                   "exprs": []
//                 },
//                 "contextVarId": "45c4cb2a-7bf5-4f33-b6dc-00d2053357de"
//               }
//             ],
//             "type": "horizontal",
//             "align": "left"
//           },
//           {
//             "id": "ca4eb666-8a50-49c8-b6b9-0bb2a31f2c2b",
//             "type": "search",
//             "searchExprs": [
//               {
//                 "type": "field",
//                 "table": "entities.water_point",
//                 "column": "name"
//               },
//               {
//                 "type": "field",
//                 "table": "entities.water_point",
//                 "column": "desc"
//               }
//             ],
//             "rowset": "45c4cb2a-7bf5-4f33-b6dc-00d2053357de",
//             "placeholder": {
//               "_base": "en",
//               "en": "Search..."
//             },
//             "rowsetId": "45c4cb2a-7bf5-4f33-b6dc-00d2053357de",
//             "rowsetContextVarId": "45c4cb2a-7bf5-4f33-b6dc-00d2053357de"
//           },
//           {
//             "id": "f3684226-7e0e-4165-b594-b61536e9cc61",
//             "type": "queryTable",
//             "headers": [
//               {
//                 "id": "62caad04-b7b1-4590-ae9e-e602da8b1cc1",
//                 "type": "text",
//                 "text": {
//                   "_base": "en",
//                   "en": "Name"
//                 },
//                 "style": "div"
//               },
//               {
//                 "id": "034cdbf1-5855-40a6-b234-36074a68e230",
//                 "type": "text",
//                 "text": {
//                   "_base": "en",
//                   "en": "Description"
//                 },
//                 "style": "div"
//               }
//             ],
//             "contents": [
//               {
//                 "id": "b3fabc30-668e-4b93-96f8-b4f85cbcc2b3",
//                 "type": "expression",
//                 "expr": {
//                   "type": "field",
//                   "table": "entities.water_point",
//                   "column": "name"
//                 },
//                 "contextVarId": "f3684226-7e0e-4165-b594-b61536e9cc61_row"
//               },
//               {
//                 "id": "b3fabc30-668e-4b93-96f8-b4f85cbcc2b4",
//                 "type": "expression",
//                 "expr": {
//                   "type": "field",
//                   "table": "entities.water_point",
//                   "column": "desc"
//                 },
//                 "contextVarId": "f3684226-7e0e-4165-b594-b61536e9cc61_row"
//               }
//             ],
//             "limit": 10,
//             "rowset": "45c4cb2a-7bf5-4f33-b6dc-00d2053357de",
//             "mode": "singleRow",
//             "rowClickAction": {
//               "type": "openPage",
//               "pageType": "modal",
//               "widgetId": "1235",
//               "contextVarValues": {
//                 "92e0f7e7-f6f9-4226-992c-8c3297b87fc5": {
//                   "type": "ref",
//                   "contextVarId": "f3684226-7e0e-4165-b594-b61536e9cc61_row"
//                 }
//               }
//             },
//             "rowsetId": "45c4cb2a-7bf5-4f33-b6dc-00d2053357de",
//             "rowsetContextVarId": "45c4cb2a-7bf5-4f33-b6dc-00d2053357de"
//           }
//         ],
//         "type": "vertical"
//       },
//       "contextVars": [
//         {
//           "id": "45c4cb2a-7bf5-4f33-b6dc-00d2053357de",
//           "name": "Water Points Rowset",
//           "type": "rowset",
//           "table": "entities.water_point"
//         }
//       ],
//       "contextVarPreviewValues": {}
//     },
//     "1235": {
//       "id": "1235",
//       "name": "Water Point",
//       "description": "Test",
//       "blockDef": {
//         "id": "b98a2bf8-9fdf-4729-bdf3-d301228d4aca",
//         "items": [
//           {
//             "id": "fc2269a6-c74c-4005-b06d-2f9cddd0815e",
//             "type": "text",
//             "text": {
//               "_base": "en",
//               "en": "Water Point"
//             },
//             "style": "h1"
//           },
//           {
//             "id": "a799f9a2-83ee-40ca-bcfc-377102d071d3",
//             "type": "labeled",
//             "label": {
//               "_base": "en",
//               "en": "Name"
//             },
//             "child": {
//               "id": "a2d37584-3edd-4211-a719-6f647418521c",
//               "type": "textbox",
//               "rowContextVarId": "92e0f7e7-f6f9-4226-992c-8c3297b87fc5",
//               "column": "name",
//               "required": true
//             }
//           },
//           {
//             "id": "89406e06-0c1f-4a7c-9c81-ff7bf99f61d6",
//             "type": "labeled",
//             "label": {
//               "_base": "en",
//               "en": "Description"
//             },
//             "child": {
//               "id": "bb710b74-67f5-4508-83fa-d82709e6a925",
//               "type": "textbox",
//               "rowContextVarId": "92e0f7e7-f6f9-4226-992c-8c3297b87fc5",
//               "column": "desc",
//               "placeholder": {
//                 "_base": "en",
//                 "en": "test"
//               }
//             }
//           }
//         ],
//         "type": "vertical"
//       },
//       "contextVars": [
//         {
//           "id": "92e0f7e7-f6f9-4226-992c-8c3297b87fc5",
//           "name": "Water Points Row",
//           "type": "row",
//           "table": "entities.water_point"
//         }
//       ],
//       "contextVarPreviewValues": {
//         "92e0f7e7-f6f9-4226-992c-8c3297b87fc5": "100050c6-3d2b-492f-abb3-f583f37eff77"
//       }
//     }
//   }
// }

const defaultWidgetLibrary : WidgetLibrary = {
  widgets: {}
}

const initialWidgetLibrary: WidgetLibrary = JSON.parse(window.localStorage.getItem("widgetLibrary") || "null") || defaultWidgetLibrary

// const schema = new Schema({
//   tables: [
//     { 
//       id: "entities.water_point",
//       name: { _base: "en", en: "Water Points" },
//       primaryKey: "_id",
//       contents: [
//         { id: "name", type: "text", name: { _base: "en", en: "Name" } },
//         { id: "desc", type: "text", name: { _base: "en", en: "Description" } }
//       ]
//     }
//   ]
// })

const dataSource = new MWaterDataSource("https://api.mwater.co/v3/", null, { localCaching: false, serverCaching: false })

const actionLibrary = new ActionLibrary()

@DragDropContext(HTML5Backend)
export default class Demo extends React.Component<{}, { widgetLibrary: WidgetLibrary, schema?: Schema, openTabs: string[] }> {
  constructor(props: object) {
    super(props)

    this.state = {
      widgetLibrary: initialWidgetLibrary,
      openTabs: _.intersection(JSON.parse(window.localStorage.getItem("openTabs") || "null") || [], _.keys(initialWidgetLibrary.widgets))
    }
  }

  componentDidMount() {
    fetch("https://api.mwater.co/v3/jsonql/schema").then(req => req.json()).then(json => {
      this.setState({ schema: new Schema(json) })
    })
  }

  handleWidgetLibraryChange = (widgetLibrary: WidgetLibrary) => {
    this.setState({ widgetLibrary })
    console.log(JSON.stringify(widgetLibrary, null, 2))
    window.localStorage.setItem("widgetLibrary", JSON.stringify(widgetLibrary))
  }

  handleOpenTabsChange = (openTabs: string[]) => {
    this.setState({ openTabs: openTabs })
    window.localStorage.setItem("openTabs", JSON.stringify(openTabs))
  }
  
  render() {
    if (!this.state.schema) {
      return <div>Loading...</div>
    }

    return (
      <div style={{ padding: 5, height: "100%" }}>
        <WidgetLibraryDesigner
          openTabs={this.state.openTabs}
          onOpenTabsChange={this.handleOpenTabsChange}
          widgetLibrary={this.state.widgetLibrary} 
          blockFactory={basicBlockFactory} 
          actionLibrary={actionLibrary}
          schema={this.state.schema}
          dataSource={dataSource}
          onWidgetLibraryChange={this.handleWidgetLibraryChange} />
      </div>
    )
  }
}
