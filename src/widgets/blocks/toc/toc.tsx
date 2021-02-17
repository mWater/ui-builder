import * as React from 'react'
import * as _ from 'lodash'
import { Block, BlockDef, ContextVar, ChildBlock, createExprVariables, validateContextVarExpr } from '../../blocks'
import { produce, original } from 'immer'
import { Expr, ExprValidator, LocalizedString } from 'mwater-expressions'
import TOCDesignComp from './TOCDesignComp'
import TOCInstanceComp from './TOCInstanceComp'
import './toc.css'
import { LabeledProperty, PropertyEditor } from '../../propertyEditors'
import { Checkbox, Toggle } from 'react-library/lib/bootstrap'
import { DesignCtx, InstanceCtx } from '../../../contexts'
import { TextBlockDef } from '../text'
import uuid from 'uuid'
import { ContextVarExpr } from '../../../ContextVarExpr'

/** Table of contents with nested items each showing a different widget in main area */
export interface TOCBlockDef extends BlockDef {
  type: "toc"

  /** Nestable items in the table of contents */
  items: TOCItem[]

  /** Optional header */
  header: BlockDef | null

  /** Optional footer */
  footer: BlockDef | null

  /** Remove padding (for top-level TOC that should fit page completely) */
  removePadding?: boolean

  /** Theme (default is light) */
  theme?: "light" | "dark"
}

/** An item within the table of contents */
export interface TOCItem {
  /** uuid id */
  id: string

  /** Label to be displayed for entry */
  labelBlock?: BlockDef | null

  /** DEPRECATED: Localized label. Use labelBlock @deprecated */
  label?: LocalizedString

  /** Localized title of page */
  title?: LocalizedString | null

  /** Widget to be displayed when the item is selected */
  widgetId?: string | null

  /** Maps widgets' context variable ids to external ones */
  contextVarMap?: { [internalContextVarId: string]: string }

  /** Any children items */
  children: TOCItem[]

  /** Optional condition for display */
  condition?: ContextVarExpr

  /** Collapse behaviour. Default is expanded */
  collapse?: "expanded" | "startCollapsed" | "startExpanded"
}

/** Create a flat list of all items */
export const iterateItems = (items: TOCItem[]): TOCItem[] => {
  var flatItems: TOCItem[] = []
  for (const item of items) {
    flatItems.push(item)
    flatItems = flatItems.concat(iterateItems(item.children))
  }
  return flatItems
}

/** Alter each item, allowing item to be mutated, replaced (return item or array of items) or deleted (return null) */
export const alterItems = (items: TOCItem[], action: (item: TOCItem) => undefined | null | TOCItem | TOCItem[]): TOCItem[] => {
  const newItems = _.flatten(_.compact(items.map(item => action(item)))) as TOCItem[]
  
  return produce(newItems, draft => {
    for (const ni of draft) {
      ni.children = alterItems(original(ni.children) as TOCItem[], action)
    }
  })
}

export class TOCBlock extends Block<TOCBlockDef> {
  /** Get child blocks */
  getChildren(contextVars: ContextVar[]): ChildBlock[] {
    // Iterate all 
    return _.compact([this.blockDef.header, this.blockDef.footer].concat(iterateItems(this.blockDef.items).map(item => item.labelBlock || null)))
      .map(bd => ({ blockDef: bd!, contextVars: contextVars }))
  }

  /** Get any context variables expressions that this block needs (not including child blocks) */
  getContextVarExprs(contextVar: ContextVar, ctx: DesignCtx | InstanceCtx): Expr[] { 
    return _.compact(iterateItems(this.blockDef.items).map(
      item => item.condition && item.condition.contextVarId == contextVar.id ? item.condition.expr : null))
  }

  /** Validate a single TOC item */
  validateItem(designCtx: DesignCtx, tocItem: TOCItem): string | null {
    if (tocItem.widgetId) {
      // Check that widget exists
      const widget = designCtx.widgetLibrary.widgets[tocItem.widgetId]
      if (!widget) {
        return "Widget does not exist"
      }

      // For each inner context variable
      for (const innerContextVar of widget.contextVars) {
        // If mapped, check that outer context var exists
        if (tocItem.contextVarMap && tocItem.contextVarMap[innerContextVar.id]) {
          const outerContextVarId = tocItem.contextVarMap[innerContextVar.id]
          if (!designCtx.contextVars.find(cv => cv.id == outerContextVarId)) {
            return "Context variable not found. Please check mapping"
          }
        }
      }
    }
    
    // Validate condition
    if (tocItem.condition) {
      const error = validateContextVarExpr({
        contextVars: designCtx.contextVars,
        schema: designCtx.schema,
        contextVarId: tocItem.condition.contextVarId,
        expr: tocItem.condition.expr,
        aggrStatuses: ["individual", "literal"],
        types: ["boolean"]
      })
      if (error) {
        return `Error in condition: ${error}`
      }
    }

    return null
  }

  validate(designCtx: DesignCtx) { 
    // Validate all items
    for (const tocItem of iterateItems(this.blockDef.items)) {
      const error = this.validateItem(designCtx, tocItem)
      if (error) {
        return error
      }
    }
    return null 
  }

  processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef {
    return produce(this.blockDef, (draft: TOCBlockDef) => {
      // For header and footer
      draft.header = action(this.blockDef.header)
      draft.footer = action(this.blockDef.footer)

      // For all other blocks
      for (const item of iterateItems(draft.items)) {
        item.labelBlock = action(original(item.labelBlock) || null)
      }
    })
  }

  /** Canonicalize the block definition. Should be done after operations on the block are completed. Only alter self, not children.
   * Can also be used to upgrade blocks
   */
  canonicalize(): BlockDef | null {
    // Upgrade any labels to labelBlocks
    return produce(this.blockDef, draft => {
      for (const item of iterateItems(draft.items)) {
        if (item.label && !item.labelBlock) {
          item.labelBlock = { type: "text", text: item.label, id: uuid.v4() } as TextBlockDef
          delete item.label
        }
      }
    })
  }

  renderDesign(props: DesignCtx) {
    return <TOCDesignComp renderProps={props} blockDef={this.blockDef} />
  }

  renderInstance(props: InstanceCtx): React.ReactElement<any> {
    return <TOCInstanceComp instanceCtx={props} blockDef={this.blockDef} createBlock={props.createBlock} />
  }
  
  renderEditor(props: DesignCtx) {
    return (
      <div>
        <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="removePadding">
          {(value, onChange) => <Checkbox value={value} onChange={onChange}>Remove Padding (for top-level TOCs)</Checkbox>}
        </PropertyEditor>
        <LabeledProperty label="Theme">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="theme">
            {(value, onChange) => (
              <Toggle 
                value={value || "light"} 
                onChange={onChange}
                options={[
                  { value: "light", label: "Light" },
                  { value: "dark", label: "Dark" }
                ]}
              />
            )}
          </PropertyEditor>
        </LabeledProperty>
      </div>
    )
  }
}

