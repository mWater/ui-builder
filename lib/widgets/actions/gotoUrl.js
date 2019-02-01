"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
const actions_1 = require("../actions");
const propertyEditors_1 = require("../propertyEditors");
const bootstrap_1 = require("react-library/lib/bootstrap");
class GotoUrlAction extends actions_1.Action {
    performAction(options) {
        return __awaiter(this, void 0, void 0, function* () {
            window.open(this.actionDef.url, this.actionDef.newTab ? "_blank" : "_self");
        });
    }
    validate(options) {
        // Check that url is present
        if (!this.actionDef.url) {
            return "URL required";
        }
        return null;
    }
    renderEditor(props) {
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "URL" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.actionDef, onChange: props.onChange, property: "url" }, (value, onChange) => React.createElement(bootstrap_1.TextInput, { value: value, onChange: onChange }))),
            React.createElement(propertyEditors_1.PropertyEditor, { obj: this.actionDef, onChange: props.onChange, property: "newTab" }, (value, onChange) => React.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange }, "Open in new tab"))));
    }
}
exports.GotoUrlAction = GotoUrlAction;
//# sourceMappingURL=gotoUrl.js.map