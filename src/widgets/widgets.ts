import { BaseCtx, DesignCtx } from "../contexts"
import { validateContextVarValue } from "../contextVarValues"
import { BlockDef, ContextVar, getBlockTree, NullBlockStore } from "./blocks"

/** Widget is named and has a single block with a set of context variables specific to this widget */
export interface WidgetDef {
  /** Unique id (globally) */
  id: string

  /** Name of the widget */
  name: string

  /** Description of the widget */
  description: string

  /** Optional grouping of this widget */
  group?: string

  /** Block that it displays */
  blockDef: BlockDef | null

  /** Context variables that act as arguments that will be passed to inner block */
  contextVars: ContextVar[]

  /** Preview values of context variables. Used only in designer for preview */
  contextVarPreviewValues: { [contextVarId: string]: any }

  /** Context variables that are created for this widget and are not passed in. */
  privateContextVars?: ContextVar[]

  /** Values of private context variables */
  privateContextVarValues?: { [contextVarId: string]: any }

  /** True to virtualize database in preview. Default true */
  virtualizeDatabaseInPreview?: boolean

  /** Size of margins when displaying widget in page. Default is "normal" */
  pageMargins?: "normal" | "none"
}

export type LookupWidget = (id: string) => WidgetDef | null

/** Validate a widget, optionally also validating all children */
export function validateWidget(widgetDef: WidgetDef, ctx: BaseCtx, includeChildren: boolean) {
  if (!widgetDef.blockDef) {
    return null
  }

  const globalContextVars = ctx.globalContextVars || []

  // Validate context var values
  for (const cv of widgetDef.contextVars) {
    const error = validateContextVarValue(
      ctx.schema,
      cv,
      globalContextVars.concat(widgetDef.contextVars),
      widgetDef.contextVarPreviewValues[cv.id]
    )
    if (error) {
      return error
    }
  }

  // Validate private context var values
  const privateContextVars = widgetDef.privateContextVars || []
  for (const cv of privateContextVars) {
    const error = validateContextVarValue(
      ctx.schema,
      cv,
      globalContextVars.concat(widgetDef.contextVars.concat(privateContextVars)),
      (widgetDef.privateContextVarValues || {})[cv.id]
    )
    if (error) {
      return error
    }
  }

  if (includeChildren) {
    const contextVars = globalContextVars.concat(widgetDef.contextVars).concat(privateContextVars)

    for (const childBlock of getBlockTree(widgetDef.blockDef, ctx.createBlock, contextVars, ctx.schema)) {
      const block = ctx.createBlock(childBlock.blockDef)

      // Create design context for validating block
      const blockDesignCtx: DesignCtx = {
        ...ctx,
        dataSource: ctx.dataSource!,
        contextVars: childBlock.contextVars,
        store: new NullBlockStore(),
        blockPaletteEntries: [],
        selectedId: null,
        renderChildBlock: () => {
          throw new Error("Not implemented")
        }
      }

      const error = block.validate(blockDesignCtx)

      if (error) {
        return error
      }
    }
  }

  return null
}
