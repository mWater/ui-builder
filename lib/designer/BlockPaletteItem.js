"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
const react_dnd_1 = require("react-dnd");
const uuid_1 = require("uuid");
const BlockPlaceholder_1 = __importDefault(require("../widgets/BlockPlaceholder"));
const blockSourceSpec = {
    beginDrag(props) {
        // Create deep clone
        const block = props.createBlock(props.entry.blockDef);
        return {
            blockDef: block.process(props.createBlock, (b) => Object.assign({}, b, { id: uuid_1.v4() }))
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
                    return React.createElement(BlockPlaceholder_1.default, null);
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
exports.default = react_dnd_1.DragSource("block", blockSourceSpec, collect)(BlockPaletteItem);
//# sourceMappingURL=BlockPaletteItem.js.map