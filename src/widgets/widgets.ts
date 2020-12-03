import { BlockDef, ContextVar } from './blocks';

/** Widget is named and has a single block with a set of context variables specific to this widget */
export interface WidgetDef {
  /** Unique id (globally) */
  id: string 

  /** Name of the block component */
  name: string 

  /** Description of the block component */
  description: string 

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
}

export type LookupWidget = (id: string) => WidgetDef | null
