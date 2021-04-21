import * as React from "react";
import { ContextVar, createExprVariables } from "./widgets/blocks";
import { Schema, DataSource, ExprValidator } from "mwater-expressions";
import { ExprComponent, IdLiteralComponent } from "mwater-expressions-ui";

/** Allows editing of the value for one context variable */
export class ContextVarValueEditor extends React.Component<{
  contextVar: ContextVar;
  contextVarValue: any
  onContextVarValueChange: (value: any) => void;
  schema: Schema;
  dataSource: DataSource;
  /** Available context vars for expression builder */
  availContextVars: ContextVar[];
}> {
  render() {
    const value = this.props.contextVarValue
    
    if (this.props.contextVar.type === "row" && this.props.schema.getTable(this.props.contextVar.table!)) {
      return <IdLiteralComponent
        schema={this.props.schema}
        dataSource={this.props.dataSource}
        idTable={this.props.contextVar.table!}
        value={value}
        onChange={this.props.onContextVarValueChange} />;
    }

    if (this.props.contextVar.type === "rowset") {
      return <ExprComponent
        schema={this.props.schema}
        dataSource={this.props.dataSource}
        table={this.props.contextVar.table!}
        types={["boolean"]}
        value={value}
        onChange={this.props.onContextVarValueChange}
        variables={createExprVariables(this.props.availContextVars)} />;
    }

    return <ExprComponent
      schema={this.props.schema}
      dataSource={this.props.dataSource}
      table={this.props.contextVar.table || null}
      types={[this.props.contextVar.type]}
      idTable={this.props.contextVar.idTable}
      enumValues={this.props.contextVar.enumValues}
      value={value}
      onChange={this.props.onContextVarValueChange}
      variables={createExprVariables(this.props.availContextVars)}
      preferLiteral />;
  }
}

/** Validate a context var value */
export function validateContextVarValue(schema: Schema, contextVar: ContextVar, allContextVars: ContextVar[], value: any): string | null {
  const exprValidator = new ExprValidator(schema, createExprVariables(allContextVars))

  // Check type
  if (contextVar.type == "row") {
    if (value != null && typeof(value) != "string" && typeof(value) != "number") {
      return `Invalid value for row variable ${contextVar.name}`
    }
  }
  else if (contextVar.type == "rowset") {
    // rowset must be a boolean expression
    const error = exprValidator.validateExpr(value, { table: contextVar.table, types: ["boolean"] })
    if (error) {
      return error
    }
  }
  else {
    const error = exprValidator.validateExpr(value, { types: [contextVar.type] })
    if (error) {
      return error
    }
  }

  return null
}
