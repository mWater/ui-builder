import * as React from "react";
import { QueryTableBlock } from "./queryTable";
import { RenderInstanceProps } from "../../blocks";
import { Row } from "mwater-expressions";
import { QueryOptions } from "../../../database/Database";
interface Props {
    block: QueryTableBlock;
    renderInstanceProps: RenderInstanceProps;
}
interface State {
    rows?: Row[];
    refreshing: boolean;
}
export default class QueryTableBlockInstance extends React.Component<Props, State> {
    /** Current query options to determine if refresh needed */
    queryOptions?: QueryOptions;
    constructor(props: Props);
    componentDidMount(): void;
    componentDidUpdate(prevProps: Props): void;
    createQuery(): QueryOptions;
    performQuery(): void;
    createRowRenderInstanceProps(rowIndex: number): RenderInstanceProps;
    renderRow(row: Row, rowIndex: number): JSX.Element;
    renderRows(): JSX.Element | JSX.Element[];
    render(): JSX.Element;
}
export {};
