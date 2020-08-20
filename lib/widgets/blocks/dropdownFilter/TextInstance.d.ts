import React from "react";
import { DropdownFilterBlockDef } from "./dropdownFilter";
import { Schema } from "mwater-expressions";
import { ContextVar } from "../../blocks";
import { Database } from "../../../database/Database";
import { InstanceCtx } from '../../../contexts';
/** Dropdown filter that is a text string. Should search in database for matches */
export default class TextInstance extends React.Component<{
    blockDef: DropdownFilterBlockDef;
    schema: Schema;
    contextVars: ContextVar[];
    value: any;
    database: Database;
    onChange: (value: any) => void;
    locale: string;
    instanceCtx: InstanceCtx;
}> {
    getOptions: (input: string) => Promise<{
        value: any;
        label: any;
    }[]>;
    handleChange: (option: any) => void;
    render(): JSX.Element;
}
