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
const BlockPaletteItem_1 = __importDefault(require("./BlockPaletteItem"));
class BlockPalette extends React.Component {
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
            filteredItems.map((entry, index) => React.createElement(BlockPaletteItem_1.default, { key: index, entry: entry, createBlock: this.props.createBlock, schema: this.props.schema, dataSource: this.props.dataSource }))));
    }
}
exports.default = BlockPalette;
//# sourceMappingURL=BlockPalette.js.map