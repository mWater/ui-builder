import * as React from "react";
import { QueryTableBlock } from "./queryTable";
import { Row } from "mwater-expressions";
import { QueryOptions } from "../../../database/Database";
import { InstanceCtx } from "../../../contexts";
import { BlockDef } from "../../blocks";
import "./queryTable.css";
export interface Props {
    block: QueryTableBlock;
    instanceCtx: InstanceCtx;
}
interface State {
    rows?: Row[];
    refreshing: boolean;
    error?: Error;
    /** Which column is being ordered on, if any */
    columnOrderIndex: number | null;
    /** Ordering of column. Default to asc */
    columnOrderDir: "asc" | "desc";
    /** Limit. Use this rather than limit of block def as Show more... may extend it */
    limit: number | null;
    /** True if more rows are available (for soft limits) */
    moreRowsAvail: boolean;
}
/** Instance of a query table */
export default class QueryTableBlockInstance extends React.Component<Props, State> {
    /** Current query options to determine if refresh needed */
    queryOptions?: QueryOptions;
    constructor(props: Props);
    componentDidMount(): void;
    componentDidUpdate(prevProps: Props): void;
    componentWillUnmount(): void;
    /** Change listener to refresh database */
    handleChange: () => void;
    handleShowMore: () => void;
    createQuery(): QueryOptions;
    performQuery(): void;
    createRowInstanceCtx(rowIndex: number): InstanceCtx;
    renderRow(row: Row, rowIndex: number): JSX.Element;
    renderRows(): JSX.Element | JSX.Element[];
    /** Render one header of the table */
    renderHeader(header: BlockDef | null, index: number): JSX.Element;
    /** Render the show more rows at bottom */
    renderShowMore(): JSX.Element | null;
    render(): JSX.Element;
}
export {};
