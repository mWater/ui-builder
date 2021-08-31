import React from "react";
/** Makes a react error boundary that shows the error rather than crashing the app */
export default class ErrorBoundary extends React.Component<{}, {
    error?: Error;
    errorInfo?: React.ErrorInfo;
}> {
    constructor(props: {});
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void;
    render(): React.ReactNode;
}
