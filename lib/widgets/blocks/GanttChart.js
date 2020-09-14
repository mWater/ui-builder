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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GanttChartBlock = void 0;
var React = __importStar(require("react"));
var LeafBlock_1 = __importDefault(require("../LeafBlock"));
var GanttChart_1 = require("react-library/lib/GanttChart");
var GanttChartBlock = /** @class */ (function (_super) {
    __extends(GanttChartBlock, _super);
    function GanttChartBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GanttChartBlock.prototype.validate = function () { return null; };
    GanttChartBlock.prototype.renderDesign = function (props) {
        return React.createElement(GanttChart_1.GanttChart, { rows: [
                { color: "#68cdee", level: 0, startDate: "2020-01-14", endDate: "2020-05-23", label: "Activity 1" },
                { color: "#68cdee", level: 1, startDate: "2020-02-14", endDate: "2020-06-23", label: "Activity 2" },
                { color: "#68cdee", level: 2, startDate: "2020-04-12", endDate: null, label: "Activity 3" },
                { color: "#68cdee", level: 0, startDate: "2020-01-14", endDate: "2020-05-23", label: "Activity 1" },
                { color: "#68cdee", level: 1, startDate: "2020-02-14", endDate: "2020-06-23", label: "Activity 2" },
                { color: "#68cdee", level: 1, startDate: "2020-04-12", endDate: "2020-07-23", label: "Activity 3" }
            ], startDate: "2020-01-01", endDate: "2022-10-01", T: props.T, onMoveRowDown: function () { }, onMoveRowUp: function () { }, onMoveRowLeft: function () { }, onMoveRowRight: function () { }, onRowClick: function () { alert("sdfasdf"); }, onAddRow: function () { alert("sdfasdf"); }, onInsertRowAbove: function () { }, onInsertRowBelow: function () { } });
    };
    GanttChartBlock.prototype.renderInstance = function (instanceCtx) {
        return React.createElement("div", null);
    };
    GanttChartBlock.prototype.renderEditor = function (props) {
        return React.createElement("div", null);
    };
    return GanttChartBlock;
}(LeafBlock_1.default));
exports.GanttChartBlock = GanttChartBlock;
