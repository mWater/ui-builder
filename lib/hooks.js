"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePageWidth = exports.useStabilizeValue = exports.useStabilizeFunction = void 0;
const react_1 = require("react");
function useStabilizeFunction(func) {
    // Create ref for changing func
    const variableRef = (0, react_1.useRef)();
    variableRef.current = func;
    // Create stable function to always use as callback
    function stableCallback(...args) {
        return variableRef.current.apply(null, args);
    }
    const stableRef = (0, react_1.useRef)(stableCallback);
    return func ? stableRef.current : undefined;
}
exports.useStabilizeFunction = useStabilizeFunction;
/** Always returns the same value of stringifies the same to prevent unnecessary re-rendering */
function useStabilizeValue(value) {
    const stableRef = (0, react_1.useRef)(value);
    if (JSON.stringify(value) != JSON.stringify(stableRef.current)) {
        stableRef.current = value;
    }
    return stableRef.current;
}
exports.useStabilizeValue = useStabilizeValue;
/** Returns the page width, triggering update as it changes */
function usePageWidth() {
    // Store overall page width and update it
    const [pageWidth, setPageWidth] = (0, react_1.useState)(window.innerWidth);
    (0, react_1.useEffect)(() => {
        function handleResize() {
            setPageWidth(window.innerWidth);
        }
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    return pageWidth;
}
exports.usePageWidth = usePageWidth;
