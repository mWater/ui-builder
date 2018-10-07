import * as React from "react";
import { BlockDef, CreateBlock } from "../widgets/blocks";
import { ConnectDragSource } from "react-dnd";
import { Schema, DataSource } from "mwater-expressions";
interface Props {
    title?: string;
    blockDef: BlockDef;
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
