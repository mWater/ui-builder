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
var uuid_1 = __importDefault(require("uuid"));
var blockSourceSpec = {
    beginDrag: function () {
        return {
            blockDef: { id: uuid_1.default(), type: "addWizard" }
        };
    },
    endDrag: function (props, monitor) {
        if (monitor.didDrop()) {
            props.onSelect(monitor.getItem().blockDef.id);
        }
    }
};
/** Button that can be dragged into the designer to create an addWizard block */
var AddWizardPalette = /** @class */ (function (_super) {
    __extends(AddWizardPalette, _super);
    function AddWizardPalette() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AddWizardPalette.prototype.render = function () {
        return (this.props.connectDragSource(React.createElement("button", { type: "button", className: "btn btn-default btn-sm active", style: { cursor: "move" } },
            React.createElement("i", { className: "fa fa-arrows" }),
            " Add Block")));
    };
    return AddWizardPalette;
}(React.Component));
var collect = function (connect) {
    return { connectDragSource: connect.dragSource() };
};
exports.default = react_dnd_1.DragSource("ui-builder-block", blockSourceSpec, collect)(AddWizardPalette);
