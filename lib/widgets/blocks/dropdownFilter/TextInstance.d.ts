/// <reference types="react" />
import { DropdownFilterBlockDef } from "./dropdownFilter";
import { Schema } from "mwater-expressions";
import { ContextVar } from "../../blocks";
import { Database } from "../../../database/Database";
import { InstanceCtx } from '../../../contexts';
/** Dropdown filter that is a text string. Should search in database for matches */
export default function TextInstance(props: {
    blockDef: DropdownFilterBlockDef;
    schema: Schema;
    contextVars: ContextVar[];
    value: any;
    database: Database;
    onChange: (value: any) => void;
    locale: string;
    instanceCtx: InstanceCtx;
}): JSX.Element;
