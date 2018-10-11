import * as React from "react";
/** Makes a react error boundary that shows the error rather than crashing the app */
export default class ErrorBoundary extends React.Component {
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
//# sourceMappingURL=ErrorBoundary.js.map