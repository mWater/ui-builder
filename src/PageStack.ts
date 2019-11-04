import { Database } from "./database/Database";

export interface Page {
  /** Whether page is a normal page or a modal */
  type: "modal" | "normal"

  /** Widget to display in page */
  widgetId: string

  database: Database

  /** Optional title of the page */
  title?: string

  /** Values of context variables that widget needs. Includes values of global context variables */
  contextVarValues: { [contextVarId: string]: any };  
}

/** Manages the stack of pages, allowing opening and closing of pages */
export interface PageStack {
  openPage(page: Page): void

  /** Replace current page with specified one. true for success, false for failure */
  replacePage(page: Page): boolean

  /** Close top page. Returns whether successful and pages still open */
  closePage(): { success: boolean, pageCount: number }

  /** Closes all pages. true for success, false for failure */
  closeAllPages(): boolean
}
