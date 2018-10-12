import * as React from "react";
import { SearchBlockDef } from "./search";
import { RenderInstanceProps } from "../../blocks";
import { Expr } from "mwater-expressions";
interface Props {
    blockDef: SearchBlockDef;
    renderInstanceProps: RenderInstanceProps;
}
interface State {
    searchText: string;
}
export default class SearchBlockInstance extends React.Component<Props, State> {
    constructor(props: Props);
    createFilter(searchText: string): {
        id: string;
        expr: import("mwater-expressions").OpExpr;
    } | {
        id: string;
        expr: null;
    };
    createExprFilter(expr: Expr, searchText: string, table: string): Expr;
    handleChange: (ev: React.ChangeEvent<HTMLInputElement>) => void;
    render(): JSX.Element;
}
export {};
