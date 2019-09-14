import { BlockDef, ContextVar } from './blocks';
/** Widget is named and has a single block with a set of context variables specific to this widget */
export interface WidgetDef {
    id: string;
    name: string;
    description: string;
    blockDef: BlockDef | null;
    /** Context variables that will be passed to inner block */
    contextVars: ContextVar[];
    /** Preview values of context variables. Used only in designer for preview */
    contextVarPreviewValues: {
        [contextVarId: string]: any;
    };
}
export declare type LookupWidget = (id: string) => WidgetDef | null;
