import { ConnectDragSource, ConnectDropTarget } from "react-dnd";
import { CreateBlock } from "../widgets/blocks";
interface Props {
    createBlock: CreateBlock;
    onSelect(blockId: string): void;
    /** Injected by react-dnd */
    connectDragSource?: ConnectDragSource;
    /** Injected by react-dnd */
    connectDropTarget?: ConnectDropTarget;
    /** Injected by react-dnd */
    isOver?: boolean;
}
declare const _default: import("react-dnd").DndComponentClass<Props>;
export default _default;
