import React from "react";
import { localize } from "../../localization";
export default class TabbedInstance extends React.Component {
    constructor(props) {
        super(props);
        this.handleSelectTab = (index) => {
            this.setState({ activeIndex: index });
        };
        this.state = {
            activeIndex: 0
        };
    }
    renderTab(tab, index) {
        const labelText = localize(tab.label, this.props.renderInstanceProps.locale);
        return (React.createElement("li", { className: (this.state.activeIndex === index) ? "active" : "", key: index },
            React.createElement("a", { onClick: this.handleSelectTab.bind(null, index) }, labelText)));
    }
    renderTabContent(tab, index) {
        const content = this.props.renderInstanceProps.renderChildBlock(this.props.renderInstanceProps, tab.content);
        return (React.createElement("div", { key: index, style: { display: (this.state.activeIndex === index) ? "block" : "none" } }, content));
    }
    render() {
        // Render tabs
        return (React.createElement("div", { style: { paddingTop: 5, paddingBottom: 5 } },
            React.createElement("ul", { className: "nav nav-tabs", style: { marginBottom: 5 } }, this.props.tabbedBlockDef.tabs.map((tab, index) => this.renderTab(tab, index))),
            this.props.tabbedBlockDef.tabs.map((tab, index) => this.renderTabContent(tab, index))));
    }
}
//# sourceMappingURL=TabbedInstance.js.map