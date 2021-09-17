"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
const BlockFactory_1 = __importDefault(require("./widgets/BlockFactory"));
const mwater_expressions_1 = require("mwater-expressions");
const widgetLibrary_1 = require("./designer/widgetLibrary");
const MWaterDataSource_1 = __importDefault(require("mwater-expressions/lib/MWaterDataSource"));
const ActionLibrary_1 = require("./widgets/ActionLibrary");
const lodash_1 = __importDefault(require("lodash"));
const ez_localize_1 = require("ez-localize");
// import 'bootstrap/dist/css/bootstrap.css'
// import 'font-awesome/css/font-awesome.css'
require("./Demo.css");
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
const urlParams = new URLSearchParams(window.location.search);
const client = urlParams.get('client');
const extraTables = lodash_1.default.compact((urlParams.get('extraTables') || "").split(","));
const dataSource = new MWaterDataSource_1.default("https://api.mwater.co/v3/", client, { localCaching: false, serverCaching: false });
const actionLibrary = new ActionLibrary_1.ActionLibrary();
class MockTransaction {
    addRow(table, values) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`add(${table}, ${JSON.stringify(values)})`);
            return "1";
        });
    }
    updateRow(table, primaryKey, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`update(${table}, ${primaryKey}, ${JSON.stringify(updates)})`);
        });
    }
    removeRow(table, primaryKey) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`remove(${table}, ${primaryKey})`);
        });
    }
    commit() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("commit()");
            alert("Note: updated ignored");
            return [];
        });
    }
}
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
            openTabs: lodash_1.default.intersection(JSON.parse(window.localStorage.getItem("openTabs") || "null") || [], lodash_1.default.keys(initialWidgetLibrary.widgets))
        };
    }
    componentDidMount() {
        fetch("https://api.mwater.co/v3/schema?client=" + (client || "") + "&extraTables=" + extraTables.join(",")).then(req => req.json()).then(json => {
            const schema = new mwater_expressions_1.Schema(json);
            const database = new DataSourceDatabase_1.DataSourceDatabase(schema, dataSource, () => new MockTransaction());
            this.setState({ schema, database });
        });
    }
    render() {
        if (!this.state.schema || !this.state.database) {
            return React.createElement("div", null, "Loading...");
        }
        const baseCtx = {
            widgetLibrary: this.state.widgetLibrary,
            createBlock: basicBlockFactory.createBlock,
            actionLibrary: actionLibrary,
            database: this.state.database,
            schema: this.state.schema,
            dataSource: dataSource,
            locale: "en",
            locales: [{ code: "en", name: "English" }, { code: "es", name: "Spanish" }],
            globalContextVars: [
                { type: "id", idTable: "users", id: "user", name: "User" },
                { type: "enum", id: "setting", name: "Setting", enumValues: [
                        { id: "a", name: { _base: "en", en: "A" } },
                        { id: "b", name: { _base: "en", en: "B" } },
                    ] }
            ],
            T: ez_localize_1.defaultT
        };
        return (React.createElement("div", { style: { padding: 5, height: "100vh" } },
            React.createElement(widgetLibrary_1.WidgetLibraryDesigner, { baseCtx: baseCtx, dataSource: dataSource, openTabs: this.state.openTabs, onOpenTabsChange: this.handleOpenTabsChange, onWidgetLibraryChange: this.handleWidgetLibraryChange, blockPaletteEntries: blockPaletteEntries_1.defaultBlockPaletteEntries })));
    }
};
Demo = __decorate([
    (0, react_dnd_1.DragDropContext)(react_dnd_html5_backend_1.default)
], Demo);
ReactDOM.render(React.createElement(Demo, null), document.getElementById('main'));
