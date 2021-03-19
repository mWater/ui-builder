import * as React from 'react';
import BlockFactory from './widgets/BlockFactory';
import { Schema } from 'mwater-expressions';
import { WidgetLibraryDesigner, WidgetLibrary } from './designer/widgetLibrary';
import MWaterDataSource from 'mwater-expressions/lib/MWaterDataSource'
import { ActionLibrary } from './widgets/ActionLibrary';
import _ from 'lodash'
import { defaultT } from 'ez-localize'

// import 'bootstrap/dist/css/bootstrap.css'
// import 'font-awesome/css/font-awesome.css'
import './Demo.css'
import * as ReactDOM from 'react-dom';
import { defaultBlockPaletteEntries } from './designer/blockPaletteEntries';

import { DragDropContext } from "react-dnd";
import HTML5Backend from 'react-dnd-html5-backend'
import { Database, Transaction } from './database/Database';
import { DataSourceDatabase } from './database/DataSourceDatabase';
import { BaseCtx } from './contexts';

const basicBlockFactory = new BlockFactory()

const defaultWidgetLibrary : WidgetLibrary = {
  widgets: {}
}

const initialWidgetLibrary: WidgetLibrary = JSON.parse(window.localStorage.getItem("widgetLibrary") || "null") || defaultWidgetLibrary

const urlParams = new URLSearchParams(window.location.search);
const client = urlParams.get('client')
const extraTables = _.compact((urlParams.get('extraTables') || "").split(","))

const dataSource = new MWaterDataSource("https://api.mwater.co/v3/", client, { localCaching: false, serverCaching: false })

const actionLibrary = new ActionLibrary()

class MockTransaction implements Transaction {
  async addRow(table: string, values: { [column: string]: any; }): Promise<any> {
    console.log(`add(${table}, ${JSON.stringify(values)})`)
    return "1"
  }
  async updateRow(table: string, primaryKey: any, updates: { [column: string]: any; }): Promise<void> {
    console.log(`update(${table}, ${primaryKey}, ${JSON.stringify(updates)})`)
  }
  async removeRow(table: string, primaryKey: any): Promise<void> {
    console.log(`remove(${table}, ${primaryKey})`)
  }
  async commit(): Promise<void> {
    console.log("commit()")
    alert("Note: updated ignored")
  }
}

@DragDropContext(HTML5Backend)
class Demo extends React.Component<{}, { widgetLibrary: WidgetLibrary, schema?: Schema, openTabs: string[], database?: Database }> {
  constructor(props: object) {
    super(props)

    this.state = {
      widgetLibrary: initialWidgetLibrary,
      openTabs: _.intersection(JSON.parse(window.localStorage.getItem("openTabs") || "null") || [], _.keys(initialWidgetLibrary.widgets))
    }
  }

  componentDidMount() {
    fetch("https://api.mwater.co/v3/schema?client=" + (client || "") + "&extraTables=" + extraTables.join(",")).then(req => req.json()).then(json => {
      const schema = new Schema(json)
      const database = new DataSourceDatabase(schema, dataSource, () => new MockTransaction())
      this.setState({ schema, database })
    })
  }

  handleWidgetLibraryChange = (widgetLibrary: WidgetLibrary) => {
    this.setState({ widgetLibrary })
    // console.log(JSON.stringify(widgetLibrary, null, 2))
    window.localStorage.setItem("widgetLibrary", JSON.stringify(widgetLibrary))
  }

  handleOpenTabsChange = (openTabs: string[]) => {
    this.setState({ openTabs: openTabs })
    window.localStorage.setItem("openTabs", JSON.stringify(openTabs))
  }
  
  render() {
    if (!this.state.schema || !this.state.database) {
      return <div>Loading...</div>
    }

    const baseCtx: BaseCtx = {
      widgetLibrary: this.state.widgetLibrary,
      createBlock: basicBlockFactory.createBlock,
      actionLibrary: actionLibrary,
      database: this.state.database,
      schema: this.state.schema,
      dataSource: dataSource,
      locale: "en",
      globalContextVars: [
        { type: "id", idTable: "users", id: "user", name: "User" },
        { type: "enum", id: "setting", name: "Setting", enumValues: [
          { id: "a", name: { _base: "en", en: "A" }},
          { id: "b", name: { _base: "en", en: "B" }},
        ] }
      ],
      T: defaultT
    }

    return (
      <div style={{ padding: 5, height: "100vh" }}>
        <WidgetLibraryDesigner
          baseCtx={baseCtx}
          dataSource={dataSource}
          openTabs={this.state.openTabs}
          onOpenTabsChange={this.handleOpenTabsChange}
          onWidgetLibraryChange={this.handleWidgetLibraryChange} 
          blockPaletteEntries={defaultBlockPaletteEntries}
          />
      </div>
    )
  }
}

ReactDOM.render(
  <Demo />,
  document.getElementById('main') as HTMLElement
);
