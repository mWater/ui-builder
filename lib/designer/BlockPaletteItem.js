"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var React = __importStar(require("react"));
var react_dnd_1 = require("react-dnd");
var uuid_1 = require("uuid");
var BlockPlaceholder_1 = __importDefault(require("../widgets/BlockPlaceholder"));
var blockSourceSpec = {
    beginDrag: function (props) {
        // Create deep clone
        var block = props.createBlock(props.entry.blockDef);
        return {
            blockDef: block.process(props.createBlock, function (b) { return Object.assign({}, b, { id: uuid_1.v4() }); })
        };
    }
};
var BlockPaletteItem = /** @class */ (function (_super) {
    __extends(BlockPaletteItem, _super);
    function BlockPaletteItem() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BlockPaletteItem.prototype.renderContents = function () {
        var _this = this;
        if (this.props.entry.elem) {
            return this.props.entry.elem;
        }
        var block = this.props.createBlock(this.props.entry.blockDef);
        return block.renderDesign({
            selectedId: null,
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            locale: "en",
            widgetLibrary: { widgets: {} },
            contextVars: [],
            store: {
                alterBlock: function (blockId, action) { return; }
            },
            renderChildBlock: function (props, childBlockDef) {
                if (childBlockDef) {
                    var childBlock = _this.props.createBlock(childBlockDef);
                    return childBlock.renderDesign(props);
                }
                else {
                    return React.createElement(BlockPlaceholder_1.default, null);
                }
            },
        });
    };
    BlockPaletteItem.prototype.render = function () {
        return (React.createElement("div", { style: { padding: 5, position: "relative", backgroundColor: "white", border: "solid 1px #AAA", margin: 5 } },
            React.createElement("div", { style: { position: "relative", textAlign: "center", top: -5, fontSize: 10, marginBottom: -5 } }, this.props.entry.title),
            this.renderContents(),
            this.props.connectDragSource(React.createElement("div", { style: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0 } }))));
    };
    return BlockPaletteItem;
}(React.Component));
var collect = function (connect) {
    return { connectDragSource: connect.dragSource() };
};
exports.default = react_dnd_1.DragSource("block", blockSourceSpec, collect)(BlockPaletteItem);
