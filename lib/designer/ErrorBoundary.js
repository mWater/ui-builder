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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
/** Makes a react error boundary that shows the error rather than crashing the app */
var ErrorBoundary = /** @class */ (function (_super) {
    __extends(ErrorBoundary, _super);
    function ErrorBoundary(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {};
        return _this;
    }
    ErrorBoundary.prototype.componentDidCatch = function (error, errorInfo) {
        this.setState({ error: error, errorInfo: errorInfo });
    };
    ErrorBoundary.prototype.render = function () {
        if (this.state.error) {
            return (react_1.default.createElement("div", { className: "alert alert-danger" },
                "Error: ",
                this.state.error.message,
                react_1.default.createElement("br", null),
                react_1.default.createElement("pre", null, this.state.errorInfo.componentStack)));
        }
        return this.props.children;
    };
    return ErrorBoundary;
}(react_1.default.Component));
exports.default = ErrorBoundary;
