import * as React from "react";
import BlockPaletteItem from "./BlockPaletteItem";
export default class BlockPalette extends React.Component {
    render() {
        return (React.createElement("div", { className: "widget-designer-palette" }, this.props.entries.map((entry, index) => React.createElement(BlockPaletteItem, { key: index, entry: entry, createBlock: this.props.createBlock, schema: this.props.schema, dataSource: this.props.dataSource }))));
    }
}
//# sourceMappingURL=BlockPalette.js.map