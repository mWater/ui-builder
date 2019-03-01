import { BlockDef } from "./blocks";
import { ConnectDropTarget } from 'react-dnd';
import "./BlockPlaceholder.css";
interface Props {
    isOver?: boolean;
    connectDropTarget?: ConnectDropTarget;
    onSet?: (blockDef: BlockDef) => void;
}
declare const _default: import("react-dnd").DndComponentClass<Props>;
export default _default;
