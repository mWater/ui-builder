import * as React from "react";
import { CreateBlock } from "../widgets/blocks";
import { Schema, DataSource } from "mwater-expressions";
import { BlockPaletteEntry } from "./blockPaletteEntry";
interface Props {
    createBlock: CreateBlock;
    schema: Schema;
    dataSource: DataSource;
    entries: BlockPaletteEntry[];
}
export default class BlockPalette extends React.Component<Props> {
    render(): JSX.Element;
}
export {};
