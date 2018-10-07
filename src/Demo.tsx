import * as React from 'react';
import HTML5Backend from 'react-dnd-html5-backend'
import { DragDropContext } from 'react-dnd'
import BlockFactory from './widgets/BlockFactory';
import { Schema } from 'mwater-expressions';
import WidgetLibraryDesigner, { WidgetLibrary } from './designer/widgetLibrary';
import MWaterDataSource from 'mwater-expressions/lib/MWaterDataSource'
import { ActionLibrary } from './widgets/ActionLibrary';
import * as _ from 'lodash';

import 'font-awesome/css/font-awesome.css'
import * as ReactDOM from 'react-dom';

const basicBlockFactory = new BlockFactory()

const defaultWidgetLibrary : WidgetLibrary = {
  widgets: {}
}

const initialWidgetLibrary: WidgetLibrary = JSON.parse(window.localStorage.getItem("widgetLibrary") || "null") || defaultWidgetLibrary

const dataSource = new MWaterDataSource("https://api.mwater.co/v3/", null, { localCaching: false, serverCaching: false })

const actionLibrary = new ActionLibrary()

@DragDropContext(HTML5Backend)
class Demo extends React.Component<{}, { widgetLibrary: WidgetLibrary, schema?: Schema, openTabs: string[] }> {
  constructor(props: object) {
    super(props)

    this.state = {
      widgetLibrary: initialWidgetLibrary,
      openTabs: _.intersection(JSON.parse(window.localStorage.getItem("openTabs") || "null") || [], _.keys(initialWidgetLibrary.widgets))
    }
  }

  componentDidMount() {
    fetch("https://api.mwater.co/v3/schema").then(req => req.json()).then(json => {
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

ReactDOM.render(
  <Demo />,
  document.getElementById('root') as HTMLElement
);
