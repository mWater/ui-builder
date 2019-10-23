import produce from 'immer'
import * as React from 'react';
import * as _ from 'lodash'
import CompoundBlock from '../../CompoundBlock';
import { BlockDef, ContextVar, ChildBlock, createExprVariables } from '../../blocks'
import { Expr, Schema, ExprValidator, LocalizedString, Row } from 'mwater-expressions';
import { OrderBy } from '../../../database/Database';
import QueryRepeatBlockInstance from './QueryRepeatBlockInstance';
import { LabeledProperty, PropertyEditor, ContextVarPropertyEditor, OrderByArrayEditor, LocalizedTextPropertyEditor } from '../../propertyEditors';
import { NumberInput, Checkbox, Select } from 'react-library/lib/bootstrap';
import { ExprComponent } from 'mwater-expressions-ui';
import { DesignCtx, InstanceCtx } from '../../../contexts';

export interface QueryRepeatBlockDef extends BlockDef {
  type: "queryRepeat"

  /** Contents to repeat */
  content: BlockDef | null

  /** Separator between items */
  separator: "none" | "solid_line" | "page_break"

  /** Id of context variable of rowset for table to use */
  rowsetContextVarId: string | null

  limit: number | null
  where: Expr
  orderBy: OrderBy[] | null

  /** Message to display when there are no rows */
  noRowsMessage?: LocalizedString | null
}

export class QueryRepeatBlock extends CompoundBlock<QueryRepeatBlockDef> {
  getChildren(contextVars: ContextVar[]): ChildBlock[] {
    // Get rowset context variable
    const rowsetCV = contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId)

    if (this.blockDef.content) {
      return [{ 
        blockDef: this.blockDef.content, 
        contextVars: rowsetCV ? contextVars.concat(this.createRowContextVar(rowsetCV)) : contextVars 
      }]
    }
    return []
  }

  validate(options: DesignCtx) { 
    // Validate rowset
    const rowsetCV = options.contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId && cv.type === "rowset")
    if (!rowsetCV) {
      return "Rowset required"
    }

    const exprValidator = new ExprValidator(options.schema, createExprVariables(options.contextVars))
    let error: string | null
    
    // Validate where
    error = exprValidator.validateExpr(this.blockDef.where, { table: rowsetCV.table })
    if (error) {
      return error
    }

    // TODO Validate order by

    return null
  }

  processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef {
    const content = action(this.blockDef.content)

    return produce(this.blockDef, draft => { draft.content = content })
  }

  /** Create the context variable used */
  createRowContextVar(rowsetCV: ContextVar): ContextVar {
    return { id: this.getRowContextVarId(), name: "Table row", type: "row", table: rowsetCV.table }
  }

  getRowContextVarId() {
    return this.blockDef.id + "_row"
  }

  /** Get list of expressions used in a row by content blocks */
  getRowExprs(contextVars: ContextVar[], ctx: DesignCtx | InstanceCtx): Expr[] {
    const rowsetCV = contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId && cv.type === "rowset")
    if (!rowsetCV) {
      return []
    }

    let exprs: Expr[] = []
    
    const rowCV = this.createRowContextVar(rowsetCV)

    // Get expressions for content
    if (this.blockDef.content) {
      exprs = exprs.concat(ctx.createBlock(this.blockDef.content).getSubtreeContextVarExprs(rowCV, {
        ...ctx,
        contextVars: contextVars.concat([rowCV])
      }))
    }
    return exprs
  }

  getContextVarExprs(): Expr[] { 
    return [] 
  }

  /** 
   * Get the value of the row context variable for a specific row. 
   * Row should have fields e0, e1, etc. to represent expressions. If singleRow mode, should have id field
   * contextVars: includes rowsetCV and row one
   */
  getRowContextVarValue(row: Row, rowExprs: Expr[], schema: Schema, rowsetCV: ContextVar, contextVars: ContextVar[]): any {
    return row.id
  }

  renderDesign(props: DesignCtx) {
    const setContent = (blockDef: BlockDef) => {
      props.store.alterBlock(this.id, produce(b => {
        b.content = blockDef
      }), blockDef.id)
    }

    const rowsetCV = props.contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId && cv.type === "rowset")
    let contentProps = props
    
    // Add context variable if knowable
    if (rowsetCV) {
      contentProps = { ...contentProps, contextVars: props.contextVars.concat([this.createRowContextVar(rowsetCV)]) }
    }

    return (
      props.renderChildBlock(contentProps, this.blockDef.content, setContent)
    )
  }

  renderInstance(props: InstanceCtx) {
    return <QueryRepeatBlockInstance block={this} instanceCtx={props}/>
  }

  renderEditor(props: DesignCtx) {
    // Get rowset context variable
    const rowsetCV = props.contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId)

    const rowCV = rowsetCV ? this.createRowContextVar(rowsetCV) : null

    const separatorOptions = [
      { value: "none", label: "None" },
      { value: "solid_line", label: "Solid Line" },
      { value: "page_break", label: "Page Break" }
    ]

    return (
      <div>
        <LabeledProperty label="Rowset">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="rowsetContextVarId">
            {(value, onChange) => <ContextVarPropertyEditor value={value} onChange={onChange} contextVars={props.contextVars} types={["rowset"]} />}
          </PropertyEditor>
        </LabeledProperty>

        <LabeledProperty label="Separator">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="separator">
            {(value, onChange) => <Select value={value} onChange={onChange} options={separatorOptions} />}
          </PropertyEditor>
        </LabeledProperty>

        { rowsetCV ?
          <LabeledProperty label="Filter">
            <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="where">
              {(value: Expr, onChange) => (
                  <ExprComponent 
                    value={value} 
                    onChange={onChange} 
                    schema={props.schema} 
                    dataSource={props.dataSource} 
                    types={["boolean"]}
                    variables={createExprVariables(props.contextVars)}
                    table={rowsetCV!.table!}/>
                )}
            </PropertyEditor>
          </LabeledProperty>
        : null }

        { rowCV ? 
        <LabeledProperty label="Ordering">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="orderBy">
            {(value, onChange) => 
              <OrderByArrayEditor 
                value={value} 
                onChange={onChange} 
                schema={props.schema} 
                dataSource={props.dataSource} 
                contextVars={props.contextVars}
                table={rowsetCV!.table!} /> }
          </PropertyEditor>
        </LabeledProperty>
        : null }

        <LabeledProperty label="Maximum rows">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="limit">
            {(value, onChange) => <NumberInput value={value} onChange={onChange} decimal={false} />}
          </PropertyEditor>
        </LabeledProperty>

        <LabeledProperty label="Message to display when no rows">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="noRowsMessage">
            {(value, onChange) => <LocalizedTextPropertyEditor value={value} onChange={onChange} locale={props.locale} />}
          </PropertyEditor>
        </LabeledProperty>
      </div>
    )
  }
}

