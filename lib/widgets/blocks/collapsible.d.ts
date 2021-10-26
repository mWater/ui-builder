import * as React from "react";
import { Block, BlockDef, ContextVar, ChildBlock } from "../blocks";
import { DesignCtx, InstanceCtx } from "../../contexts";
export interface CollapsibleBlockDef extends BlockDef {
    type: "collapsible";
    label: BlockDef | null;
    content: BlockDef | null;
    /** True if collapsible section is initially collapsed */
    initialCollapsed?: boolean;
    /** Width at which collapses whether initially collapsed or not */
    collapseWidth?: number;
}
export declare class CollapsibleBlock extends Block<CollapsibleBlockDef> {
    getChildren(contextVars: ContextVar[]): ChildBlock[];
    validate(): null;
    processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef;
    renderDesign(props: DesignCtx): JSX.Element;
    renderInstance(props: InstanceCtx): JSX.Element;
    renderEditor(props: DesignCtx): JSX.Element;
}
interface Props {
    label: React.ReactNode;
    forceOpen?: boolean;
    initialCollapsed?: boolean;
}
/** Collapsible UI control */
export declare class CollapsibleComponent extends React.Component<Props, {
    collapsed: boolean;
}> {
    constructor(props: Props);
    handleToggle: () => void;
    render(): JSX.Element;
}
export {};
