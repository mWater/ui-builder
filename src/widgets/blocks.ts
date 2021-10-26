import _ from "lodash"
import * as React from "react"
import { v4 as uuid } from "uuid"
import { Expr, Variable, LiteralType, EnumValue, ExprValidator, AggrStatus, Schema } from "mwater-expressions"
import { InstanceCtx, DesignCtx } from "../contexts"
import "./blocks.css"
import { HorizontalBlockDef } from "./blocks/horizontal"
import { VerticalBlockDef } from "./blocks/vertical"

/** Side on which another block is dropped on a block */
export enum DropSide {
  top = "Top",
  bottom = "Bottom",
  left = "Left",
  right = "Right"
}

/** Store which permits modification of the block tree */
export interface BlockStore {
  /** Replace block with specified id with either another block or nothing.
   * Optionally removes another id first (for dragging where block should disappear and re-appear somewhere else) */
  alterBlock(blockId: string, action: (blockDef: BlockDef) => BlockDef | null, removeBlockId?: string): void

  /** Convenience method to alter a single block */
  replaceBlock(blockDef: BlockDef): void
}

/** Store which throws on any operation */
export class NullBlockStore implements BlockStore {
  alterBlock(blockId: string, action: (blockDef: BlockDef) => BlockDef | null): void {
    throw new Error("Not allowed")
  }
  replaceBlock(blockDef: BlockDef) {
    throw new Error("Not allowed")
  }
}

/** Block definition */
export interface BlockDef {
  id: string // Unique id (globally)
  type: string // Type of the block
}

export type CreateBlock = (blockDef: BlockDef) => Block<BlockDef>

/** Context variable is a variable which is available to a block and all of its children. Usually row or a rowset
 * Values:
 * - In the case of "row", the value of the variable is the primary key
 * - In the case of "rowset", the value of the variable is a boolean expression for the table
 * - Otherwise, the value is an expression
 */
export interface ContextVar {
  /** Id of context variable */
  id: string

  /** Name of context variable */
  name: string

  type: "row" | "rowset" | LiteralType

  /** table of database.
   * When type is "rowset" or "row", it is the table which the row or rowset is for.
   * For other variable types, the table is present if the variable is an expression based on a table.
   */
  table?: string

  /** Enum values when type is "enum" or "enumset" */
  enumValues?: EnumValue[]

  /** Table referenced by an "id" or "id[]" type variable */
  idTable?: string
}

/** A filter that applies to a particular rowset context variable */
export interface Filter {
  id: string // Unique id of the filter
  expr: Expr // Boolean filter expression on the rowset. null expression to clear a filter
  memo?: any // For internal use by the block. Will be passed back unchanged.
}

/** Child of a block. Specifies the child block def and also any context variables passed to it */
export interface ChildBlock {
  blockDef: BlockDef
  contextVars: ContextVar[]
}

/** Block class. Ephemeral class that is created for a block def and
 * contains the logic and display for a block type.
 * Note: Designer (renderDesign and renderEditor) can assume that the block def is canonical.
 * Instance, however, cannot assume that.
 */
export abstract class Block<T extends BlockDef> {
  blockDef: T

  constructor(blockDef: T) {
    this.blockDef = blockDef
  }

  get id() {
    return this.blockDef.id
  }

  /** Render the block as it looks in design mode. This may use bootstrap */
  abstract renderDesign(props: DesignCtx): React.ReactElement<any>

  /** Render a live instance of the block. This may use bootstrap for now */
  abstract renderInstance(props: InstanceCtx): React.ReactElement<any>

  /** Render an optional property editor for the block. This may use bootstrap */
  renderEditor(designCtx: DesignCtx): React.ReactElement<any> | null {
    return null
  }

  /** Get any context variables expressions that this block needs (not including child blocks) */
  getContextVarExprs(contextVar: ContextVar, ctx: DesignCtx | InstanceCtx): Expr[] {
    return []
  }

