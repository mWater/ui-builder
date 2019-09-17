import { WidgetDef } from "./widgets/widgets";
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

  /** Returns number of pages left in stack if succeeded or null if failed */
  closePage(): number | null
}
