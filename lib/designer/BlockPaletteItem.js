import * as React from "react";
import { DragSource } from "react-dnd";
import { v4 as uuid } from 'uuid';
import BlockPlaceholder from "../widgets/BlockPlaceholder";
const blockSourceSpec = {
    beginDrag(props) {
        // Create deep clone
        const block = props.createBlock(props.entry.blockDef);
        return {
            blockDef: block.process(props.createBlock, (b) => Object.assign({}, b, { id: uuid() }))
        };
    }
};
class BlockPaletteItem extends React.Component {
    renderContents() {
        if (this.props.entry.elem) {
            return this.props.entry.elem;
        }
        const block = this.props.createBlock(this.props.entry.blockDef);
        return block.renderDesign({
            selectedId: null,
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            locale: "en",
            widgetLibrary: { widgets: {} },
            contextVars: [],
            store: {
                alterBlock(blockId, action) { return; }
            },
            renderChildBlock: (props, childBlockDef) => {
                if (childBlockDef) {
                    const childBlock = this.props.createBlock(childBlockDef);
                    return childBlock.renderDesign(props);
                }
                else {
                    return React.createElement(BlockPlaceholder, null);
                }
            },
        });
    }
    render() {
        return (React.createElement("div", { style: { padding: 5, position: "relative", backgroundColor: "white", border: "solid 1px #AAA", margin: 5 } },
            React.createElement("div", { style: { position: "relative", textAlign: "center", top: -5, fontSize: 10, marginBottom: -5 } }, this.props.entry.title),
            this.renderContents(),
            this.props.connectDragSource(React.createElement("div", { style: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0 } }))));
    }
}
const collect = (connect) => {
    return { connectDragSource: connect.dragSource() };
};
export default DragSource("block", blockSourceSpec, collect)(BlockPaletteItem);
//# sourceMappingURL=BlockPaletteItem.js.map