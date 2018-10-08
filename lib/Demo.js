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
const basicBlockFactory = new BlockFactory();
const defaultWidgetLibrary = {
    widgets: {}
};
const initialWidgetLibrary = JSON.parse(window.localStorage.getItem("widgetLibrary") || "null") || defaultWidgetLibrary;
const dataSource = new MWaterDataSource("https://api.mwater.co/v3/", null, { localCaching: false, serverCaching: false });
const actionLibrary = new ActionLibrary();
class Demo extends React.Component {
    constructor(props) {
        super(props);
        this.handleWidgetLibraryChange = (widgetLibrary) => {
            this.setState({ widgetLibrary });
            console.log(JSON.stringify(widgetLibrary, null, 2));
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
            this.setState({ schema: new Schema(json) });
        });
    }
    render() {
        if (!this.state.schema) {
            return React.createElement("div", null, "Loading...");
        }
        return (React.createElement("div", { style: { padding: 5, height: "100%" } },
            React.createElement(WidgetLibraryDesigner, { openTabs: this.state.openTabs, onOpenTabsChange: this.handleOpenTabsChange, widgetLibrary: this.state.widgetLibrary, blockFactory: basicBlockFactory, actionLibrary: actionLibrary, schema: this.state.schema, dataSource: dataSource, onWidgetLibraryChange: this.handleWidgetLibraryChange })));
    }
}
ReactDOM.render(React.createElement(Demo, null), document.getElementById('root'));
//# sourceMappingURL=Demo.js.map