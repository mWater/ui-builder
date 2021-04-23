import produce from 'immer'
import * as React from 'react';
import { BlockDef, ContextVar, ChildBlock, createExprVariables, CreateBlock, Block } from '../blocks'
import * as _ from 'lodash';
import { ExprValidator, Schema, LiteralExpr, Expr, ExprCompiler, ExprUtils, LiteralType } from 'mwater-expressions';
import ContextVarsInjector from '../ContextVarsInjector';
import { TextInput,  Radio } from 'react-library/lib/bootstrap';
import { PropertyEditor, LabeledProperty, TableSelect } from '../propertyEditors';
import { ColumnValuesEditor } from '../columnValues';
import { DesignCtx, InstanceCtx } from '../../contexts';
import { ContextVarExpr } from '../../ContextVarExpr';

/** Block which creates a new row and adds it as a context variable to its content */
export interface AddRowBlockDef extends BlockDef {
  type: "addRow"

  /** Table that the row will be added to */
  table?: string

  /** Context variable (row) to re-use if it has a value. 
   * This allows the add row block to either add a row or just reuse an existing
   * one, making it work for both editing and adding.
   */
  existingContextVarId?: string | null
  
  /** Name of the row context variable (if not using existing) */
  name?: string | null

  /** Expressions to generate column values */
  columnValues: { [columnId: string]: ContextVarExpr }

  /** Block which is in the passed the row */
  content: BlockDef | null
}

export class AddRowBlock extends Block<AddRowBlockDef> {
  getChildren(contextVars: ContextVar[]): ChildBlock[] {
    if (this.blockDef.content) {
      const contextVar = this.createContextVar()
      return [{ blockDef: this.blockDef.content, contextVars: contextVar ? contextVars.concat([contextVar]) : contextVars }]
    }
    return []
  }

  createContextVar(): ContextVar | null {
    // Don't create new context variable if reusing existing
    if (this.blockDef.table && !this.blockDef.existingContextVarId) {
      return { type: "row", id: this.blockDef.id, name: this.blockDef.name || "Added row", table: this.blockDef.table }
    }
    return null
  }

  validate(options: DesignCtx) { 
    let error: string | null

    // Check that table is present
    if (!this.blockDef.table || !options.schema.getTable(this.blockDef.table)) {
      return "Table required"
    }

    // Check that existing context variable from same table
    if (this.blockDef.table && this.blockDef.existingContextVarId) {
      const cv = options.contextVars.find(cv => cv.id == this.blockDef.existingContextVarId)
      if (!cv) {
        return "Existing context variable not found"
      }
      if (cv.table != this.blockDef.table) {
        return "Existing context variable from wrong table"
      }
    }

    // Check each column value
    for (const columnId of Object.keys(this.blockDef.columnValues)) {
      error = this.validateColumnValue(options, columnId)
      if (error) {
        return error
      }
    }
    return null
  }

