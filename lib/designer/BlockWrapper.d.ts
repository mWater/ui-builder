import { BlockDef, BlockStore } from "../widgets/blocks";
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
declare const _default: import("react-dnd").DndComponentClass<Props>;
export default _default;
