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
Object.defineProperty(exports, "__esModule", { value: true });
var React = __importStar(require("react"));
/** Allows editing of a list and removing of items */
var ListEditor = /** @class */ (function (_super) {
    __extends(ListEditor, _super);
    function ListEditor() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handleRemove = function (index) {
            var items = _this.props.items.slice();
            items.splice(index, 1);
            _this.props.onItemsChange(items);
        };
        _this.handleItemChange = function (index, item) {
            var items = _this.props.items.slice();
            items[index] = item;
            _this.props.onItemsChange(items);
        };
        return _this;
    }
    ListEditor.prototype.renderItem = function (item, index) {
        return (React.createElement("li", { className: "list-group-item", key: index },
            React.createElement("span", { style: { float: "right" }, onClick: this.handleRemove.bind(null, index) },
                React.createElement("i", { className: "fa fa-remove" })),
            this.props.children(item, this.handleItemChange.bind(null, index), index)));
    };
    ListEditor.prototype.render = function () {
        var _this = this;
        return (React.createElement("ul", { className: "list-group" }, this.props.items.map(function (item, index) { return _this.renderItem(item, index); })));
    };
    return ListEditor;
}(React.Component));
exports.default = ListEditor;
