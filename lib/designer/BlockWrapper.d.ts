import * as React from "react";
import { BlockDef, DropSide, BlockStore } from "../widgets/blocks";
import { ConnectDragSource, ConnectDropTarget, ConnectDragPreview } from 'react-dnd';
import "./BlockWrapper.css";
interface Props {
    blockDef: BlockDef;
    selectedBlockId: string | null;
    store: BlockStore;
    validationError: string | null;
    /** Injected by react-dnd */
    isOver?: boolean;
    /** Injected by react-dnd */
    connectDragSource?: ConnectDragSource;
    /** Injected by react-dnd */
    connectDropTarget?: ConnectDropTarget;
    /** Injected by react-dnd */
    connectDragPreview?: ConnectDragPreview;
    onSelect(): void;
    onRemove(): void;
}
interface State {
    hoverSide: DropSide | null;
}
/** Wraps a block in a draggable control with an x to remove */
export default class BlockWrapper extends React.Component<Props, State> {
    constructor(props: Props);
    handleClick: (ev: React.MouseEvent<Element>) => void;
    renderHover(): JSX.Element | null;
    render(): React.ReactElement<any>;
}
export {};
