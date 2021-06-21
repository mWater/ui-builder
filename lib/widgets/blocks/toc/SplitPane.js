"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const FillDownwardComponent_1 = __importDefault(require("react-library/lib/FillDownwardComponent"));
/** Pane that is split left right */
const SplitPane = ({ left, right, removePadding, theme }) => {
    const className = removePadding ? `toc-split remove-padding ${theme}` : `toc-split ${theme}`;
    return react_1.default.createElement(FillDownwardComponent_1.default, null,
        react_1.default.createElement("div", { className: className },
            react_1.default.createElement("div", { key: "left", className: "toc-split-left" }, left),
            react_1.default.createElement("div", { key: "right", className: "toc-split-right" }, right)));
};
exports.default = SplitPane;
