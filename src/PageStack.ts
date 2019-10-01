import { Database } from "./database/Database";

export interface Page {
  /** Whether page is a normal page or a modal */
  type: "modal" | "normal"

  /** Widget to display in page */
  widgetId: string

  database: Database

  /** Optional title of the page */
  title?: string

  /** Values of context variables that widget needs */
  contextVarValues: { [contextVarId: string]: any };  
}

/** Manages the stack of pages, allowing opening and closing of pages */
export interface PageStack {
  openPage(page: Page): void

  /** Close top page. true for success, false for failure */
  closePage(): boolean

  /** Closes all pages. true for success, false for failure */
  closeAllPages(): boolean
}
