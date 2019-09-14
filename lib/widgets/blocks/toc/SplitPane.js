"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var FillDownwardComponent_1 = __importDefault(require("react-library/lib/FillDownwardComponent"));
/** Pane that is split left right */
var SplitPane = function (_a) {
    var left = _a.left, right = _a.right;
    return react_1.default.createElement(FillDownwardComponent_1.default, null,
        react_1.default.createElement("div", { style: { height: "100%", position: "relative" } },
            react_1.default.createElement("div", { style: { height: "100%", width: "25%", float: "left" } }, left),
            react_1.default.createElement("div", { style: { height: "100%", width: "75%", float: "left", borderLeft: "solid 1px #DDD" } }, right)));
};
exports.default = SplitPane;
