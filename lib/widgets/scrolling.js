"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScrollParent = void 0;
// From: https://gist.github.com/twxia/bb20843c495a49644be6ea3804c0d775
function getScrollParent(node) {
    const isElement = node instanceof HTMLElement;
    const overflowY = isElement && window.getComputedStyle(node).overflowY;
    const isScrollable = overflowY !== "visible" && overflowY !== "hidden";
    if (!node) {
        return null;
    }
    else if (isScrollable && node.scrollHeight >= node.clientHeight) {
        return node;
    }
    return getScrollParent(node.parentNode) || document.body;
}
exports.getScrollParent = getScrollParent;
