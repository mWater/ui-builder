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
const LeafBlock_1 = __importDefault(require("../LeafBlock"));
// TODO
class SpacerBlock extends LeafBlock_1.default {
    validate() { return null; }
    renderDesign(props) {
        return (React.createElement("div", null));
    }
    renderInstance(props) {
        return (React.createElement("div", null));
    }
}
exports.SpacerBlock = SpacerBlock;
//# sourceMappingURL=spacer.js.map