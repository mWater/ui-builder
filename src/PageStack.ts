import { Database } from "./database/Database";

export interface Page {
  /** Whether page is a normal page or a modal. "inline" is displayed as 
   * an inline widget without padding. It assumes that all child pages
   * will be modals 
   */
  type: "modal" | "normal" | "inline"

  /** Modal size. Default is "normal" */
  modalSize?: "small" | "normal" | "large" | "full" 

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
  replacePage(page: Page): Promise<boolean>

  /** Close top page. Returns whether successful and pages still open */
  closePage(): Promise<{ success: boolean, pageCount: number }>
}
