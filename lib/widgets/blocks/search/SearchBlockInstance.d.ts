import * as React from "react";
import { SearchBlockDef } from "./search";
import { RenderInstanceProps, Filter } from "../../blocks";
import { Expr } from "mwater-expressions";
interface Props {
    blockDef: SearchBlockDef;
    renderInstanceProps: RenderInstanceProps;
}
interface State {
    searchText: string;
}
/** Search block that filters the rowset */
export default class SearchBlockInstance extends React.Component<Props, State> {
    constructor(props: Props);
    createFilter(searchText: string): Filter;
    createExprFilter(expr: Expr, searchText: string, table: string): Expr;
    handleChange: (value: string) => void;
    render(): JSX.Element;
}
interface SearchControlProps {
    value: string;
    onChange?: (value: string) => void;
    placeholder?: string;
}
/** Simple input box with magnifying glass */
export declare class SearchControl extends React.Component<SearchControlProps> {
    private inputRef;
    handleChange: (ev: React.ChangeEvent<HTMLInputElement>) => void;
    focus(): void;
    render(): JSX.Element;
}
export {};
