import { ConnectDragSource } from "react-dnd";
interface Props {
    onSelect(blockId: string): void;
    connectDragSource?: ConnectDragSource;
}
declare const _default: import("react-dnd").DndComponentClass<Props>;
export default _default;