  validateColumnValue(options: DesignCtx, columnId: string): string | null {
    // Check that column exists
    const column = options.schema.getColumn(this.blockDef.table!, columnId)
    if (!column) {
      return "Column not found"
    }

    const exprValidator = new ExprValidator(options.schema, createExprVariables(options.contextVars))
    const exprUtils = new ExprUtils(options.schema, createExprVariables(options.contextVars))

    // Check context var
    const contextVarExpr: ContextVarExpr = this.blockDef.columnValues[columnId]
    let contextVar: ContextVar | undefined

    if (contextVarExpr.contextVarId) {
      contextVar = options.contextVars.find(cv => cv.id === contextVarExpr.contextVarId)
      if (!contextVar || !contextVar.table) {
        return "Context variable not found"
      }
    }
    else {
      contextVar = undefined
      // Must be literal
      const aggrStatus = exprUtils.getExprAggrStatus(contextVarExpr.expr)
      if (aggrStatus && aggrStatus !== "literal") {
        return "Literal value required"
      }
    }

    // Override for special case of allowing to set joins
    const idTable = column.type == "join" ? column.join!.toTable : column.idTable
    const type = column.type == "join" ? "id" : column.type as LiteralType

    // Validate expr
    let error
    error = exprValidator.validateExpr(contextVarExpr.expr, { 
      table: contextVar ? contextVar.table : undefined, 
      types: [type],
      idTable: idTable,
      aggrStatuses: contextVar && contextVar.type == "rowset" ? ["aggregate", "literal"] : ["individual", "literal"]
    })
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

  /** Get context variable expressions needed to add */
  getContextVarExprs(contextVar: ContextVar): Expr[] {
    // Get ones for the specified context var
    return Object.values(this.blockDef.columnValues).filter(cve => cve.contextVarId === contextVar.id).map(cve => cve.expr)
  }
  
  renderDesign(props: DesignCtx) {
    const handleSetContent = (blockDef: BlockDef) => {
      props.store.alterBlock(this.id, produce((b: AddRowBlockDef) => { 
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
    const contextVar = this.createContextVar() || props.contextVars.find(cv => cv.id == this.blockDef.existingContextVarId)!
    return <AddRowInstance
      blockDef={this.blockDef}
      contextVar={contextVar}
      instanceCtx={props}/>
  }

  renderEditor(props: DesignCtx) {
    return (
      <div>
        <h3>Add Row</h3>
        <LabeledProperty label="Table">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="table">
            {(value, onChange) => 
              <TableSelect schema={props.schema} locale={props.locale} value={value} onChange={t => onChange(t!)}/>
            }
          </PropertyEditor>
        </LabeledProperty>
        { this.blockDef.table ?
        <LabeledProperty label="Mode">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="existingContextVarId">
            {(value, onChange) => 
              <div>
                <Radio key="null" radioValue={null} value={value || null} onChange={onChange}>Always add new row</Radio>
                { props.contextVars.filter(cv => cv.table == this.blockDef.table && cv.type == "row").map(cv => (
                  <Radio key={cv.id} radioValue={cv.id} value={value} onChange={onChange}>Use <i>{cv.name}</i> if it has a value</Radio>
                ))}
              </div>
            }
          </PropertyEditor>
        </LabeledProperty>
        : null }
        { !this.blockDef.existingContextVarId ? 
        <LabeledProperty label="Variable Name">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="name">
            {(value, onChange) => <TextInput value={value || null} onChange={onChange} placeholder="Unnamed" />}
          </PropertyEditor>
        </LabeledProperty>
        : null }
        { this.blockDef.table ? 
        <LabeledProperty label="Column Values">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="columnValues">
            {(value, onChange) => 
              <ColumnValuesEditor 
                value={value} 
                onChange={onChange}
                schema={props.schema} 
                dataSource={props.dataSource}
                table={this.blockDef.table!}
                contextVars={props.contextVars}
                locale={props.locale}
                />}
          </PropertyEditor>
        </LabeledProperty>
        : null }
      </div>
    )
  }
}

interface Props {
  contextVar: ContextVar
  blockDef: AddRowBlockDef
  instanceCtx: InstanceCtx
}

interface State {
  addedRowId: any
}

/** Instance which adds a row and then injects as context variable */
class AddRowInstance extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = { 
      addedRowId: null
    }
  }

  componentDidMount() {
    // Only perform add if not reusing
    if (this.doesNeedAdd()) {
      this.performAdd()
    }
  }

  doesNeedAdd() {
    return !this.props.blockDef.existingContextVarId || !this.props.instanceCtx.contextVarValues[this.props.blockDef.existingContextVarId]
  }

  async performAdd() {
    // Create row to insert
    const row = {}

    for (const columnId of Object.keys(this.props.blockDef.columnValues)) {
      const contextVarExpr: ContextVarExpr = this.props.blockDef.columnValues[columnId]

      row[columnId] = this.props.instanceCtx.getContextVarExprValue(contextVarExpr.contextVarId, contextVarExpr.expr) 
    }

    try {
      const txn = this.props.instanceCtx.database.transaction()
      const addedRowId = await txn.addRow(this.props.blockDef.table!, row)
      await txn.commit()
      this.setState({ addedRowId })
    } catch (err) {
      // TODO localize
      alert("Unable to add row: " + err.message)
      return
    }
  }

  render() {
    if (this.doesNeedAdd()) {
      // Render wait while adding
      if (!this.state.addedRowId) {
        return <div style={{ color: "#AAA", textAlign: "center" }}><i className="fa fa-circle-o-notch fa-spin"/></div>
      }

      // Inject context variable
      return <ContextVarsInjector 
        injectedContextVars={[this.props.contextVar]} 
        injectedContextVarValues={{ [this.props.contextVar.id]: this.state.addedRowId }}
        innerBlock={this.props.blockDef.content}
        instanceCtx={this.props.instanceCtx}>
          {(instanceCtx: InstanceCtx, loading: boolean, refreshing: boolean) => {
            if (loading) {
              return <div style={{ color: "#AAA", textAlign: "center" }}><i className="fa fa-circle-o-notch fa-spin"/></div>
            }
            return (
              <div style={{ opacity: refreshing ? 0.6 : undefined }}>
                { this.props.instanceCtx.renderChildBlock(instanceCtx, this.props.blockDef.content) }
              </div>
            )
          }}
        </ContextVarsInjector>
    }
    else {
      // Just render if add not needed
      return this.props.instanceCtx.renderChildBlock(this.props.instanceCtx, this.props.blockDef.content) 
    }
  }
}