  /** Get any context variables expressions that this block needs *including* child blocks. Can be overridden */
  getSubtreeContextVarExprs(contextVar: ContextVar, ctx: DesignCtx | InstanceCtx): Expr[] {
    // Get own exprs
    let ownExprs = this.getContextVarExprs(contextVar, ctx)

    // Append child ones
    for (const childBlock of this.getChildren(ctx.contextVars)) {
      const block = ctx.createBlock(childBlock.blockDef)
      ownExprs = ownExprs.concat(block.getSubtreeContextVarExprs(contextVar, ctx))
    }
    return ownExprs
  }

  /** Get child blocks. Child blocks or their injected context vars can depend on type of context variables passed in. */
  abstract getChildren(contextVars: ContextVar[]): ChildBlock[]

  /** Determine if block is valid. null means valid, string is error message. Does not validate children */
  abstract validate(designCtx: DesignCtx): string | null

  /**
   * Processes entire tree, starting at bottom. Allows
   * easy mutation of the tree
   */
  process(createBlock: CreateBlock, action: (self: BlockDef) => BlockDef | null): BlockDef | null {
    const blockDef = this.processChildren((childBlockDef) => {
      // Recursively process, starting at bottom
      if (childBlockDef != null) {
        return createBlock(childBlockDef).process(createBlock, action)
      } else {
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
  getInitialFilters(contextVarId: string, instanceCtx: InstanceCtx): Filter[] {
    return []
  }

  /** Get initial filters generated by this block and any children */
  getSubtreeInitialFilters(contextVarId: string, instanceCtx: InstanceCtx): Filter[] {
    // Get own filters
    let ownFilters = this.getInitialFilters(contextVarId, instanceCtx)

    // Append child ones
    for (const childBlock of this.getChildren(instanceCtx.contextVars)) {
      const block = instanceCtx.createBlock(childBlock.blockDef)
      ownFilters = ownFilters.concat(block.getSubtreeInitialFilters(contextVarId, instanceCtx))
    }
    return ownFilters
  }

  /** Canonicalize the block definition. Should be done after operations on the block are completed. Only alter self, not children.
   * Can also be used to upgrade blocks
   */
  canonicalize(): BlockDef | null {
    return this.blockDef
  }

  /** Get label to display in designer */
  getLabel(): string {
    return this.blockDef.type
  }
}

// Handles logic of a simple dropping of a block on another
export function dropBlock(droppedBlockDef: BlockDef, targetBlockDef: BlockDef, dropSide: DropSide): BlockDef {
  if (dropSide === DropSide.left) {
    return {
      id: uuid(),
      items: [droppedBlockDef, targetBlockDef],
      type: "horizontal"
    } as HorizontalBlockDef
  }
  if (dropSide === DropSide.right) {
    return {
      id: uuid(),
      items: [targetBlockDef, droppedBlockDef],
      type: "horizontal"
    } as HorizontalBlockDef
  }
  if (dropSide === DropSide.top) {
    return {
      id: uuid(),
      items: [droppedBlockDef, targetBlockDef],
      type: "vertical"
    } as VerticalBlockDef
  }
  if (dropSide === DropSide.bottom) {
    return {
      id: uuid(),
      items: [targetBlockDef, droppedBlockDef],
      type: "vertical"
    } as VerticalBlockDef
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
export function findBlockAncestry(
  rootBlockDef: BlockDef,
  createBlock: CreateBlock,
  contextVars: ContextVar[],
  blockId: string
): ChildBlock[] | null {
  const rootBlock = createBlock(rootBlockDef)

  // Return self if true
  if (rootBlock.id === blockId) {
    return [{ blockDef: rootBlockDef, contextVars: contextVars }]
  }

  // For each child
  for (const childBlock of rootBlock.getChildren(contextVars)) {
    if (childBlock.blockDef) {
      const childAncestry: ChildBlock[] | null = findBlockAncestry(
        childBlock.blockDef,
        createBlock,
        childBlock.contextVars,
        blockId
      )
      if (childAncestry) {
        return [{ blockDef: rootBlockDef, contextVars: contextVars } as ChildBlock].concat(childAncestry)
      }
    }
  }

  return null
}

/** Get the entire tree of blocks from a root, including context variables for each */
export function getBlockTree(
  rootBlockDef: BlockDef,
  createBlock: CreateBlock,
  contextVars: ContextVar[]
): ChildBlock[] {
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

/** Create the variables as needed by mwater-expressions */
export function createExprVariables(contextVar: ContextVar[]): Variable[] {
  return contextVar.map((cv) => {
    switch (cv.type) {
      case "row":
        return { id: cv.id, type: "id" as LiteralType, name: { _base: "en", en: cv.name }, idTable: cv.table }
      case "rowset":
        return { id: cv.id, type: "boolean" as LiteralType, name: { _base: "en", en: cv.name }, table: cv.table }
    }

    return {
      id: cv.id,
      type: cv.type as any as LiteralType,
      name: { _base: "en", en: cv.name },
      enumValues: cv.enumValues,
      table: cv.table,
      idTable: cv.idTable
    }
  })
}

/** Create the variable values as needed by mwater-expressions */
export function createExprVariableValues(
  contextVars: ContextVar[],
  contextVarValues: { [contextVarId: string]: any }
): { [variableId: string]: Expr } {
  return _.mapValues(contextVarValues, (value, contextVarId) => {
    const cv = contextVars.find((cv) => cv.id == contextVarId)
    // TODO: For some reason, there can be values with no corresponding context var. Warn for now to unbreak.
    if (!cv) {
      console.warn(`createExprVariableValues: Context variable ${contextVarId} not found`)
      return null
    }

    if (cv.type == "row") {
      return { type: "literal", valueType: "id", idTable: cv.table!, value: value }
    }
    return value
  })
}

function escapeRegex(s: string) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")
}

/** Make a duplicate of a block */
export function duplicateBlockDef(blockDef: BlockDef, createBlock: CreateBlock): BlockDef {
  // Remap any changed ids
  const idMaps: { from: string; to: string }[] = []

  let newBlockDef = createBlock(blockDef).process(createBlock, (bd) => {
    const newId = uuid()
    idMaps.push({ from: bd.id, to: newId })
    return { ...bd, id: newId }
  })!

  // Swap any referenced ids
  let json = JSON.stringify(newBlockDef)
  for (const idMap of idMaps) {
    // Don't swap empty ids or temporary ids (anything shorter than an uuid)
    if (idMap.from.length >= 32) {
      json = json.replace(new RegExp(escapeRegex(JSON.stringify(idMap.from)), "g"), JSON.stringify(idMap.to))
    }
  }
  newBlockDef = JSON.parse(json)

  return newBlockDef
}

/** Validates a context variable/expr combo. Null if ok */
export function validateContextVarExpr(options: {
  contextVars: ContextVar[]
  schema: Schema
  contextVarId: string | null
  expr: Expr
  types?: LiteralType[]
  /** If not set, implies all possible */
  aggrStatuses?: AggrStatus[]
  idTable?: string
  enumValueIds?: string[]
}) {
  let error: string | null

  // Validate cv
  let contextVar: ContextVar | undefined = undefined
  if (options.contextVarId) {
    contextVar = options.contextVars.find(
      (cv) => cv.id === options.contextVarId && (cv.type === "rowset" || cv.type === "row")
    )
    if (!contextVar) {
      return "Context variable not found"
    }
  }

  // Only include context variables before up to an including one referenced, or all context variables if null
  // This is because an outer context var expr cannot reference an inner context variable
  const cvIndex = options.contextVars.findIndex((cv) => cv.id === options.contextVarId)
  const availContextVars = cvIndex >= 0 ? _.take(options.contextVars, cvIndex + 1) : options.contextVars

  const exprValidator = new ExprValidator(options.schema, createExprVariables(availContextVars))

  // Only allow aggregate status of literal and individual for rows
  const aggrStatuses: AggrStatus[] =
    options.aggrStatuses ||
    (contextVar && contextVar.type == "row" ? ["individual", "literal"] : ["aggregate", "individual", "literal"])

  // Validate expr
  error = exprValidator.validateExpr(options.expr, {
    table: contextVar ? contextVar.table : undefined,
    types: options.types,
    aggrStatuses: aggrStatuses,
    idTable: options.idTable,
    enumValueIds: options.enumValueIds
  })
  if (error) {
    return error
  }

  return null
}
