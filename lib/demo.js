"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = __importStar(require("react"));
var BlockFactory_1 = __importDefault(require("./widgets/BlockFactory"));
var mwater_expressions_1 = require("mwater-expressions");
var widgetLibrary_1 = require("./designer/widgetLibrary");
var MWaterDataSource_1 = __importDefault(require("mwater-expressions/lib/MWaterDataSource"));
var ActionLibrary_1 = require("./widgets/ActionLibrary");
var lodash_1 = __importDefault(require("lodash"));
var ez_localize_1 = require("ez-localize");
// import 'bootstrap/dist/css/bootstrap.css'
require("font-awesome/css/font-awesome.css");
require("./Demo.css");
var ReactDOM = __importStar(require("react-dom"));
var blockPaletteEntries_1 = require("./designer/blockPaletteEntries");
var react_dnd_1 = require("react-dnd");
var react_dnd_html5_backend_1 = __importDefault(require("react-dnd-html5-backend"));
var DataSourceDatabase_1 = require("./database/DataSourceDatabase");
var basicBlockFactory = new BlockFactory_1.default();
var defaultWidgetLibrary = {
    widgets: {}
};
var initialWidgetLibrary = JSON.parse(window.localStorage.getItem("widgetLibrary") || "null") || defaultWidgetLibrary;
var urlParams = new URLSearchParams(window.location.search);
var client = urlParams.get('client');
var extraTables = lodash_1.default.compact((urlParams.get('extraTables') || "").split(","));
var dataSource = new MWaterDataSource_1.default("https://api.mwater.co/v3/", client, { localCaching: false, serverCaching: false });
var actionLibrary = new ActionLibrary_1.ActionLibrary();
var MockTransaction = /** @class */ (function () {
    function MockTransaction() {
    }
    MockTransaction.prototype.addRow = function (table, values) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log("add(" + table + ", " + JSON.stringify(values) + ")");
                return [2 /*return*/, "1"];
            });
        });
    };
    MockTransaction.prototype.updateRow = function (table, primaryKey, updates) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log("update(" + table + ", " + primaryKey + ", " + JSON.stringify(updates) + ")");
                return [2 /*return*/];
            });
        });
    };
    MockTransaction.prototype.removeRow = function (table, primaryKey) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log("remove(" + table + ", " + primaryKey + ")");
                return [2 /*return*/];
            });
        });
    };
    MockTransaction.prototype.commit = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log("commit()");
                alert("Note: updated ignored");
                return [2 /*return*/];
            });
        });
    };
    return MockTransaction;
}());
var Demo = /** @class */ (function (_super) {
    __extends(Demo, _super);
    function Demo(props) {
        var _this = _super.call(this, props) || this;
        _this.handleWidgetLibraryChange = function (widgetLibrary) {
            _this.setState({ widgetLibrary: widgetLibrary });
            // console.log(JSON.stringify(widgetLibrary, null, 2))
            window.localStorage.setItem("widgetLibrary", JSON.stringify(widgetLibrary));
        };
        _this.handleOpenTabsChange = function (openTabs) {
            _this.setState({ openTabs: openTabs });
            window.localStorage.setItem("openTabs", JSON.stringify(openTabs));
        };
        _this.state = {
            widgetLibrary: initialWidgetLibrary,
            openTabs: lodash_1.default.intersection(JSON.parse(window.localStorage.getItem("openTabs") || "null") || [], lodash_1.default.keys(initialWidgetLibrary.widgets))
        };
        return _this;
    }
    Demo.prototype.componentDidMount = function () {
        var _this = this;
        fetch("https://api.mwater.co/v3/schema?client=" + (client || "") + "&extraTables=" + extraTables.join(",")).then(function (req) { return req.json(); }).then(function (json) {
            var schema = new mwater_expressions_1.Schema(json);
            var database = new DataSourceDatabase_1.DataSourceDatabase(schema, dataSource, function () { return new MockTransaction(); });
            _this.setState({ schema: schema, database: database });
        });
    };
    Demo.prototype.render = function () {
        if (!this.state.schema || !this.state.database) {
            return React.createElement("div", null, "Loading...");
        }
        var baseCtx = {
            widgetLibrary: this.state.widgetLibrary,
            createBlock: basicBlockFactory.createBlock,
            actionLibrary: actionLibrary,
            database: this.state.database,
            schema: this.state.schema,
            dataSource: dataSource,
            locale: "en",
            globalContextVars: [
                { type: "id", table: "users", id: "user", name: "User" },
                { type: "enum", id: "setting", name: "Setting", enumValues: [
                        { id: "a", name: { _base: "en", en: "A" } },
                        { id: "b", name: { _base: "en", en: "B" } },
                    ] }
            ],
            T: ez_localize_1.defaultT
        };
        return (React.createElement("div", { style: { padding: 5, height: "100vh" } },
            React.createElement(widgetLibrary_1.WidgetLibraryDesigner, { baseCtx: baseCtx, dataSource: dataSource, openTabs: this.state.openTabs, onOpenTabsChange: this.handleOpenTabsChange, onWidgetLibraryChange: this.handleWidgetLibraryChange, blockPaletteEntries: blockPaletteEntries_1.defaultBlockPaletteEntries })));
    };
    Demo = __decorate([
        react_dnd_1.DragDropContext(react_dnd_html5_backend_1.default)
    ], Demo);
    return Demo;
}(React.Component));
ReactDOM.render(React.createElement(Demo, null), document.getElementById('main'));
