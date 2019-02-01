"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
/** Makes a react error boundary that shows the error rather than crashing the app */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
    }
    render() {
        if (this.state.error) {
            return (React.createElement("div", { className: "alert alert-danger" },
                "Error: ",
                this.state.error.message,
                React.createElement("br", null),
                React.createElement("pre", null, this.state.errorInfo.componentStack)));
        }
        return this.props.children;
    }
}
exports.default = ErrorBoundary;
//# sourceMappingURL=ErrorBoundary.js.map