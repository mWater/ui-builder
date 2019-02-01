"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = __importStar(require("react"));
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
            return (React.createElement("div", { className: "alert alert-danger" },
                "Error: ",
                this.state.error.message,
                React.createElement("br", null),
                React.createElement("pre", null, this.state.errorInfo.componentStack)));
        }
        return this.props.children;
    };
    return ErrorBoundary;
}(React.Component));
exports.default = ErrorBoundary;
//# sourceMappingURL=ErrorBoundary.js.map