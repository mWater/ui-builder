import * as _ from 'lodash';
import produce from 'immer'
import { ExprComponent } from 'mwater-expressions-ui';
import { default as React, useState, useEffect } from 'react';
import { ExprValidator, Schema, Expr, LocalizedString, DataSource } from 'mwater-expressions';
import { BlockDef, RenderDesignProps, RenderEditorProps, RenderInstanceProps, ContextVar, ValidateBlockOptions, createExprVariables } from '../blocks'
import { PropertyEditor, LabeledProperty, ContextVarPropertyEditor, LocalizedTextPropertyEditor } from '../propertyEditors';
import ListEditor from '../ListEditor';
import { localize } from '../localization';
import LeafBlock from '../LeafBlock';
import { Checkbox } from 'react-library/lib/bootstrap';

/** Block that appears when one or more validation conditions fail */
export interface ValidationBlockDef extends BlockDef {
  type: "validation"

  /** Validations to apply */
  validations: Validation[]

  /** True if validates immediately rather than waiting for validation on save */
  immediate?: boolean
}

/** Single validation to test */
interface Validation {
  /** Context variable (row or rowset) to use for expression */
  contextVarId: string | null

  /** Expression that must be true to pass */
  condition: Expr

  /** Message to display if not true */
  message: LocalizedString | null
}

export class ValidationBlock extends LeafBlock<ValidationBlockDef> {
  validate(options: ValidateBlockOptions) { 
    let error: string | null

    for (const validation of this.blockDef.validations) {
      // Validate cv
      const contextVar = options.contextVars.find(cv => cv.id === validation.contextVarId && (cv.type === "rowset" || cv.type === "row"))
      if (!contextVar) {
        return "Context variable required"
      }
  
      const exprValidator = new ExprValidator(options.schema, createExprVariables(options.contextVars))
      
      // Validate expr
      error = exprValidator.validateExpr(this.blockDef.expr, { table: contextVar.table, types: ["boolean"] })
      if (error) {
        return error
      }

      // Check message
      if (!validation.message) {
        return "Message required"
      }
    }
    return null
  }

  /** Get context variable expressions needed */
  getContextVarExprs(contextVar: ContextVar): Expr[] {
    return this.blockDef.validations.filter(v => v.contextVarId == contextVar.id).map(v => v.condition)
  }
  
  renderDesign(props: RenderDesignProps) {
    return <div className="text-muted"><i className="fa fa-check"/> Validation</div>
  }

  renderInstance(props: RenderInstanceProps) { 
    return <ValidationBlockInstance renderProps={props} blockDef={this.blockDef} />
  }

  renderEditor(props: RenderEditorProps) {
    const handleAdd = () => {
      props.onChange(produce(this.blockDef, (bd) => {
        bd.validations.push({ contextVarId: null, condition: null, message: null })
      }))
    }

    return (
      <div>
        <h3>Validation</h3>
        <LabeledProperty label="Validations">
          <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="validations">
            {(validations, onValidationsChange) =>
              <ListEditor items={validations} onItemsChange={onValidationsChange}>
                {(validation: Validation, onValidationChange) => 
                  <ValidationEditor 
                    validation={validation}
                    onValidationsChange={onValidationChange}
                    contextVars={props.contextVars} 
                    schema={props.schema} 
                    dataSource={props.dataSource}
                    locale={props.locale}
                  />
                }
              </ListEditor>
            }
          </PropertyEditor>
          <button type="button" className="btn btn-link btn-sm" onClick={handleAdd}>
            <i className="fa fa-plus"/> Add Validation
          </button>
        </LabeledProperty>
        <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="immediate">
          {(value, onChange) => <Checkbox value={value} onChange={onChange}>Validate Immediately</Checkbox>}
        </PropertyEditor>
      </div>
    )
  }
}

/** Editor for a single validation */
const ValidationEditor = (props: {
  validation: Validation
  onValidationsChange: (validation: Validation) => void
  contextVars: ContextVar[]
  schema: Schema
  dataSource: DataSource
  locale: string
}) => {
  const contextVar = props.contextVars.find(cv => cv.id === props.validation.contextVarId)
  
  return (
    <div>
      <LabeledProperty label="Row/Rowset Variable">
        <PropertyEditor obj={props.validation} onChange={props.onValidationsChange} property="contextVarId">
          {(value, onChange) => <ContextVarPropertyEditor value={value} onChange={onChange} contextVars={props.contextVars} types={["row", "rowset"]} />}
        </PropertyEditor>
      </LabeledProperty>

      { contextVar && contextVar.table ?
        <LabeledProperty label="Condition that must be true">
          <PropertyEditor obj={props.validation} onChange={props.onValidationsChange} property="condition">
            { (value, onChange) => 
              <ExprComponent 
                value={value} 
                onChange={onChange} 
                schema={props.schema} 
                dataSource={props.dataSource} 
                types={["boolean"]}
                aggrStatuses={["aggregate", "individual", "literal"]}
                variables={createExprVariables(props.contextVars)}
                table={contextVar.table!}/>
            }
          </PropertyEditor>
        </LabeledProperty>
        : null }

      <LabeledProperty label="Error Message">
        <PropertyEditor obj={props.validation} onChange={props.onValidationsChange} property="message">
          { (value, onChange) => 
            <LocalizedTextPropertyEditor value={value} onChange={onChange} locale={props.locale} />
          }
        </PropertyEditor>
      </LabeledProperty>
    </div>
  )  
}

const getValidationErrors = (blockDef: ValidationBlockDef,  renderProps: RenderInstanceProps) => {
  const errors: string[] = []

  // Check validations
  for (const validation of blockDef.validations) {
    // Get value of condition
    const value = renderProps.getContextVarExprValue(validation.contextVarId!, validation.condition)
    if (value !== true) {
      errors.push(localize(validation.message, renderProps.locale))
    }
  }

  return errors
}

const ValidationBlockInstance = (props: {
  blockDef: ValidationBlockDef
  renderProps: RenderInstanceProps
}) => {
  // True if validating
  const [validating, setValidating] = useState(props.blockDef.immediate || false)

  const validate = () => {
    // Now validating
    setValidating(true) 

    const errors = getValidationErrors(props.blockDef, props.renderProps)
    if (errors.length > 0) {
      return errors[0]
    }
    return null
  }

  // Register for validation
  useEffect(() => {
    return props.renderProps.registerForValidation(validate)
  }, [])

  // If not validating, null
  if (!validating) {
    return null
  }

  // Get errors
  const errors = getValidationErrors(props.blockDef, props.renderProps)
  if (errors.length == 0) {
    return null
  }

  return <div className="alert alert-danger">
    { errors.map(e => <div><i className="fa fa-exclamation-triangle"/> {e}</div>) }
  </div>
}