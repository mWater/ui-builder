import * as React from "react";
import { CreateBlock } from "../widgets/blocks";
import { ConnectDragSource } from "react-dnd";
import { Schema, DataSource } from "mwater-expressions";
import { BlockPaletteEntry } from "./blockPaletteEntry";
interface Props {
    entry: BlockPaletteEntry;
    createBlock: CreateBlock;
    schema: Schema;
    dataSource: DataSource;
    connectDragSource?: ConnectDragSource;
}
export default class BlockPaletteItem extends React.Component<Props> {
    renderContents(): React.ReactElement<any>;
    render(): JSX.Element;
}
export {};
