import * as React from "react";
import BlockPaletteItem from "./BlockPaletteItem";
export default class BlockPalette extends React.Component {
    constructor(props) {
        super(props);
        this.handleSearchChange = (ev) => {
            this.setState({ searchText: ev.target.value });
        };
        this.state = {
            searchText: ""
        };
    }
    render() {
        const filteredItems = this.props.entries.filter(entry => {
            if (!this.state.searchText) {
                return true;
            }
            return entry.title.toLowerCase().includes(this.state.searchText.toLowerCase());
        });
        return (React.createElement("div", { className: "widget-designer-palette" },
            React.createElement("input", { type: "text", className: "form-control input-sm", placeholder: "Search...", value: this.state.searchText, onChange: this.handleSearchChange }),
            filteredItems.map((entry, index) => React.createElement(BlockPaletteItem, { key: index, entry: entry, createBlock: this.props.createBlock, schema: this.props.schema, dataSource: this.props.dataSource }))));
    }
}
//# sourceMappingURL=BlockPalette.js.map