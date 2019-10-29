import * as React from 'react';
import LeafBlock from '../../LeafBlock'
import { BlockDef, createExprVariables } from '../../blocks'
import { Expr, ExprValidator, LocalizedString } from 'mwater-expressions';
import { LabeledProperty, ContextVarPropertyEditor, PropertyEditor, LocalizedTextPropertyEditor } from '../../propertyEditors';
import SearchBlockInstance, { SearchControl } from './SearchBlockInstance';
import ListEditor from '../../ListEditor';
import { ExprComponent } from 'mwater-expressions-ui';
import { localize } from '../../localization';
import { DesignCtx, InstanceCtx } from '../../../contexts';
import { Checkbox } from 'react-library/lib/bootstrap';

export interface SearchBlockDef extends BlockDef {
  type: "search"

  /** Placeholder in box */
  placeholder: LocalizedString | null

  /** Id of context variable of rowset for table to use */
  rowsetContextVarId: string | null

  /** Text expressions to search on  */
  searchExprs: Expr[]

  /** True to focus on load */
  autoFocus?: boolean
}

export class SearchBlock extends LeafBlock<SearchBlockDef> {
  validate(options: DesignCtx) { 
    // Validate rowset
    const rowsetCV = options.contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId && cv.type === "rowset")
    if (!rowsetCV) {
      return "Rowset required"
    }
    
    if (this.blockDef.searchExprs.length === 0) {
      return "Search expression required"
    }

    const exprValidator = new ExprValidator(options.schema, createExprVariables(options.contextVars))
    
    for (const searchExpr of this.blockDef.searchExprs) {
      if (!searchExpr) {
        return "Search expression required"
      }

      let error: string | null
      
      // Validate expr
      error = exprValidator.validateExpr(searchExpr, { table: rowsetCV.table, types: ["text", "enum", "enumset"] })
      if (error) {
        return error
      }
    }

    return null
  }
  
  renderDesign(props: DesignCtx) {
    return <SearchControl value="" placeholder={localize(this.blockDef.placeholder, props.locale)} />
  }

  renderInstance(props: InstanceCtx): React.ReactElement<any> {
    return <SearchBlockInstance blockDef={this.blockDef} instanceCtx={props} />
  }

  renderEditor(props: DesignCtx) {
    // Get rowset context variable
    const rowsetCV = props.contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId)

    return (
      <div>
        <LabeledProperty label="Rowset">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="rowsetContextVarId">
            {(value, onChange) => <ContextVarPropertyEditor value={value} onChange={onChange} contextVars={props.contextVars} types={["rowset"]} />}
          </PropertyEditor>
        </LabeledProperty>

        { rowsetCV ? 
          <LabeledProperty label="Search expressions">
            <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="searchExprs">
              {(value, onItemsChange) => {

                const handleAddSearchExpr = () => {
                  onItemsChange(value.concat(null))
                }
                return (
                  <div>
                    <ListEditor items={value} onItemsChange={onItemsChange}>
                      { (expr: Expr, onExprChange) => (
                        <ExprComponent value={expr} schema={props.schema} dataSource={props.dataSource} onChange={onExprChange} table={rowsetCV.table!} types={["text", "enum", "enumset"]} />
                      )}
                    </ListEditor>
                    <button type="button" className="btn btn-link btn-sm" onClick={handleAddSearchExpr}>
                      + Add Expression
                    </button>
                  </div>
                )
              }}
            </PropertyEditor>
          </LabeledProperty>
        : null}

        <LabeledProperty label="Placeholder">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="placeholder">
            {(value, onChange) => <LocalizedTextPropertyEditor value={value} onChange={onChange} locale={props.locale} />}
          </PropertyEditor>
        </LabeledProperty>

        <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="autoFocus">
          {(value, onChange) => <Checkbox value={value} onChange={onChange}>Automatically focus on load</Checkbox>}
        </PropertyEditor>

      </div>
    )
  }
}
