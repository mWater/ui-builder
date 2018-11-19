import * as React from 'react';
import LeafBlock from '../LeafBlock'
import { BlockDef, RenderDesignProps, RenderInstanceProps, RenderEditorProps, ValidateBlockOptions, ContextVar, createExprVariables } from '../blocks'
import { LabeledProperty, LocalizedTextPropertyEditor, PropertyEditor, NumberFormatEditor, ContextVarPropertyEditor, DateFormatEditor, DatetimeFormatEditor } from '../propertyEditors'
import { LocalizedString, localize } from '../localization'
import { Select, Checkbox } from 'react-library/lib/bootstrap';
import { Expr, ExprValidator, ExprUtils, Schema, DataSource } from 'mwater-expressions';
import * as _ from 'lodash';
import { format as d3Format } from 'd3-format';
import { ExprComponent } from 'mwater-expressions-ui';
import ListEditor from '../ListEditor';
import moment from 'moment';

/** Expression which is embedded in the text string */
interface EmbeddedExpr {
  /** Context variable (row or rowset) to use for expression */
  contextVarId: string | null

  /** Expression to be displayed */
  expr: Expr

  /** d3 format of expression for numbers, moment.js format for date (default ll) and datetime (default lll)  */
  format: string | null
}

export interface TextBlockDef extends BlockDef {
  type: "text"
  
  /** Text content */
  text: LocalizedString | null

  style: "p" | "div" | "h1" | "h2" | "h3" | "h4"

  bold?: boolean
  italic?: boolean
  underline?: boolean

  /** Expression embedded in the text string. Referenced by {0}, {1}, etc. */
  embeddedExprs?: EmbeddedExpr[] 
}

export class TextBlock extends LeafBlock<TextBlockDef> {
  getContextVarExprs(contextVar: ContextVar): Expr[] { 
    if (this.blockDef.embeddedExprs) {
      return _.compact(_.map(this.blockDef.embeddedExprs, ee => ee.contextVarId === contextVar.id ? ee.expr : null))
    }
    return []
  }

  validate(options: ValidateBlockOptions) {
    // Validate expressions
    if (this.blockDef.embeddedExprs) {
      for (const embeddedExpr of this.blockDef.embeddedExprs) {
        // Validate cv
        const contextVar = options.contextVars.find(cv => cv.id === embeddedExpr.contextVarId && (cv.type === "rowset" || cv.type === "row"))
        if (!contextVar) {
          return "Context variable required"
        }

        const exprValidator = new ExprValidator(options.schema, createExprVariables(options.contextVars))
        let error: string | null
        
        // Validate expr
        error = exprValidator.validateExpr(embeddedExpr.expr, { table: contextVar.table })
        if (error) {
          return error
        }
      }
    }

    return null 
  }

  renderText(content: React.ReactNode) {
    const style: React.CSSProperties = {}
    if (this.blockDef.bold) {
      style.fontWeight = "bold"
    }
    if (this.blockDef.italic) {
      style.fontStyle = "italic"
    }
    if (this.blockDef.underline) {
      style.textDecoration = "underline"
    }

    return React.createElement(this.blockDef.style, { style: style }, content)
  }
  
  renderDesign(props: RenderDesignProps) {
    const text = localize(this.blockDef.text, props.locale)
    return this.renderText(text ? text : <span className="text-muted">Text</span>)
  }

  renderInstance(props: RenderInstanceProps): React.ReactElement<any> {
    let text = localize(this.blockDef.text, props.locale)

    // Get any embedded expression values
    const exprValues = _.map(this.blockDef.embeddedExprs || [], ee => props.getContextVarExprValue(ee.contextVarId!, ee.expr))

    // Format and replace
    for (let i = 0 ; i < exprValues.length ; i++) {
      let str

      const expr = this.blockDef.embeddedExprs![i].expr
      const exprType = new ExprUtils(props.schema, createExprVariables(props.contextVars)).getExprType(expr)
      const format = this.blockDef.embeddedExprs![i].format
      const value = exprValues[i]

      if (exprType === "number" && value != null) {
        str = d3Format(format || "")(value)
      }
      else if (exprType === "date" && value != null) {
        str = moment(value, moment.ISO_8601).format(format || "ll")
      }
      else if (exprType === "datetime" && value != null) {
        str = moment(value, moment.ISO_8601).format(format || "lll")
      }
      else {
        str = new ExprUtils(props.schema, createExprVariables(props.contextVars)).stringifyExprLiteral(expr, value, props.locale)
      }
  
      text = text.replace(`{${i}}`, str)
    }

    return this.renderText(text)
  }

