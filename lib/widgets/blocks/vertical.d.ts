/// <reference types="react" />
import { Block, BlockDef, ContextVar, ChildBlock } from '../blocks';
import { DesignCtx, InstanceCtx } from '../../contexts';
export interface VerticalBlockDef extends BlockDef {
    type: "vertical";
    items: BlockDef[];
}
export declare class VerticalBlock extends Block<VerticalBlockDef> {
    readonly id: string;
    getChildren(contextVars: ContextVar[]): ChildBlock[];
    validate(): null;
    processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef;
    canonicalize(): BlockDef | null;
    renderDesign(props: DesignCtx): JSX.Element;
    renderInstance(props: InstanceCtx): JSX.Element;
    getLabel(): string;
}
