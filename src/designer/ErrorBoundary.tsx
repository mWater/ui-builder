import * as React from "react"

/** Makes a react error boundary that shows the error rather than crashing the app */
export default class ErrorBoundary extends React.Component<{}, { error?: Error, errorInfo?: React.ErrorInfo}> {
  constructor(props: {}) {
    super(props)

    this.state = {}
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo })
  }

  render() {
    if (this.state.error)  {
      return (
        <div className="alert alert-danger">
          Error: {this.state.error.message}
          <br/>
          <pre>{this.state.errorInfo!.componentStack}</pre>
        </div>
      )
    }

    return this.props.children
  }
}