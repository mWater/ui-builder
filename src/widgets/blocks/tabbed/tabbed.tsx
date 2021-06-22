import produce from 'immer'
import React from 'react';
import { Block, BlockDef, ContextVar, ChildBlock } from '../../blocks'
import { LabeledProperty, LocalizedTextPropertyEditor, PropertyEditor, ResponsiveWidthSelector } from '../../propertyEditors';
import TabbedDesigner from './TabbedDesigner';
import ListEditor from '../../ListEditor';
import uuid from 'uuid/v4';
import { TabbedInstance } from './TabbedInstance';
import { LocalizedString } from 'mwater-expressions';
import { DesignCtx, InstanceCtx } from '../../../contexts';
import { Select } from 'react-library/lib/bootstrap';

export interface TabbedBlockTab {
  /** Unique id for tab */
  id: string

  /** Label for tab */
  label: LocalizedString | null

  content: BlockDef | null
}

export interface TabbedBlockDef extends BlockDef {
  type: "tabbed"

  /** Tabs to use */
  tabs: TabbedBlockTab[]

  /** Width at which tabs collapse */
  collapseWidth?: number
}

/** Tabbed control */
export class TabbedBlock extends Block<TabbedBlockDef> {
  getChildren(contextVars: ContextVar[]): ChildBlock[] {
    return this.blockDef.tabs.filter(tab => tab.content).map(tab => ({ blockDef: tab.content!, contextVars: contextVars}))
  }

  validate() { return null }
 
  processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef {
    // Immer bug requires that producers not be nested
    const tabContents = this.blockDef.tabs.map(t => action(t.content))

    return produce(this.blockDef, draft => {
      for (var i = 0 ; i < tabContents.length ; i++ ) {
        draft.tabs[i].content = tabContents[i]
      }
    })
  }

  renderDesign(props: DesignCtx) {
    return <TabbedDesigner designCtx={props} tabbedBlockDef={this.blockDef}/>
  }

  renderInstance(props: InstanceCtx) {
    return <TabbedInstance instanceCtx={props} blockDef={this.blockDef}/>
  }
  
  renderEditor(props: DesignCtx) {
    const handleAddTab = () => {
      props.store.replaceBlock(produce(this.blockDef, (draft) => {
        draft.tabs.push({
          id: uuid(),
          label: { _base: "en", en: "Unnamed" },
          content: null
        })
      }))
    }

    return (
      <div>
        <h3>Tabbed</h3>
        <LabeledProperty label="Tabs">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="tabs">
            {(tabs, onTabsChange) =>
              <ListEditor items={this.blockDef.tabs} onItemsChange={onTabsChange}>
                {(tab: TabbedBlockTab, onTabChange) =>
                  <PropertyEditor obj={tab} onChange={onTabChange} property="label">
                    {(label, onLabelChange) => 
                      <LocalizedTextPropertyEditor value={label} onChange={onLabelChange} locale={props.locale} />
                    }
                  </PropertyEditor>
                }
              </ListEditor>
            }
          </PropertyEditor>
          <button type="button" className="btn btn-link btn-sm" onClick={handleAddTab}>
            <i className="fa fa-plus"/> Add Tab
          </button>
        </LabeledProperty>

        <LabeledProperty label="Collapse Below Width">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="collapseWidth">
            {(value, onChange) => <ResponsiveWidthSelector value={value} onChange={onChange} />}
          </PropertyEditor>
        </LabeledProperty>
      </div>
    )
  }
}
