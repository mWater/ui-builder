export function localize(str, locale) {
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
//# sourceMappingURL=localization.js.map