  renderEditor(props: RenderEditorProps) {
    return (
      <div>
        <LabeledProperty label="Text">
          <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="text">
            {(value, onChange) => 
              <LocalizedTextPropertyEditor value={value} onChange={onChange} locale={props.locale} />
            }
          </PropertyEditor>
        </LabeledProperty>
        <LabeledProperty label="Style">
          <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="style">
            {(value, onChange) => 
              <Select 
                value={value} 
                onChange={onChange}
                options={[
                  { value: "div", label: "Plain Text"},
                  { value: "p", label: "Paragraph"},
                  { value: "h1", label: "Heading 1"},
                  { value: "h2", label: "Heading 2"},
                  { value: "h3", label: "Heading 3"},
                  { value: "h4", label: "Heading 4"}
            ]} /> }
          </PropertyEditor>
        </LabeledProperty>

        <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="bold">
          {(value, onChange) => <Checkbox value={value} onChange={onChange}>Bold</Checkbox>}
        </PropertyEditor>

        <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="italic">
          {(value, onChange) => <Checkbox value={value} onChange={onChange}>Italic</Checkbox>}
        </PropertyEditor>

        <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="underline">
          {(value, onChange) => <Checkbox value={value} onChange={onChange}>Underline</Checkbox>}
        </PropertyEditor>

        <LabeledProperty label="Embedded expressions" help="Reference in text as {0}, {1}, etc.">
          <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="embeddedExprs">
            {(value: EmbeddedExpr[] | null, onChange) => {
              const handleAddEmbeddedExpr = () => {
                onChange((value || []).concat([{ contextVarId: null, expr: null, format: null }]))
              }

              return (
                <div>
                  <ListEditor items={value || []} onItemsChange={onChange}>
                    {(item, onItemChange) => 
                      <EmbeddedExprEditor value={item} onChange={onItemChange} schema={props.schema} dataSource={props.dataSource} contextVars={props.contextVars} />
                    }
                  </ListEditor>
                  <button type="button" className="btn btn-link btn-sm" onClick={handleAddEmbeddedExpr}>
                    + Add Embedded Expression
                  </button>
                </div>
              )
            }}
          </PropertyEditor>
        </LabeledProperty>
      </div>
    )
  }
}

/** Allows editing of an embedded expression */
class EmbeddedExprEditor extends React.Component<{
  value: EmbeddedExpr
  onChange: (embeddedExpr: EmbeddedExpr) => void
  contextVars: ContextVar[]
  schema: Schema
  dataSource: DataSource
}> {

  handleExprChange = (expr: Expr) => {
    const exprType = new ExprUtils(this.props.schema, createExprVariables(this.props.contextVars)).getExprType(this.props.value.expr)
    const newExprType = new ExprUtils(this.props.schema, createExprVariables(this.props.contextVars)).getExprType(expr)
    
    if (newExprType !== exprType) {
      this.props.onChange({ ...this.props.value, expr: expr, format: null })
    }
    else {
      this.props.onChange({ ...this.props.value, expr: expr })
    }
  }

  render() {
    // TODO ensure expressions do not use context variables after the one that has been selected (as the parent injector will not have access to the variable value)

    const contextVar = this.props.contextVars.find(cv => cv.id === this.props.value.contextVarId)
    const exprType = new ExprUtils(this.props.schema, createExprVariables(this.props.contextVars)).getExprType(this.props.value.expr)

    return (
      <div>
        <LabeledProperty label="Row/Rowset Variable">
          <PropertyEditor obj={this.props.value} onChange={this.props.onChange} property="contextVarId">
            {(value, onChange) => <ContextVarPropertyEditor value={value} onChange={onChange} contextVars={this.props.contextVars} types={["row", "rowset"]} />}
          </PropertyEditor>
        </LabeledProperty>
    
        { contextVar && contextVar.table 
          ?
          <LabeledProperty label="Expression">
            <ExprComponent 
              value={this.props.value.expr} 
              onChange={this.handleExprChange} 
              schema={this.props.schema} 
              dataSource={this.props.dataSource} 
              aggrStatuses={["individual", "aggregate", "literal"]}
              variables={createExprVariables(this.props.contextVars)}
              table={contextVar.table!}/>
          </LabeledProperty>
          : null
        }

        { exprType === "number" ?
          <LabeledProperty label="Number Format">
            <PropertyEditor obj={this.props.value} onChange={this.props.onChange} property="format">
              {(value: string, onChange) => (
                <NumberFormatEditor
                  value={value} 
                  onChange={onChange} />
              )}
            </PropertyEditor>
          </LabeledProperty>
          : null
        }

        { exprType === "date" ?
          <LabeledProperty label="Date Format">
            <PropertyEditor obj={this.props.value} onChange={this.props.onChange} property="format">
              {(value: string, onChange) => (
                <DateFormatEditor
                  value={value} 
                  onChange={onChange} />
              )}
            </PropertyEditor>
          </LabeledProperty>
          : null
        }

        { exprType === "datetime" ?
          <LabeledProperty label="Date/time Format">
            <PropertyEditor obj={this.props.value} onChange={this.props.onChange} property="format">
              {(value: string, onChange) => (
                <DatetimeFormatEditor
                  value={value} 
                  onChange={onChange} />
              )}
            </PropertyEditor>
          </LabeledProperty>
          : null
        }
      </div>
    )
    
  }
}

