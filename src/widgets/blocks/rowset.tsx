import produce from 'immer'
import * as React from 'react';
import CompoundBlock from '../CompoundBlock';
import { BlockDef, CreateBlock, RenderDesignProps, RenderEditorProps, RenderInstanceProps, ContextVar, ChildBlock, ValidateBlockOptions, createExprVariables } from '../blocks'
import * as _ from 'lodash';
import { Expr, ExprValidator, Table } from 'mwater-expressions';
import ContextVarsInjector from '../ContextVarsInjector';
import Select from 'react-select/lib/Select';
import { localize } from '../localization';
import { TextInput } from 'react-library/lib/bootstrap';
import { FilterExprComponent } from 'mwater-expressions-ui';
import { PropertyEditor, LabeledProperty } from '../propertyEditors';

/** Block which creates a new rowset context variable */
export interface RowsetBlockDef extends BlockDef {
  type: "rowset"

  /** Table that the rowset if from */
  table?: string
  
  /** Name of the rowset context variable */
  name?: string

  /** Filter which applies to rows in the rowset */
  filter: Expr

  /** Block which is in the rowset */
  content: BlockDef | null
}

export class RowsetBlock extends CompoundBlock<RowsetBlockDef> {
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

  validate(options: ValidateBlockOptions) { 
    const exprValidator = new ExprValidator(options.schema, createExprVariables(options.contextVars))
    let error: string | null

    if (!this.blockDef.table) {
      return "Missing table"
    }

    if (!this.blockDef.content) {
      return "Content required"
    }

    // Validate where
    error = exprValidator.validateExpr(this.blockDef.filter, { table: this.blockDef.table, types: ["boolean"] })
    if (error) {
      return error
    }

    return null
  }
 
  processChildren(action: (self: BlockDef) => BlockDef | null): BlockDef {
    return produce(this.blockDef, draft => {
      if (draft.content) {
        draft.content = action(draft.content)
      }
    })
  }

  renderDesign(props: RenderDesignProps) {
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

  renderInstance(props: RenderInstanceProps) { 
    const contentNode = this.blockDef.content ?
    this.createBlock(this.blockDef.content).renderInstance(props) : <div/>

    const contextVar = this.createContextVar()!
    
    // Inject context variable
    return <ContextVarsInjector 
      contextVars={[contextVar]} 
      contextVarValues={{ [contextVar.id]: this.blockDef.filter }}
      createBlock={this.createBlock}
      database={props.database}
      innerBlock={this.blockDef.content!}
      renderInstanceProps={props}
      schema={props.schema}>
        {(renderInstanceProps: RenderInstanceProps, loading: boolean, refreshing: boolean) => {
          if (loading) {
            return <div style={{ color: "#AAA", fontSize: 18, textAlign: "center" }}><i className="fa fa-circle-o-notch fa-spin"/></div>
          }
          return (
            <div style={{ opacity: refreshing ? 0.6 : undefined }}>
              { props.renderChildBlock(renderInstanceProps, this.blockDef.content!) }
            </div>
          )
        }}
      </ContextVarsInjector>
  }

  renderEditor(props: RenderEditorProps) {
    const tables = props.schema.getTables()
    const getOptionLabel = (table: Table) => localize(table.name, props.locale)
    const getOptionValue = (table: Table) => table.id

    return (
      <div>
        <LabeledProperty label="Table">
          <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="table">
            {(value, onChange) => {
              const handleTableChange = (table: Table) => {
                onChange(table.id)
              }
            
              return <Select 
                value={tables.find(t => t.id === value)} 
                onChange={handleTableChange} 
                getOptionLabel={getOptionLabel}
                getOptionValue={getOptionValue}
              />
            }}
          </PropertyEditor>
        </LabeledProperty>
        <LabeledProperty label="Name">
          <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="name">
            {(value, onChange) => <TextInput value={value} onChange={onChange} placeholder="Unnamed" />}
          </PropertyEditor>
        </LabeledProperty>
        { this.blockDef.table ? 
        <LabeledProperty label="Filter">
          <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="name">
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
