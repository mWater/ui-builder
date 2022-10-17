import _ from "lodash"
import produce from "immer"
import { default as React, useState, useEffect, useRef } from "react"
import { ExprValidator, Schema, Expr, LocalizedString, DataSource } from "mwater-expressions"
import { BlockDef, ContextVar, createExprVariables, validateContextVarExpr } from "../blocks"
import {
  PropertyEditor,
  LabeledProperty,
  ContextVarPropertyEditor,
  LocalizedTextPropertyEditor,
  ContextVarAndExprPropertyEditor
} from "../propertyEditors"
import ListEditor from "../ListEditor"
import { localize } from "../localization"
import LeafBlock from "../LeafBlock"
import { Checkbox } from "react-library/lib/bootstrap"
import { DesignCtx, InstanceCtx } from "../../contexts"
import { getScrollParent } from "../scrolling"

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
  validate(options: DesignCtx) {
    let error: string | null

    for (const validation of this.blockDef.validations) {
      error = validateContextVarExpr({
        schema: options.schema,
        contextVars: options.contextVars,
        contextVarId: validation.contextVarId,
        expr: validation.condition,
        types: ["boolean"]
      })
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
    return this.blockDef.validations.filter((v) => v.contextVarId == contextVar.id).map((v) => v.condition)
  }

  renderDesign(props: DesignCtx) {
    return (
      <div className="text-muted">
        <i className="fa fa-check" /> Validation
      </div>
    )
  }

  renderInstance(props: InstanceCtx) {
    return <ValidationBlockInstance renderProps={props} blockDef={this.blockDef} />
  }

  renderEditor(props: DesignCtx) {
    const handleAdd = () => {
      props.store.replaceBlock(
        produce(this.blockDef, (bd) => {
          bd.validations.push({ contextVarId: null, condition: null, message: null })
        })
      )
    }

    return (
      <div>
        <h3>Validation</h3>
        <LabeledProperty label="Validations">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="validations">
            {(validations, onValidationsChange) => (
              <ListEditor items={validations} onItemsChange={onValidationsChange}>
                {(validation: Validation, onValidationChange) => (
                  <ValidationEditor
                    validation={validation}
                    onValidationChange={onValidationChange}
                    contextVars={props.contextVars}
                    schema={props.schema}
                    dataSource={props.dataSource}
                    locale={props.locale}
                  />
                )}
              </ListEditor>
            )}
          </PropertyEditor>
          <button type="button" className="btn btn-link btn-sm" onClick={handleAdd}>
            <i className="fa fa-plus" /> Add Validation
          </button>
        </LabeledProperty>
        <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="immediate">
          {(value, onChange) => (
            <Checkbox value={value} onChange={onChange}>
              Validate Immediately
            </Checkbox>
          )}
        </PropertyEditor>
      </div>
    )
  }
}

/** Editor for a single validation */
const ValidationEditor = (props: {
  validation: Validation
  onValidationChange: (validation: Validation) => void
  contextVars: ContextVar[]
  schema: Schema
  dataSource: DataSource
  locale: string
}) => {
  return (
    <div>
      <LabeledProperty label="Condition that must be true">
        <ContextVarAndExprPropertyEditor
          contextVars={props.contextVars}
          schema={props.schema}
          dataSource={props.dataSource}
          aggrStatuses={["individual", "aggregate", "literal"]}
          types={["boolean"]}
          contextVarId={props.validation.contextVarId}
          expr={props.validation.condition}
          onChange={(contextVarId, condition) => {
            props.onValidationChange({ ...props.validation, contextVarId, condition })
          }}
        />
      </LabeledProperty>

      <LabeledProperty label="Error Message" hint="Shown if condition is *not* true">
        <PropertyEditor obj={props.validation} onChange={props.onValidationChange} property="message">
          {(value, onChange) => <LocalizedTextPropertyEditor value={value} onChange={onChange} locale={props.locale} />}
        </PropertyEditor>
      </LabeledProperty>
    </div>
  )
}

const getValidationErrors = (blockDef: ValidationBlockDef, renderProps: InstanceCtx) => {
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

const ValidationBlockInstance = (props: { blockDef: ValidationBlockDef; renderProps: InstanceCtx }) => {
  // True if validating
  const [validating, setValidating] = useState(props.blockDef.immediate || false)

  const controlRef = useRef<HTMLDivElement>(null)

  const validate = (isFirstError: boolean) => {
    // Now validating
    setValidating(true)

    const errors = getValidationErrors(props.blockDef, props.renderProps)
    if (errors.length > 0) {
      // Scroll into view if first error (check scrollIntoView for test environments without that function)
      if (isFirstError && controlRef.current && controlRef.current.scrollIntoView) {
        controlRef.current.scrollIntoView(true)

        // Add some padding
        const scrollParent = getScrollParent(controlRef.current)
        if (scrollParent) {
          scrollParent.scrollBy(0, -30)
        }
      }

      return ""
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

  return (
    <div className="alert alert-danger" ref={controlRef}>
      {errors.map((e, index) => (
        <div key={index}>
          <i className="fa fa-exclamation-triangle" /> {e}
        </div>
      ))}
    </div>
  )
}
