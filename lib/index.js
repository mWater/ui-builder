var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import * as React from 'react';
import BlockFactory from './widgets/BlockFactory';
import { Schema } from 'mwater-expressions';
import WidgetLibraryDesigner from './designer/widgetLibrary';
import MWaterDataSource from 'mwater-expressions/lib/MWaterDataSource';
import { ActionLibrary } from './widgets/ActionLibrary';
import * as _ from 'lodash';
import './Demo.css';
import 'font-awesome/css/font-awesome.css';
import * as ReactDOM from 'react-dom';
import { defaultBlockPaletteEntries } from './designer/blockPaletteEntries';
import { DragDropContext } from "react-dnd";
import HTML5Backend from 'react-dnd-html5-backend';
import { DataSourceDatabase } from './database/DataSourceDatabase';
const basicBlockFactory = new BlockFactory();
const defaultWidgetLibrary = {
    widgets: {}
};
const initialWidgetLibrary = JSON.parse(window.localStorage.getItem("widgetLibrary") || "null") || defaultWidgetLibrary;
const dataSource = new MWaterDataSource("https://api.mwater.co/v3/", null, { localCaching: false, serverCaching: false });
const actionLibrary = new ActionLibrary();
let Demo = class Demo extends React.Component {
    constructor(props) {
        super(props);
        this.handleWidgetLibraryChange = (widgetLibrary) => {
            this.setState({ widgetLibrary });
            // console.log(JSON.stringify(widgetLibrary, null, 2))
            window.localStorage.setItem("widgetLibrary", JSON.stringify(widgetLibrary));
        };
        this.handleOpenTabsChange = (openTabs) => {
            this.setState({ openTabs: openTabs });
            window.localStorage.setItem("openTabs", JSON.stringify(openTabs));
        };
        this.state = {
            widgetLibrary: initialWidgetLibrary,
            openTabs: _.intersection(JSON.parse(window.localStorage.getItem("openTabs") || "null") || [], _.keys(initialWidgetLibrary.widgets))
        };
    }
    componentDidMount() {
        fetch("https://api.mwater.co/v3/schema").then(req => req.json()).then(json => {
            const schema = new Schema(json);
            const database = new DataSourceDatabase(schema, dataSource);
            this.setState({ schema, database });
        });
    }
    render() {
        if (!this.state.schema || !this.state.database) {
            return React.createElement("div", null, "Loading...");
        }
        return (React.createElement("div", { style: { padding: 5, height: "100%" } },
            React.createElement(WidgetLibraryDesigner, { openTabs: this.state.openTabs, onOpenTabsChange: this.handleOpenTabsChange, widgetLibrary: this.state.widgetLibrary, blockFactory: basicBlockFactory, actionLibrary: actionLibrary, database: this.state.database, schema: this.state.schema, dataSource: dataSource, onWidgetLibraryChange: this.handleWidgetLibraryChange, blockPaletteEntries: defaultBlockPaletteEntries })));
    }
};
Demo = __decorate([
    DragDropContext(HTML5Backend)
], Demo);
ReactDOM.render(React.createElement(Demo, null), document.getElementById('root'));
//# sourceMappingURL=index.js.map