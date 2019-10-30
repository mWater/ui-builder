import produce from 'immer'
import * as React from 'react';
import { Block, BlockDef, CreateBlock, ContextVar, ChildBlock, createExprVariables } from '../blocks'
import * as _ from 'lodash';
import { Expr, ExprValidator, Table } from 'mwater-expressions';
import ContextVarsInjector from '../ContextVarsInjector';
import { TextInput } from 'react-library/lib/bootstrap';
import { FilterExprComponent } from 'mwater-expressions-ui';
import { PropertyEditor, LabeledProperty, TableSelect } from '../propertyEditors';
import { localize } from '../localization';
import { DesignCtx, InstanceCtx } from '../../contexts';

/** Block which creates a new rowset context variable */
export interface RowsetBlockDef extends BlockDef {
  type: "rowset"

  /** Table that the rowset if from */
  table?: string
  
  /** Name of the rowset context variable */
  name?: string | null

  /** Filter which applies to rows in the rowset */
  filter: Expr

  /** Block which is in the rowset */
  content: BlockDef | null
}

export class RowsetBlock extends Block<RowsetBlockDef> {
  getChildren(contextVars: ContextVar[]): ChildBlock[] {
    if (this.blockDef.content) {
      const contextVar = this.createContextVar()
      return [{ blockDef: this.blockDef.content, contextVars: contextVar ? contextVars.concat([contextVar]) : contextVars }]
    }
    return []
  }

  createContextVar(): ContextVar | null {
    if (this.blockDef.table) {
      return { type: "rowset", id: this.blockDef.id, name: this.blockDef.name || "Unnamed", table: this.blockDef.table }
    }
    return null
  }

  validate(options: DesignCtx) { 
    const exprValidator = new ExprValidator(options.schema, createExprVariables(options.contextVars))
    let error: string | null

    if (!this.blockDef.table) {
      return "Missing table"
    }

    // Validate where
    error = exprValidator.validateExpr(this.blockDef.filter, { table: this.blockDef.table, types: ["boolean"] })
    if (error) {
      return error
    }

    return null
  }
 
  processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef {
    const content = action(this.blockDef.content)
    return produce(this.blockDef, draft => {
      draft.content = content
    })
  }

  renderDesign(props: DesignCtx) {
    const handleSetContent = (blockDef: BlockDef) => {
      props.store.alterBlock(this.id, produce((b: RowsetBlockDef) => { 
        b.content = blockDef 
        return b
      }), blockDef.id)
    }

    // Create props for child
    const contextVar = this.createContextVar()
    let contentProps = props
    
    // Add context variable if knowable
    if (contextVar) {
      contentProps = { ...contentProps, contextVars: props.contextVars.concat([contextVar]) }
    }

    const contentNode = props.renderChildBlock(contentProps, this.blockDef.content, handleSetContent)

    return (
      <div style={{ paddingTop: 5, paddingBottom: 5, border: "dashed 1px #CCC" }}>
        {contentNode}
      </div>
    )
  }

  renderInstance(props: InstanceCtx) { 
    const contextVar = this.createContextVar()!
    
    // Inject context variable
    return <ContextVarsInjector 
      injectedContextVars={[contextVar]} 
      injectedContextVarValues={{ [contextVar.id]: this.blockDef.filter }}
      innerBlock={this.blockDef.content!}
      instanceCtx={props}>
        {(instanceCtx: InstanceCtx, loading: boolean, refreshing: boolean) => {
          if (loading) {
            return <div style={{ color: "#AAA", fontSize: 18, textAlign: "center" }}><i className="fa fa-circle-o-notch fa-spin"/></div>
          }
          return (
            <div style={{ opacity: refreshing ? 0.6 : undefined }}>
              { props.renderChildBlock(instanceCtx, this.blockDef.content) }
            </div>
          )
        }}
      </ContextVarsInjector>
  }

  renderEditor(props: DesignCtx) {
    const handleTableChange = (tableId: string) => {
      const table = props.schema.getTable(tableId)!
      props.store.replaceBlock(produce(this.blockDef, (bd) => {
        bd.table = tableId
        bd.name = bd.name || ("List of " + localize(table.name))
      }))
    }

    return (
      <div>
        <h3>Rowset</h3>
        <LabeledProperty label="Table">
          <TableSelect schema={props.schema} locale={props.locale} value={this.blockDef.table || null} onChange={handleTableChange}/>
        </LabeledProperty>
        <LabeledProperty label="Name">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="name">
            {(value, onChange) => <TextInput value={value || null} onChange={onChange} placeholder="Unnamed" />}
          </PropertyEditor>
        </LabeledProperty>
        { this.blockDef.table ? 
        <LabeledProperty label="Filter">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="filter">
            {(value, onChange) => 
              <FilterExprComponent 
                value={value} 
                onChange={onChange}
                schema={props.schema} 
                dataSource={props.dataSource}
                table={this.blockDef.table!}
                variables={createExprVariables(props.contextVars)}
                />}
          </PropertyEditor>
        </LabeledProperty>
        : null }
      </div>
    )
  }
}
