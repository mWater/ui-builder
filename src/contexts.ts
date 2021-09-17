import _ from 'lodash'
import { ActionLibrary } from "./widgets/ActionLibrary";
import { WidgetLibrary } from "./designer/widgetLibrary";
import { DataSource, Schema, Expr } from "mwater-expressions";
import { CreateBlock, ContextVar, BlockStore, Filter, BlockDef } from "./widgets/blocks";
import { Database } from "./database/Database";
import { PageStack } from "./PageStack";
import { BlockPaletteEntry } from "./designer/blockPaletteEntries";
import { FormatLocaleObject } from "d3-format";
import { LocalizeString } from 'ez-localize'

/** Base context that all UI Builder needs */
export interface BaseCtx {
  /** locale to use (e.g. "en") */
  locale: string

  /** Schema that system uses */
  schema: Schema

  /** Data source. Present in design always, optional in instance */
  dataSource?: DataSource

  /** All widgets of system */
  widgetLibrary: WidgetLibrary

  /** All actions of system */
  actionLibrary: ActionLibrary

  /** Function to create a block */
  createBlock: CreateBlock

  /** Database to use */
  database: Database

  /** Localizer to use */
  T: LocalizeString

  /** Locale object to use for formatting */
  formatLocale?: FormatLocaleObject

  /** Global context variables that are passed to all blocks */
  globalContextVars?: ContextVar[] 

  /** All available locales (for preview purposes) */
  locales?: Locale[]
}

export interface Locale {
  /** ISO code for locale (e.g. "en") */
  code: string

  /** Local name for locale (e.g. Espanol) */
  name: string
}

/** Context that all design-mode operations need */
export interface DesignCtx extends BaseCtx {
  dataSource: DataSource
  
  /** All context variables present, including global ones */
  contextVars: ContextVar[]

  /** Store to edit blocks */
  store: BlockStore

  blockPaletteEntries: BlockPaletteEntry[]

  /** Selected block id as some blocks may display differently when selected */
  selectedId: string | null,

  /** All sub-block elements must rendered using this function. onSet will be called only when transitioning from null to a value */
  renderChildBlock(designCtx: DesignCtx, childBlockDef: BlockDef | null, onSet?: (blockDef: BlockDef) => void): React.ReactElement<any>
}

/** Context that all operations on an instance of a block need */
export interface InstanceCtx extends BaseCtx {
  pageStack: PageStack

  /** Context variables that are present, including global ones */
  contextVars: ContextVar[]

  /** Values of context variables. Note: filters are not incorporated automatically into rowset values! */
  contextVarValues: { [contextVarId: string]: any }

  /** Get any filters set on a rowset context variable. This includes ones set by other blocks */
  getFilters(contextVarId: string): Filter[]

  /** Set a filter on a rowset context variable. To remove a filter, set one with the same id
   * but with a null expression.
   */
  setFilter(contextVarId: string, filter: Filter): void

  /**
   * Gets the value of an expression based off of a context variable
   * @param contextVarId id of context variable. null for expr not based on context variable row/rowset
   * @param expr expression to get value of
   */
  getContextVarExprValue(contextVarId: string | null, expr: Expr): any

  /** Selection call on context var (when type = "rowset" and selectable) */
  onSelectContextVar(contextVarId: string, primaryKey: any): void

  /** All sub-block elements must rendered using this function. */
  renderChildBlock(ctx: InstanceCtx, childBlockDef: BlockDef | null): React.ReactElement<any> | null

  /** Registers an instance for validation. Returns a function which must be called to unregister when the instance goes away.
   * The function that is passed to registerForValidation must return null if correct, message if not. Empty message ("") blocks but does not show alert
   * isFirstError is true if first block to potentially fail validation. This allows the block to scroll into view on error
   */
  registerForValidation(validate: (isFirstError: boolean) => string | null | Promise<string | null>): (() => void)
}

/** Gets context variables with filters baked into rowsets. Use for all queries, as that may depend on rowset filters */
export function getFilteredContextVarValues(instanceCtx: InstanceCtx): { [contextVarId: string]: any } {
  const results: { [contextVarId: string]: any } = {}

  for (const cv of instanceCtx.contextVars) {
    if (cv.type == "rowset") {
      // Create and expression
      const expr: Expr = {
        type: "op",
        op: "and",
        table: cv.table!,
        exprs: _.compact([instanceCtx.contextVarValues[cv.id]].concat(_.map(instanceCtx.getFilters(cv.id), f => f.expr)))
      }
      if (expr.exprs.length == 1) {
        results[cv.id] = expr.exprs[0]
      }
      else if (expr.exprs.length == 0) {
        results[cv.id] = null
      }
      else {
        results[cv.id] = expr
      }
    }
    else {
      results[cv.id] = instanceCtx.contextVarValues[cv.id]
    }
  }

  return results
}