/** Always returns the same function to prevent unnecessary re-rendering. Forwards to the real function */
export declare function useStabilizeFunction<T extends Function>(func: T): T;
export declare function useStabilizeFunction<T extends Function>(func: null): null;
export declare function useStabilizeFunction<T extends Function>(func: undefined): undefined;
