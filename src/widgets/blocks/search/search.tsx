import * as React from "react"
import LeafBlock from "../../LeafBlock"
import { BlockDef, createExprVariables } from "../../blocks"
import { Expr, ExprValidator, LocalizedString } from "mwater-expressions"
import {
  LabeledProperty,
  ContextVarPropertyEditor,
  PropertyEditor,
  LocalizedTextPropertyEditor
} from "../../propertyEditors"
import SearchBlockInstance, { SearchControl } from "./SearchBlockInstance"
import ListEditor from "../../ListEditor"
import { ExprComponent } from "mwater-expressions-ui"
import { localize } from "../../localization"
import { DesignCtx, InstanceCtx } from "../../../contexts"
import { Checkbox } from "react-library/lib/bootstrap"
import { produce } from "immer"

export interface SearchBlockDef extends BlockDef, SearchTarget {
  type: "search"

  /** Placeholder in box */
  placeholder: LocalizedString | null

  /** True to focus on load */
  autoFocus?: boolean

  /** Additional targets to search */
  extraSearchTargets?: SearchTarget[]
}

/** One rowset and expressions to search */
export interface SearchTarget {
  /** Id of context variable of rowset for table to use */
  rowsetContextVarId: string | null

  /** Text expressions to search on  */
  searchExprs: Expr[]
}

export class SearchBlock extends LeafBlock<SearchBlockDef> {
  validate(options: DesignCtx) {
    function validateSearchTarget(searchTarget: SearchTarget) {
      // Validate rowset
      const rowsetCV = options.contextVars.find(
        (cv) => cv.id === searchTarget.rowsetContextVarId && cv.type === "rowset"
      )
      if (!rowsetCV) {
        return "Rowset required"
      }

      if (searchTarget.searchExprs.length === 0) {
        return "Search expression required"
      }

      const exprValidator = new ExprValidator(options.schema, createExprVariables(options.contextVars))

      for (const searchExpr of searchTarget.searchExprs) {
        if (!searchExpr) {
          return "Search expression required"
        }

        let error: string | null

        // Validate expr
        error = exprValidator.validateExpr(searchExpr, {
          table: rowsetCV.table,
          types: ["text", "enum", "enumset", "text[]"]
        })
        if (error) {
          return error
        }
      }

      return null
    }

    let error = validateSearchTarget(this.blockDef)
    if (error) {
      return error
    }

    // Validate extras
    if (this.blockDef.extraSearchTargets) {
      for (const searchTarget of this.blockDef.extraSearchTargets) {
        error = validateSearchTarget(searchTarget)
        if (error) {
          return error
        }
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
    function renderSearchTarget(
      searchTarget: SearchTarget,
      onSearchTargetChange: (searchTarget: SearchTarget) => void
    ) {
      // Get rowset context variable
      const rowsetCV = props.contextVars.find((cv) => cv.id === searchTarget.rowsetContextVarId)

      return (
        <div>
          <LabeledProperty label="Rowset">
            <PropertyEditor obj={searchTarget} onChange={onSearchTargetChange} property="rowsetContextVarId">
              {(value, onChange) => (
                <ContextVarPropertyEditor
                  value={value}
                  onChange={onChange}
                  contextVars={props.contextVars}
                  types={["rowset"]}
                />
              )}
            </PropertyEditor>
          </LabeledProperty>

          {rowsetCV ? (
            <LabeledProperty label="Search expressions">
              <PropertyEditor obj={searchTarget} onChange={onSearchTargetChange} property="searchExprs">
                {(value, onItemsChange) => {
                  const handleAddSearchExpr = () => {
                    onItemsChange(value.concat(null))
                  }
                  return (
                    <div>
                      <ListEditor items={value} onItemsChange={onItemsChange}>
                        {(expr: Expr, onExprChange) => (
                          <ExprComponent
                            value={expr}
                            schema={props.schema}
                            dataSource={props.dataSource}
                            onChange={onExprChange}
                            table={rowsetCV.table!}
                            types={["text", "enum", "enumset", "text[]"]}
                            variables={createExprVariables(props.contextVars)}
                          />
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
          ) : null}
        </div>
      )
    }

    return (
      <div>
        {renderSearchTarget(this.blockDef, (searchTarget) => {
          props.store.replaceBlock(
            produce(this.blockDef, (draft) => {
              draft.rowsetContextVarId = searchTarget.rowsetContextVarId
              draft.searchExprs = searchTarget.searchExprs
            })
          )
        })}
        <LabeledProperty label="Placeholder">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="placeholder">
            {(value, onChange) => (
              <LocalizedTextPropertyEditor value={value} onChange={onChange} locale={props.locale} />
            )}
          </PropertyEditor>
        </LabeledProperty>

        <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="autoFocus">
          {(value, onChange) => (
            <Checkbox value={value} onChange={onChange}>
              Automatically focus on load
            </Checkbox>
          )}
        </PropertyEditor>

        {this.blockDef.rowsetContextVarId && this.blockDef.searchExprs.length > 0 ? (
          <LabeledProperty label="Additional searches on other rowsets">
            <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="extraSearchTargets">
              {(value, onItemsChange) => {
                const handleAddExtraSearchTarget = () => {
                  onItemsChange((value || []).concat({ rowsetContextVarId: null, searchExprs: [] }))
                }
                return (
                  <div>
                    <ListEditor items={value || []} onItemsChange={onItemsChange}>
                      {(searchTarget: SearchTarget, onSearchTargetChange) =>
                        renderSearchTarget(searchTarget, onSearchTargetChange)
                      }
                    </ListEditor>
                    <button type="button" className="btn btn-link btn-sm" onClick={handleAddExtraSearchTarget}>
                      + Add Search
                    </button>
                  </div>
                )
              }}
            </PropertyEditor>
          </LabeledProperty>
        ) : null}
      </div>
    )
  }
}
