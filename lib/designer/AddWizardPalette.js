"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
const react_dnd_1 = require("react-dnd");
const uuid_1 = __importDefault(require("uuid"));
const blockSourceSpec = {
    beginDrag() {
        return {
            blockDef: { id: (0, uuid_1.default)(), type: "addWizard" }
        };
    },
    endDrag(props, monitor) {
        if (monitor.didDrop()) {
            props.onSelect(monitor.getItem().blockDef.id);
        }
    }
};
/** Button that can be dragged into the designer to create an addWizard block */
class AddWizardPalette extends React.Component {
    render() {
        return this.props.connectDragSource(React.createElement("button", { type: "button", className: "btn btn-default btn-sm active", style: { cursor: "move" } },
            React.createElement("i", { className: "fa fa-arrows" }),
            " Add Block"));
    }
}
const collect = (connect) => {
    return { connectDragSource: connect.dragSource() };
};
exports.default = (0, react_dnd_1.DragSource)("ui-builder-block", blockSourceSpec, collect)(AddWizardPalette);
