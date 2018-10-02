import * as React from 'react'
import * as uuid from 'uuid/v4'
import { Database } from '../Database'
import { Schema, Expr, DataSource } from 'mwater-expressions'
import { WidgetLibrary } from '../designer/widgetLibrary';
import { ActionLibrary } from './ActionLibrary';
import { PageStack } from '../PageStack';
import "./blocks.css"
import { LookupWidget } from './widgets';

/** Side on which another block is dropped on a block */
export enum DropSide {
  top = "Top",
  bottom = "Bottom",
  left = "Left",
  right = "Right"
}

/** Store which permits modification of the block tree */
export interface BlockStore {
  alterBlock(blockId: string, action: (blockDef: BlockDef) => BlockDef | null, removeBlockId?: string): void
}

/** Store which throws on any operation */
export class NullBlockStore implements BlockStore {
  alterBlock(blockId: string, action: (blockDef: BlockDef) => BlockDef | null): void {
    throw new Error("Not allowed")
  }  
}

/** Block definition */
export interface BlockDef {
  id: string     // Unique id (globally)
  type: string,  // Type of the block
  [index: string]: any  // Other props
}

export type CreateBlock = (blockDef: BlockDef) => Block<BlockDef>

/** Context variable is a variable which is available to a block and all of its children. Usually row or a rowset */
export interface ContextVar {
  id: string;     // Id of context variable
  name: string;   // Name of context variable
  type: string;   // "row", "rowset", "text", "number", "date", "datetime", "enum", "enumset", ...
  table?: string;  // table of database (when type = "rowset" or "row")
  // aggrOnly?: boolean; // true if only aggregate expressions are allowed (when type = "rowset")
  // selectable?: boolean;  // true if row can be selected (when type = "rowset")
}

export interface RenderInstanceProps {
  /** locale to display (e.g. "en") */
  locale: string,
  database: Database,
  schema: Schema,
  contextVars: ContextVar[]
  actionLibrary: ActionLibrary
  widgetLibrary: WidgetLibrary
  pageStack: PageStack

  /** Gets the value of a context variable */
  getContextVarValue(contextVarId: string): any

  /**
   * Gets the value of an expression based off of a context variable
   * @param contextVarId id of context variable
   * @param expr expression to get value of
   */
  getContextVarExprValue(contextVarId: string, expr: Expr): any

  /** Selection call on context var (when type = "rowset" and selectable) */
  onSelectContextVar(contextVarId: string, primaryKey: any): void

  /** Set a filter on a rowset context variable */
  setFilter(contextVarId: string, filter: Filter): void

  /** Get any filters set on a rowset context variable  */
  getFilters(contextVarId: string): Filter[]

  /** All sub-block elements must rendered using this function. 
   * @param instanceId if more than one child element with the same id will be rendered, instanceId must be a unique string 
   * per instance 
   */
  renderChildBlock(props: RenderInstanceProps, childBlockDef: BlockDef | null, instanceId?: string): React.ReactElement<any>
}

export interface RenderDesignProps {
  /** locale to use (e.g. "en") */
  locale: string,
  contextVars: ContextVar[],
  store: BlockStore,
  schema: Schema,
  dataSource: DataSource
  widgetLibrary: WidgetLibrary

  /** Selected block id as some blocks may display differently when selected */
  selectedId: string | null,

  /** All sub-block elements must rendered using this function. onSet will be called only when transitioning from null to a value */
  renderChildBlock(props: RenderDesignProps, childBlockDef: BlockDef | null, onSet?: (blockDef: BlockDef) => void): React.ReactElement<any>
}

export interface RenderEditorProps {
  contextVars: ContextVar[]
  /** locale of the editor (e.g. "en") */
  locale: string
  schema: Schema
  dataSource: DataSource
  actionLibrary: ActionLibrary
  widgetLibrary: WidgetLibrary
  onChange(blockDef: BlockDef): void
}

export interface ValidateBlockOptions {
  schema: Schema
  contextVars: ContextVar[]

  actionLibrary: ActionLibrary

  /** Widget library that lists all available widgets */
  widgetLibrary: WidgetLibrary
}

/** A filter that applies to a particular rowset context variable */
export interface Filter {
  id: string, // Unique id of the filter
  expr: Expr  // Boolean filter expression on the rowset. null expression to clear a filter
  memo?: any,  // For internal use by the block. Will be passed back unchanged.
}

/** Child of a block. Specifies the child block def and also any context variables passed to it */
export interface ChildBlock {
  blockDef: BlockDef
  contextVars: ContextVar[]
}

export abstract class Block<T extends BlockDef> {
  blockDef: T

