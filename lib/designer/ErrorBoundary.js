"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
/** Makes a react error boundary that shows the error rather than crashing the app */
class ErrorBoundary extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
    }
    render() {
        if (this.state.error) {
            return (react_1.default.createElement("div", { className: "alert alert-danger" },
                "Error: ",
                this.state.error.message,
                react_1.default.createElement("br", null),
                react_1.default.createElement("pre", null, this.state.errorInfo.componentStack)));
        }
        return this.props.children;
    }
}
exports.default = ErrorBoundary;
