import * as React from "react";
import { SearchBlockDef } from "./search";
import { InstanceCtx } from "../../../contexts";
/** Search block that filters the rowset */
declare const SearchBlockInstance: (props: {
    blockDef: SearchBlockDef;
    instanceCtx: InstanceCtx;
}) => JSX.Element;
export default SearchBlockInstance;
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