  constructor(blockDef: T) {
    this.blockDef = blockDef
  }

  get id() { return this.blockDef.id; }

  /** Render the block as it looks in design mode. This may use bootstrap */
  abstract renderDesign(props: RenderDesignProps): React.ReactElement<any>

  /** Render a live instance of the block. This may use bootstrap for now */
  abstract renderInstance(props: RenderInstanceProps): React.ReactElement<any>

  /** Render an optional property editor for the block. This may use bootstrap */
  renderEditor(props: RenderEditorProps): React.ReactElement<any> | null { return null }

  /** Get any context variables expressions that this block needs (not including child blocks) */
  getContextVarExprs(contextVar: ContextVar): Expr[] { return [] }

  /** Get child blocks. Child blocks or their injected context vars can depend on type of context variables passed in. */
  abstract getChildren(contextVars: ContextVar[]): ChildBlock[]

  /** Determine if block is valid. null means valid, string is error message. Does not validate children */
  abstract validate(options: ValidateBlockOptions): string | null

  /** 
   * Processes entire tree, starting at bottom. Allows 
   * easy mutation of the tree
   */
  process(createBlock: CreateBlock, action: (self: BlockDef | null) => BlockDef | null): BlockDef | null {
    const blockDef = this.processChildren((childBlockDef) => {
      // Recursively process, starting at bottom
      if (childBlockDef !== null) {
        return createBlock(childBlockDef).process(createBlock, action)
      }
      else {
        return null
      }
    })
    return action(blockDef)
  }

  /** 
   * Call action child blocks (if any), replacing with result. Return changed blockDef. Allows easy mutation of the tree
   */
  abstract processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef

  /** Get initial filters generated by this block. Does not include child blocks */
  getInitialFilters(contextVarId: string): Filter[] { return [] }
  
  /** Canonicalize the block definition. Should be done after operations on the block are completed. Only alter self, not children */
  canonicalize(): BlockDef | null {
    return this.blockDef
  }
}

// Handles logic of a simple dropping of a block on another
export function dropBlock(droppedBlockDef: BlockDef, targetBlockDef: BlockDef, dropSide: DropSide): BlockDef {
  if (dropSide === DropSide.left) {
    return {
      id: uuid(),
      items: [droppedBlockDef, targetBlockDef],
      type: "horizontal",
      align: "justify"
    }
  }
  if (dropSide === DropSide.right) {
    return {
      id: uuid(),
      items: [targetBlockDef, droppedBlockDef],
      type: "horizontal",
      align: "justify"
    }
  }
  if (dropSide === DropSide.top) {
    return {
      id: uuid(),
      items: [droppedBlockDef, targetBlockDef],
      type: "vertical"
    }
  }
  if (dropSide === DropSide.bottom) {
    return {
      id: uuid(),
      items: [targetBlockDef, droppedBlockDef],
      type: "vertical"
    }
  }
  throw new Error("Unknown side")
}

/**
 * Find the entire ancestry (root first) of a block with the specified id
 * 
 * @param rootBlockDef root block to search in
 * @param createBlock 
 * @param blockId block to find
 * @returns array of child blocks, each with information about which context variables were injected by their parent
 */
export function findBlockAncestry(rootBlockDef: BlockDef, createBlock: CreateBlock, contextVars: ContextVar[], blockId: string): ChildBlock[] | null {
  const rootBlock = createBlock(rootBlockDef)

  // Return self if true
  if (rootBlock.id === blockId) {
    return [{ blockDef: rootBlockDef, contextVars: contextVars }]
  }

  // For each child
  for (const childBlock of rootBlock.getChildren(contextVars)) {
    if (childBlock.blockDef) {
      const childAncestry: ChildBlock[] | null = findBlockAncestry(childBlock.blockDef, createBlock, childBlock.contextVars, blockId)
      if (childAncestry) {
        return [{ blockDef: rootBlockDef, contextVars: contextVars } as ChildBlock].concat(childAncestry)
      }
    }
  }

  return null
}

/** Get the entire tree of blocks from a root, including context variables for each */
export function getBlockTree(rootBlockDef: BlockDef, createBlock: CreateBlock, contextVars: ContextVar[]): ChildBlock[] {
  const rootChildBlock: ChildBlock = { blockDef: rootBlockDef, contextVars: contextVars }

  // Create list including children
  let list = [rootChildBlock]

  // For each child
  for (const childBlock of createBlock(rootBlockDef).getChildren(contextVars)) {
    if (childBlock.blockDef) {
      const childTree = getBlockTree(childBlock.blockDef, createBlock, childBlock.contextVars)
      list = list.concat(childTree)
    }
  }

  return list
}