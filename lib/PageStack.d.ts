import { Database } from "./database/Database";
export interface Page {
    /** Whether page is a normal page or a modal */
    type: "modal" | "normal";
    widgetId: string;
    database: Database;
    /** Values of context variables that widget needs */
    contextVarValues: {
        [contextVarId: string]: any;
    };
}
/** Manages the stack of pages, allowing opening and closing of pages */
export interface PageStack {
    openPage(page: Page): void;
    closePage(): void;
}
