"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
var BlockPaletteItem_1 = __importDefault(require("./BlockPaletteItem"));
var BlockPalette = /** @class */ (function (_super) {
    __extends(BlockPalette, _super);
    function BlockPalette(props) {
        var _this = _super.call(this, props) || this;
        _this.handleSearchChange = function (ev) {
            _this.setState({ searchText: ev.target.value });
        };
        _this.state = {
            searchText: ""
        };
        return _this;
    }
    BlockPalette.prototype.render = function () {
        var _this = this;
        var filteredItems = this.props.entries.filter(function (entry) {
            if (!_this.state.searchText) {
                return true;
            }
            return entry.title.toLowerCase().includes(_this.state.searchText.toLowerCase());
        });
        return (React.createElement("div", { className: "widget-designer-palette" },
            React.createElement("input", { type: "text", className: "form-control input-sm", placeholder: "Search...", value: this.state.searchText, onChange: this.handleSearchChange }),
            filteredItems.map(function (entry, index) { return React.createElement(BlockPaletteItem_1.default, { key: index, entry: entry, createBlock: _this.props.createBlock, schema: _this.props.schema, dataSource: _this.props.dataSource }); })));
    };
    return BlockPalette;
}(React.Component));
exports.default = BlockPalette;
//# sourceMappingURL=BlockPalette.js.map