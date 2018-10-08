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
interface State {
    searchText: string;
}
export default class BlockPalette extends React.Component<Props, State> {
    constructor(props: Props);
    handleSearchChange: (ev: any) => void;
    render(): JSX.Element;
}
export {};
