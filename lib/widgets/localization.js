"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.localize = void 0;
function localize(str, locale) {
    if (!str) {
        return "";
    }
    if (str[locale || "en"]) {
        return str[locale || "en"];
    }
    else {
        return str[str._base];
    }
}
exports.localize = localize;
