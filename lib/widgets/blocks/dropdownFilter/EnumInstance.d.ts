import React from "react";
import { DropdownFilterBlockDef } from "./dropdownFilter";
import { Schema } from "mwater-expressions";
import { ContextVar } from "../../blocks";
export default class EnumInstance extends React.Component<{
    blockDef: DropdownFilterBlockDef;
    schema: Schema;
    contextVars: ContextVar[];
    value: any;
    onChange: (value: any) => void;
    locale: string;
}> {
    render(): JSX.Element;
}
