import React from "react";
import produce from "immer";
import { localize } from "../../localization";
export default class TabbedDesigner extends React.Component {
    constructor(props) {
        super(props);
        /** Handle adding a block to a tab */
        this.handleAddContent = (tabIndex, addedBlockDef) => {
            this.props.renderDesignProps.store.alterBlock(this.props.tabbedBlockDef.id, produce((b) => {
                b.tabs[tabIndex].content = addedBlockDef;
                return b;
            }), addedBlockDef.id);
        };
        this.handleSelectTab = (index) => {
            this.setState({ activeIndex: index });
        };
        this.state = {
            activeIndex: 0
        };
    }
    renderTab(tab, index) {
        const labelText = localize(tab.label, this.props.renderDesignProps.locale);
        return (React.createElement("li", { className: (this.state.activeIndex === index) ? "active" : "", key: index },
            React.createElement("a", { onClick: this.handleSelectTab.bind(null, index) }, labelText)));
    }
    render() {
        const activeTab = this.props.tabbedBlockDef.tabs[this.state.activeIndex];
        const activeTabContent = activeTab ?
            this.props.renderDesignProps.renderChildBlock(this.props.renderDesignProps, activeTab.content, this.handleAddContent.bind(null, this.state.activeIndex))
            : null;
        // Render tabs
        return (React.createElement("div", { style: { paddingTop: 5, paddingBottom: 5 } },
            React.createElement("ul", { className: "nav nav-tabs", style: { marginBottom: 5 } }, this.props.tabbedBlockDef.tabs.map((tab, index) => this.renderTab(tab, index))),
            activeTabContent));
    }
}
//# sourceMappingURL=TabbedDesigner.js.map