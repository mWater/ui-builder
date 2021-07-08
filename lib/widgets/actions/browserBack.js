"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserBackAction = void 0;
const actions_1 = require("../actions");
/** Goes back in browser history */
class BrowserBackAction extends actions_1.Action {
    validate(designCtx) {
        return null;
    }
    async performAction(instanceCtx) {
        window.history.back();
    }
}
exports.BrowserBackAction = BrowserBackAction;
