import * as React from 'react'
import * as uuid from 'uuid/v4'
import { Database } from './Database'
import { Schema, Expr } from 'mwater-expressions'

export enum DropSide {
  top = "Top",
  bottom = "Bottom",
  left = "Left",
  right = "Right"
}

export interface BlockStore {
  alterBlock(blockId: string, action: (blockDef: BlockDef) => BlockDef | null, removeBlockId?: string): void
}

// Store which throws on any operation
export class NullBlockStore implements BlockStore {
  alterBlock(blockId: string, action: (blockDef: BlockDef) => BlockDef | null): void {
    throw new Error("Not allowed")
  }  
}

// Block definition
export interface BlockDef {
  id: string     // Unique id (globally)
  type: string,  // Type of the block
  [index: string]: any  // Other props
}

export type CreateBlock = (blockDef: BlockDef) => Block

export interface ContextVar {
  id: string;     // Id of context variable
  name: string;   // Name of context variable
  type: string;   // row, rowset, text, number, date, datetime, enum, enumset, ...
  table?: string;  // table of database (when type = "rowset" or "row")
  aggrOnly?: boolean; // true if only aggregate expressions are allowed (when type = "rowset")
  selectable?: boolean;  // true if row can be selected (when type = "rowset")
}

export interface RenderInstanceProps {
  /** locale to display (e.g. "en") */
  locale: string,
  database: Database,
  contextVars: ContextVar[],

  // TODO how to indicate when changed?? 
  /** Gets the value of a context variable */
  getContextVarValue(contextVarId: string): any,

  // TODO how to indicate when changed?? What to display while change is in progress?
  getContextVarExprValue(contextVarId: string, expr: Expr): any,

  onSelectContextVar(contextVarId: string, primaryKey: any): void; // selection call on context var (when type = "rowset" and selectable)

  /** Set a filter on a rowset context variable */
  setFilter(contextVarId: string, filter: Filter): void;

  // TODO how to know when changed? Does each block using a rowset need to get filters and combine with rowset value? Or does rowset value automatically 
  // include filters?
  /** Get any filters set on a rowset context variable */
  getFilters(contextVarId: string): Filter[];
  
  getFilteredRowsetValue(contextVarId: string): Expr;
}

export interface RenderDesignProps {
  /** locale to use (e.g. "en") */
  locale: string,
  contextVars: ContextVar[],
  store: BlockStore,
  schema: Schema,

  /** Selected block id as some blocks may display differently when selected */
  selectedId: string | null,

  // All sub-block elements must wrapped using this function
  wrapDesignerElem(blockDef: BlockDef, elem: React.ReactElement<any>): React.ReactElement<any>,
}

export interface RenderEditorProps {
  contextVars: ContextVar[],
  /** locale of the editor (e.g. "en") */
  locale: string,
  onChange(blockDef: BlockDef): void,
}

/** A filter that applies to a particular rowset context variable */
export interface Filter {
  id: string, // Unique id of the filter
  memo: any,  // For internal use by the block. Will be passed back unchanged.
  expr: Expr  // Boolean filter expression on the rowset
}

export interface ValidationError {
  message: string
}

export interface BlockInstance extends React.Component {
  validate?(): ValidationError[] // TODO needed??
}

export abstract class Block {
  blockDef: BlockDef

  constructor(blockDef: BlockDef) {
    this.blockDef = blockDef
  }

  get id() { return this.blockDef.id; }

  /** Render the block as it looks in design mode. This may use bootstrap */
  abstract renderDesign(props: RenderDesignProps): React.ReactElement<any>

  /** Render a live instance of the block. ref will be called with the block instance. This may *not* use bootstrap */
  abstract renderInstance(props: RenderInstanceProps, ref?: (blockInstance: BlockInstance | null) => void): React.ReactElement<any>

  /** Render an optional property editor for the block. This may use bootstrap */
  renderEditor(props: RenderEditorProps): React.ReactElement<any> | null { return null }

  /** Get any context variables expressions that this block needs (not including subblocks) */
  getContextVarExprs(contextVarId: string): Expr[] { return [] }

  /** Get child blocks */
  abstract getChildBlockDefs(): BlockDef[]

  /** 
   * Processes entire tree, starting at bottom. Allows 
   * easy mutation of the tree
   */
  process(createBlock: CreateBlock, action: (self: BlockDef) => BlockDef | null): BlockDef | null {
    const blockDef = this.processChildren((childBlockDef) => {
      // Recursively process, starting at bottom
      return createBlock(childBlockDef).process(createBlock, action)
    })
    return action(blockDef)
  }

  /** 
   * Call action child blocks (if any), replacing with result. Return changed blockDef. Allows easy mutation of the tree
   */
  abstract processChildren(action: (self: BlockDef) => BlockDef | null): BlockDef

  /** Get initial filters generated by this block */
  abstract getInitialFilters(contextVarId: string): Promise<Filter[]>;
  
  /** Get context variables which are created by this block and available to its children */
  getCreatedContextVars(): ContextVar[] { return [] }

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
      type: "horizontal"
    }
  }
  if (dropSide === DropSide.right) {
    return {
      id: uuid(),
      items: [targetBlockDef, droppedBlockDef],
      type: "horizontal"
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

export function findBlockAncestry(rootBlockDef: BlockDef, createBlock: CreateBlock, blockId: string): Block[] | null {
  const rootBlock = createBlock(rootBlockDef)

  // Return self if true
  if (rootBlock.id === blockId) {
    return [rootBlock]
  }

  // For each child
  for (const childBlockDef of rootBlock.getChildBlockDefs()) {
    const childAncestry = findBlockAncestry(childBlockDef, createBlock, blockId)
    if (childAncestry) {
      return [rootBlock].concat(childAncestry)
    }
  }

  return null
}