import { ActionLibrary } from "./widgets/ActionLibrary";
import { WidgetLibrary } from "./designer/widgetLibrary";
import { DataSource, Schema, Expr } from "mwater-expressions";
import { CreateBlock, ContextVar, BlockStore, Filter, BlockDef } from "./widgets/blocks";
import { Database } from "./database/Database";
import { PageStack } from "./PageStack";
import { BlockPaletteEntry } from "./designer/blockPaletteEntries";

/** Base context that all UI Builder needs */
export interface BaseCtx {
  /** locale to use (e.g. "en") */
  locale: string,
  schema: Schema,
  dataSource?: DataSource
  widgetLibrary: WidgetLibrary
  actionLibrary: ActionLibrary
  createBlock: CreateBlock
  database: Database
}

/** Context that all design-mode operations need */
export interface DesignCtx extends BaseCtx {
  dataSource: DataSource
  
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

  contextVars: ContextVar[]

  /** Values of context variables. Note: filters are not incorporated automatically into rowset values! */
  contextVarValues: { [contextVarId: string]: any }

  /** Get any filters set on a rowset context variable  */
  getFilters(contextVarId: string): Filter[]

  /** Set a filter on a rowset context variable */
  setFilter(contextVarId: string, filter: Filter): void

  /**
   * Gets the value of an expression based off of a context variable
   * @param contextVarId id of context variable
   * @param expr expression to get value of
   */
  getContextVarExprValue(contextVarId: string, expr: Expr): any

  /** Selection call on context var (when type = "rowset" and selectable) */
  onSelectContextVar(contextVarId: string, primaryKey: any): void

  /** All sub-block elements must rendered using this function. */
  renderChildBlock(ctx: InstanceCtx, childBlockDef: BlockDef | null): React.ReactElement<any> | null

  /** Registers an instance for validation. Returns a function which must be called to unregister when the instance goes away.
   * The function that is passed to registerForValidation must return null if correct, message if not. Empty message ("") blocks but does not show
   */
  registerForValidation(validate: () => string | null): (() => void)
}