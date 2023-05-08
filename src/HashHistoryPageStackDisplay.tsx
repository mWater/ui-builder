import { useEffect, useRef, useState } from "react"
import React from "react"
import { HashHistory, HashLocation } from "react-library/lib/HashHistory"
import { BaseCtx } from "./contexts"
import { Page, PageStack } from "./PageStack"
import { PageStackDisplay } from "./PageStackDisplay"

/** Keeps a HashHistory in sync with a PageStackDisplay. 
 * 
 * When the page stack changes, it updates the hash history. 
 * 
 * If an external back triggered, it updates the page stack by closing pages.
 * 
 * If an external forward is triggered, it resets the page stack and opens the page.
 * 
 * If an external hash change is triggered, it resets the page stack and opens the page.
 * 
 * Note: the optional hash part of the hash url is ignored in routing and doesn't cause
 * a reload.
 */
export function HashHistoryPageStackDisplay(props: {
  hashHistory: HashHistory
  baseCtx: BaseCtx
  locationToPage: (location: HashLocation) => Page | null
  pageToLocation: (page: Page) => string
}) {
  const { hashHistory, baseCtx } = props

  const pageStackRef = useRef<PageStackDisplay>(null)

  // If page is not found, set true
  const [pageNotFound, setPageNotFound] = useState(false)

  const ignoreLocationChangeRef = useRef(0)

  // Block changes when pages can't be closed
  useEffect(() => {
    return hashHistory.addBlockerListener(async (prevLocation, nextLocation) => {
      const pageStack = pageStackRef.current
      if (!pageStack) {
        return false
      }

      // Ignore hash-only changes
      if (prevLocation.pathname == nextLocation.pathname && prevLocation.search == nextLocation.search) {
        ignoreLocationChangeRef.current += 1
        return false
      }

      // An external change of hash can be triggered by a forward or back or hash change
      // Determine if it is a forward or back
      const delta = nextLocation.index - prevLocation.index
            
      // If it is a back, close appropriate number of pages
      if (delta < 0) {
        // Check if can be accomplished by closing pages
        if (pageStack.getPageStack().length > -delta) {
          // Close pages needed
          for (let i = 0; i < -delta; i++) {
            const { page, pageCount, success } = await pageStack.closePage()
            if (!success) {
              // Cannot close page. Block. 
              // TODO: Note that if this was a multiple page close and only part succeded, the hash history will be out of sync
              return true
            }
          }

          // Ignore location change as it is handled by closing pages
          ignoreLocationChangeRef.current += 1
        }
        else {
          // Close all pages
          const success = await pageStack.closeAllPages()
          if (!success) {
            // Cannot close page. Block.
            // TODO: Note that if this was a multiple page close and only part succeded, the hash history will be out of sync
            return true
          }
        }
      }
      else {
        // Close all pages
        const success = await pageStackRef.current.closeAllPages()
        if (!success) {
          // Cannot close page. Block.
          // TODO: Note that if this was a multiple page close and only part succeded, the hash history will be out of sync
          return true
        }
      }
      
      return false
    })
  }, [hashHistory])

  /** Opens a page given a location. Call this when location
   * changes externally
   */
  function openPageForLocation(location: HashLocation) {
    // Go to page by location
    const page = props.locationToPage(location)
    if (page) {
      setPageNotFound(false)
      pageStackRef.current!.openPage(page)
    }
    else {
      setPageNotFound(true)
    }
  }

  // Open page for initial location
  useEffect(() => {
    openPageForLocation(hashHistory.getLocation())
  }, [hashHistory])

  // Listen to location changes to open page
  useEffect(() => {
    return hashHistory.addLocationListener((location) => {
      // If ignore, decrement and return
      if (ignoreLocationChangeRef.current > 0) {
        ignoreLocationChangeRef.current -= 1
        return
      }

      openPageForLocation(location)
    })
  }, [hashHistory])

  // Override the page stack to catch opens and closes
  const overridePageStack: PageStack = {
    openPage: (page: Page) => {
      // Call open page
      pageStackRef.current!.openPage(page)

      // If modal or has changed database
      if (page.type == "modal" || page.database != baseCtx.database) {
        // Push to history to allow back to work, but don't change url
        hashHistory.push(hashHistory.getLocation(), { silent: true })
      } else {
        // Convert to uri and silently push
        const uri = props.pageToLocation(page)
        hashHistory.push(uri, { silent: true })
      }
    },
    replacePage: async (page: Page) => {
      // Call replace page
      const success = pageStackRef.current!.replacePage(page)
      if (!success) {
        return false
      }

      // If modal or has changed database
      if (page.type == "modal" || page.database != baseCtx.database) {
        // Push to history to allow back to work, but don't change url
        hashHistory.replace(hashHistory.getLocation(), { silent: true })
      } else {
        // Convert to uri and silently push
        const uri = props.pageToLocation(page)
        hashHistory.replace(uri, { silent: true })
      }

      return true
    },
    closePage: async () => {
      const result = await pageStackRef.current!.closePage()
      if (!result.success) {
        return result
      }

      // If closed and no more pages open, do back
      if (result.pageCount == 0) {
        hashHistory.back()
        return result
      }
      
      // Go silently back
      hashHistory.back({ silent: true })
      
      return result
    }
  }

  if (pageNotFound) {
    return <div className="alert alert-info">Page not found</div>
  }

  return (
    <PageStackDisplay baseCtx={baseCtx} ref={pageStackRef} overridePageStack={overridePageStack} />
  )
}
