"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var FillDownwardComponent_1 = __importDefault(require("react-library/lib/FillDownwardComponent"));
/** Pane that is split left right */
var SplitPane = function (_a) {
    var left = _a.left, right = _a.right, removePadding = _a.removePadding, theme = _a.theme;
    var className = removePadding ? "toc-split remove-padding " + theme : "toc-split " + theme;
    return react_1.default.createElement(FillDownwardComponent_1.default, null,
        react_1.default.createElement("div", { className: className },
            react_1.default.createElement("div", { className: "toc-split-left" }, left),
            react_1.default.createElement("div", { className: "toc-split-right" }, right)));
};
exports.default = SplitPane;
