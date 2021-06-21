"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useStabilizeFunction = void 0;
const react_1 = require("react");
function useStabilizeFunction(func) {
    // Create ref for changing func
    const variableRef = react_1.useRef();
    variableRef.current = func;
    // Create stable function to always use as callback
    function stableCallback(...args) {
        return variableRef.current.apply(null, args);
    }
    const stableRef = react_1.useRef(stableCallback);
    return func ? stableRef.current : undefined;
}
exports.useStabilizeFunction = useStabilizeFunction;
