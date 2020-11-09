import * as React from 'react';
import { ContextVar, createExprVariables } from '../blocks'
import { LabeledProperty, LocalizedTextPropertyEditor, PropertyEditor, EmbeddedExprsEditor } from '../propertyEditors'
import { localize } from '../localization'
import { Expr, LocalizedString, ExprUtils } from 'mwater-expressions';
import * as _ from 'lodash';
import { EmbeddedExpr, formatEmbeddedExprString, validateEmbeddedExprs } from '../../embeddedExprs';
import { DesignCtx, InstanceCtx } from '../../contexts';
import { TextualBlockDef, TextualBlock } from './textual';

export interface TextBlockDef extends TextualBlockDef {
  type: "text"
  
  /** Text content */
  text: LocalizedString | null

  /** Expression embedded in the text string. Referenced by {0}, {1}, etc. */
  embeddedExprs?: EmbeddedExpr[] 
}

export class TextBlock extends TextualBlock<TextBlockDef> {
  getContextVarExprs(contextVar: ContextVar): Expr[] { 
    if (this.blockDef.embeddedExprs) {
      return _.compact(_.map(this.blockDef.embeddedExprs, ee => ee.contextVarId === contextVar.id ? ee.expr : null))
    }
    return []
  }

  validate(options: DesignCtx) {
    // Validate expressions
    return validateEmbeddedExprs({
      embeddedExprs: this.blockDef.embeddedExprs || [],
      schema: options.schema,
      contextVars: options.contextVars})
  }

  renderDesign(props: DesignCtx) {
    let text = localize(this.blockDef.text, props.locale)

    // Replace expressions with name
    const exprUtils = new ExprUtils(props.schema, createExprVariables(props.contextVars))
    if (this.blockDef.embeddedExprs) {
      for (let i = 0 ; i < this.blockDef.embeddedExprs.length ; i++) {
        if (this.blockDef.embeddedExprs[i].expr) {
          text = text.replace(`{${i}}`, "{" + exprUtils.summarizeExpr(this.blockDef.embeddedExprs[i].expr, props.locale) + "}")
        }
      }
    }

    let node
    if (this.blockDef.html) {
      node = this.processHTML(text)
    }
    else if (this.blockDef.markdown) {
      node = this.processMarkdown(text)
    }
    else {
      node = text
    }

    return this.renderText(text ? node : <span className="text-muted">Text</span>)
  }

  renderInstance(instanceCtx: InstanceCtx): React.ReactElement<any> {
    let text = localize(this.blockDef.text, instanceCtx.locale)

    // Get any embedded expression values
    const exprValues = _.map(this.blockDef.embeddedExprs || [], ee => instanceCtx.getContextVarExprValue(ee.contextVarId!, ee.expr))

    // Format and replace
    text = formatEmbeddedExprString({
      text: text, 
      embeddedExprs: this.blockDef.embeddedExprs || [],
      exprValues: exprValues,
      schema: instanceCtx.schema,
      contextVars: instanceCtx.contextVars,
      locale: instanceCtx.locale,
      formatLocale: instanceCtx.formatLocale
    })

    let node
    if (this.blockDef.html) {
      node = this.processHTML(text)
    }
    else if (this.blockDef.markdown) {
      node = this.processMarkdown(text)
    }
    else {
      node = text
    }

    return this.renderText(node)
  }

  renderEditor(props: DesignCtx) {
    return (
      <div>
        <LabeledProperty label="Text">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="text">
            {(value, onChange) => 
              <LocalizedTextPropertyEditor 
                value={value} 
                onChange={onChange} 
                locale={props.locale} 
                multiline={this.blockDef.multiline || this.blockDef.markdown || this.blockDef.html} 
                allowCR={this.blockDef.multiline || this.blockDef.markdown || this.blockDef.html} />
            }
          </PropertyEditor>
        </LabeledProperty>

        <LabeledProperty label="Embedded expressions" help="Reference in text as {0}, {1}, etc.">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="embeddedExprs">
            {(value: EmbeddedExpr[] | null | undefined, onChange) => (
              <EmbeddedExprsEditor 
                value={value} 
                onChange={onChange} 
                schema={props.schema} 
                dataSource={props.dataSource}
                contextVars={props.contextVars} />
            )}
          </PropertyEditor>
        </LabeledProperty>
        { this.renderTextualEditor(props) }
      </div>
    )
  }
}

