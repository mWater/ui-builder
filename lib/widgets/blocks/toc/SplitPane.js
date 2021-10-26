"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const FillDownwardComponent_1 = __importDefault(require("react-library/lib/FillDownwardComponent"));
/** Pane that is split left right */
const SplitPane = ({ left, right, theme }) => {
    return (react_1.default.createElement(FillDownwardComponent_1.default, null,
        react_1.default.createElement("div", { className: `toc-split ${theme}` },
            react_1.default.createElement("div", { key: "left", className: "toc-split-left" }, left),
            react_1.default.createElement("div", { key: "right", className: "toc-split-right" }, right))));
};
exports.default = SplitPane;
