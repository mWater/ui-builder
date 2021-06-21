/** Always returns the same function to prevent unnecessary re-rendering. Forwards to the real function */
export declare function useStabilizeFunction<T extends Function>(func: T): T;
export declare function useStabilizeFunction<T extends Function>(func: null): null;
export declare function useStabilizeFunction<T extends Function>(func: undefined): undefined;
export declare function useStabilizeFunction<T extends Function>(func?: T): T | undefined;
/** Always returns the same value of stringifies the same to prevent unnecessary re-rendering */
export declare function useStabilizeValue<T>(value: T): T;
/** Returns the page width, triggering update as it changes */
export declare function usePageWidth(): number;
