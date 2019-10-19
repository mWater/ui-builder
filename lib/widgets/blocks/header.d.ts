/// <reference types="react" />
import CompoundBlock from '../CompoundBlock';
import { BlockDef, ContextVar, ChildBlock } from '../blocks';
import { DesignCtx, InstanceCtx } from '../../contexts';
/** Header with line underneath */
export interface HeaderBlockDef extends BlockDef {
    type: "pageHeader";
    child: BlockDef | null;
}
export declare class HeaderBlock extends CompoundBlock<HeaderBlockDef> {
    getChildren(contextVars: ContextVar[]): ChildBlock[];
    validate(): null;
    processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef;
    renderDesign(props: DesignCtx): JSX.Element;
    renderInstance(props: InstanceCtx): JSX.Element;
}
