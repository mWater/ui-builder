import * as React from 'react';
import BlockFactory from './widgets/BlockFactory';
import { Schema } from 'mwater-expressions';
import { WidgetLibraryDesigner, WidgetLibrary } from './designer/widgetLibrary';
import MWaterDataSource from 'mwater-expressions/lib/MWaterDataSource'
import { ActionLibrary } from './widgets/ActionLibrary';
import * as _ from 'lodash';

import './Demo.css'
import * as ReactDOM from 'react-dom';
import { defaultBlockPaletteEntries } from './designer/blockPaletteEntries';

import { DragDropContext } from "react-dnd";
import HTML5Backend from 'react-dnd-html5-backend'
import { Database } from './database/Database';
import { DataSourceDatabase } from './database/DataSourceDatabase';
import { BaseCtx } from './contexts';

const basicBlockFactory = new BlockFactory()

const defaultWidgetLibrary : WidgetLibrary = {
  widgets: {}
}

const initialWidgetLibrary: WidgetLibrary = JSON.parse(window.localStorage.getItem("widgetLibrary") || "null") || defaultWidgetLibrary

const dataSource = new MWaterDataSource("https://api.mwater.co/v3/", null, { localCaching: false, serverCaching: false })

const actionLibrary = new ActionLibrary()

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
    fetch("https://api.mwater.co/v3/schema").then(req => req.json()).then(json => {
      const schema = new Schema(json)
      const database = new DataSourceDatabase(schema, dataSource)
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
      locale: "en"
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
