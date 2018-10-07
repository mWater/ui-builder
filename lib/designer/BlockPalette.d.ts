import * as React from "react";
import { CreateBlock } from "../widgets/blocks";
import { Schema, DataSource } from "mwater-expressions";
interface Props {
    createBlock: CreateBlock;
    schema: Schema;
    dataSource: DataSource;
}
export default class BlockPalette extends React.Component<Props> {
    render(): JSX.Element;
}
export {};
