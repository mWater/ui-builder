import produce from 'immer'
import * as React from 'react';
import CompoundBlock from '../../CompoundBlock';
import { BlockDef, RenderDesignProps, RenderEditorProps, RenderInstanceProps, ContextVar, ChildBlock } from '../../blocks'
import { LocalizedString, localize } from '../../localization';
import { LabeledProperty, LocalizedTextPropertyEditor, PropertyEditor } from '../../propertyEditors';
import TabbedDesigner from './TabbedDesigner';
import ListEditor from '../../ListEditor';
import uuid from 'uuid/v4';
import TabbedInstance from './TabbedInstance';

export interface TabbedBlockTab {
  /** Unique id for tab */
  id: string
  label: LocalizedString | null,
  content: BlockDef | null
}

export interface TabbedBlockDef extends BlockDef {
  type: "tabs"
  tabs: TabbedBlockTab[]
}

/** Tabbed control */
export class TabbedBlock extends CompoundBlock<TabbedBlockDef> {
  getChildren(contextVars: ContextVar[]): ChildBlock[] {
    return this.blockDef.tabs.filter(tab => tab.content).map(tab => ({ blockDef: tab.content!, contextVars: contextVars}))
  }

  validate() { return null }
 
  processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef {
    return produce(this.blockDef, draft => {
      for (const tab of draft.tabs) {
        tab.content = action(tab.content)
      }
    })
  }

  renderDesign(props: RenderDesignProps) {
    return <TabbedDesigner renderDesignProps={props} tabbedBlockDef={this.blockDef}/>
  }

  renderInstance(props: RenderInstanceProps) {
    return <TabbedInstance renderInstanceProps={props} tabbedBlockDef={this.blockDef}/>
  }
  
  renderEditor(props: RenderEditorProps) {
    const handleAddTab = () => {
      props.onChange(produce(this.blockDef, (draft) => {
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
          <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="tabs">
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
      </div>
    )
  }
}
