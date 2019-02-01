"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
const BlockFactory_1 = __importDefault(require("./widgets/BlockFactory"));
const mwater_expressions_1 = require("mwater-expressions");
const widgetLibrary_1 = __importDefault(require("./designer/widgetLibrary"));
const MWaterDataSource_1 = __importDefault(require("mwater-expressions/lib/MWaterDataSource"));
const ActionLibrary_1 = require("./widgets/ActionLibrary");
const _ = __importStar(require("lodash"));
require("./Demo.css");
require("font-awesome/css/font-awesome.css");
const ReactDOM = __importStar(require("react-dom"));
const blockPaletteEntries_1 = require("./designer/blockPaletteEntries");
const react_dnd_1 = require("react-dnd");
const react_dnd_html5_backend_1 = __importDefault(require("react-dnd-html5-backend"));
const DataSourceDatabase_1 = require("./database/DataSourceDatabase");
const basicBlockFactory = new BlockFactory_1.default();
const defaultWidgetLibrary = {
    widgets: {}
};
const initialWidgetLibrary = JSON.parse(window.localStorage.getItem("widgetLibrary") || "null") || defaultWidgetLibrary;
const dataSource = new MWaterDataSource_1.default("https://api.mwater.co/v3/", null, { localCaching: false, serverCaching: false });
const actionLibrary = new ActionLibrary_1.ActionLibrary();
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
            const schema = new mwater_expressions_1.Schema(json);
            const database = new DataSourceDatabase_1.DataSourceDatabase(schema, dataSource);
            this.setState({ schema, database });
        });
    }
    render() {
        if (!this.state.schema || !this.state.database) {
            return React.createElement("div", null, "Loading...");
        }
        return (React.createElement("div", { style: { padding: 5, height: "100%" } },
            React.createElement(widgetLibrary_1.default, { openTabs: this.state.openTabs, onOpenTabsChange: this.handleOpenTabsChange, widgetLibrary: this.state.widgetLibrary, blockFactory: basicBlockFactory, actionLibrary: actionLibrary, database: this.state.database, schema: this.state.schema, dataSource: dataSource, onWidgetLibraryChange: this.handleWidgetLibraryChange, blockPaletteEntries: blockPaletteEntries_1.defaultBlockPaletteEntries })));
    }
};
Demo = __decorate([
    react_dnd_1.DragDropContext(react_dnd_html5_backend_1.default)
], Demo);
ReactDOM.render(React.createElement(Demo, null), document.getElementById('root'));
//# sourceMappingURL=index.js.map