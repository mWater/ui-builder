import React from "react";
import { DropdownFilterBlockDef } from "./dropdownFilter";
import { Schema } from "mwater-expressions";
import { ContextVar } from "../../blocks";
import { Database } from "../../../database/Database";
import { InstanceCtx } from '../../../contexts';
/** Dropdown filter that is a text[]. Should search in database for matches, returning value to match */
export default class TextArrInstance extends React.Component<{
    blockDef: DropdownFilterBlockDef;
    schema: Schema;
    contextVars: ContextVar[];
    value: string | undefined;
    database: Database;
    onChange: (value: string | undefined) => void;
    locale: string;
    instanceCtx: InstanceCtx;
}> {
    /** Options to be displayed (unfiltered) */
    options: {
        value: string;
        label: string;
    }[];
    loadOptions(): Promise<{
        value: any;
        label: any;
    }[]>;
    getOptions: (input: string) => Promise<{
        value: string;
        label: string;
    }[]>;
    handleChange: (option: any) => void;
    render(): JSX.Element;
}
