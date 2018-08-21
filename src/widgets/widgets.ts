import { BlockDef, ContextVar } from './blocks';

// Widget is named and has a single block with a set of context variables
export interface WidgetDef {
  id: string; // Unique id (globally)
  name: string; // Name of the block component
  description: string; // Description of the block component
  blockDef: BlockDef | null; // Block that it displays
  contextVars: ContextVar[]; // Context variables that will be passed to inner block
}

export type WidgetLookup = (id: string) => WidgetDef

