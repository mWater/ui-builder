/// <reference types="react" />
import { InstanceCtx } from "../../../contexts";
import { GanttChartBlock } from "./GanttChart";
import { GanttChartRow } from "react-library/lib/GanttChart";
export declare function GanttChartInstance(props: {
    block: GanttChartBlock;
    ctx: InstanceCtx;
}): JSX.Element;
/** Results of the query. Note: This is *not* a chart row, which is a different structure and order! */
export interface GanttQueryRow {
    id: string | number;
    label: string | null;
    startDate: string | null;
    endDate: string | null;
    parent: string | number | null;
    order: any;
}
/** Chart rows with extra fields */
export interface EnhancedChartRow extends GanttChartRow {
    id: string | number;
}
/** Performs operation to convert from query rows to chart rows
 * which involves making the results into a sorted tree and then
 * returning the rows in depth-first order, adding any labels as
 * required.
 * prefixNumber adds 1.1, 1.2.3, etc before label
 */
export declare function createChartRows(options: {
    queryRows: GanttQueryRow[];
    getColor: (queryRow: GanttQueryRow) => string;
    prefixNumber: boolean;
}): EnhancedChartRow[];
