var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import * as React from "react";
import { DragSource } from "react-dnd";
import { v4 as uuid } from 'uuid';
import BlockPlaceholder from "../widgets/BlockPlaceholder";
const blockSourceSpec = {
    beginDrag(props) {
        // Create deep clone
        const block = props.createBlock(props.blockDef);
        return {
            blockDef: block.process(props.createBlock, (b) => Object.assign({}, b, { id: uuid() }))
        };
    }
};
let BlockPaletteItem = class BlockPaletteItem extends React.Component {
    renderContents() {
        const block = this.props.createBlock(this.props.blockDef);
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
            React.createElement("div", { style: { position: "relative", textAlign: "center", top: -5, fontSize: 10, marginBottom: -5 } }, this.props.title),
            this.renderContents(),
            this.props.connectDragSource(React.createElement("div", { style: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0 } }))));
    }
};
BlockPaletteItem = __decorate([
    DragSource("block", blockSourceSpec, (connect, monitor) => ({
        connectDragSource: connect.dragSource()
    }))
], BlockPaletteItem);
export default BlockPaletteItem;
//# sourceMappingURL=BlockPaletteItem.js.map