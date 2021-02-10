import * as React from "react";
import { ContextVar } from "./widgets/blocks";
import { Schema, DataSource } from "mwater-expressions";
/** Allows editing of the value for one context variable */
export declare class ContextVarValueEditor extends React.Component<{
    contextVar: ContextVar;
    contextVarValue: any;
    onContextVarValueChange: (value: any) => void;
    schema: Schema;
    dataSource: DataSource;
    /** Available context vars for expression builder */
    availContextVars: ContextVar[];
}> {
    render(): JSX.Element;
}
/** Validate a context var value */
export declare function validateContextVarValue(schema: Schema, contextVar: ContextVar, allContextVars: ContextVar[], value: any): string | null;
