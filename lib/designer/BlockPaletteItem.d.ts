import { CreateBlock } from "../widgets/blocks";
import { ConnectDragSource } from "react-dnd";
import { Schema, DataSource } from "mwater-expressions";
import { BlockPaletteEntry } from "./blockPaletteEntries";
interface Props {
    entry: BlockPaletteEntry;
    createBlock: CreateBlock;
    schema: Schema;
    dataSource: DataSource;
    connectDragSource?: ConnectDragSource;
}
declare const _default: import("react-dnd").DndComponentClass<Props>;
export default _default;
