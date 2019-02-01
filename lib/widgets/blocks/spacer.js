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
var LeafBlock_1 = __importDefault(require("../LeafBlock"));
// TODO
var SpacerBlock = /** @class */ (function (_super) {
    __extends(SpacerBlock, _super);
    function SpacerBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SpacerBlock.prototype.validate = function () { return null; };
    SpacerBlock.prototype.renderDesign = function (props) {
        return (React.createElement("div", null));
    };
    SpacerBlock.prototype.renderInstance = function (props) {
        return (React.createElement("div", null));
    };
    return SpacerBlock;
}(LeafBlock_1.default));
exports.SpacerBlock = SpacerBlock;
//# sourceMappingURL=spacer.js.map