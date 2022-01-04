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
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
const react_dnd_1 = require("react-dnd");
require("./BlockPlaceholder.css");
const uuid = require("uuid");
const blockTargetSpec = {
    canDrop(props, monitor) {
        return true;
    },
    drop(props, monitor, component) {
        if (monitor.didDrop()) {
            return;
        }
        // Defer to next cycle to prevent drop error
        const sourceBlockDef = monitor.getItem().blockDef;
        setTimeout(() => {
            if (props.onSet) {
                props.onSet(sourceBlockDef);
            }
        }, 0);
    }
};
/** Empty space with a dashed border that blocks can be dragged into */
class BlockPlaceholder extends React.Component {
    constructor() {
        super(...arguments);
        this.handleNew = () => {
            if (this.props.onSet) {
                this.props.onSet({ id: uuid(), type: "addWizard" });
            }
        };
    }
    render() {
        return this.props.connectDropTarget(React.createElement("div", { className: this.props.isOver ? "block-placeholder drop" : "block-placeholder" },
            React.createElement("a", { className: "", onClick: this.handleNew },
                React.createElement("i", { className: "fa fa-plus" }))));
    }
}
exports.default = (0, react_dnd_1.DropTarget)("ui-builder-block", blockTargetSpec, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver({ shallow: true }),
    canDrop: monitor.canDrop()
}))(BlockPlaceholder);
