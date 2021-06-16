import { useRef } from "react"

/** Always returns the same function to prevent unnecessary re-rendering. Forwards to the real function */
export function useStabilizeFunction<T extends Function>(func: T): T
export function useStabilizeFunction<T extends Function>(func: null): null
export function useStabilizeFunction<T extends Function>(func: undefined): undefined
export function useStabilizeFunction<T extends Function>(func: T | undefined | null): T | undefined | null {
  // Create ref for changing func
  const variableRef = useRef<T | null>()
  variableRef.current = func

  // Create stable function to always use as callback
  function stableCallback(...args: any[]) {
    return variableRef.current!.apply(null, args)
  }
  const stableRef = useRef<T>(stableCallback as any)
  return func ? stableRef.current : undefined
}