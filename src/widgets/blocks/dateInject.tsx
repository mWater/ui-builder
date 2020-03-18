import produce from 'immer'
import * as React from 'react';
import { Block, BlockDef, ContextVar, ChildBlock } from '../blocks'
import * as _ from 'lodash';
import DatePicker from 'react-datepicker'
import moment from 'moment'
import { DesignCtx, InstanceCtx } from '../../contexts';
import ContextVarsInjector from '../ContextVarsInjector';
import { useState } from 'react';

/** Block which allows selecting a single date and injects it as a context variable */
export interface DateInjectBlockDef extends BlockDef {
  type: "dateInject"

  /** Block which is in the passed the row */
  content: BlockDef | null
}

export class DateInjectBlock extends Block<DateInjectBlockDef> {
  getChildren(contextVars: ContextVar[]): ChildBlock[] {
    if (this.blockDef.content) {
      return [{ blockDef: this.blockDef.content, contextVars: contextVars.concat([this.createContextVar()]) }]
    }
    return []
  }

  createContextVar(): ContextVar {
    return { type: "date", id: this.blockDef.id, name: "Date" }
  }

  validate(options: DesignCtx) { 
    if (!this.blockDef.content) {
      return "Content required"
    }

    return null
  }

  processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef {
    const content = action(this.blockDef.content)
    return produce(this.blockDef, draft => {
      draft.content = content
    })
  }

  renderDesign(designCtx: DesignCtx) {
    const handleSetContent = (blockDef: BlockDef) => {
      designCtx.store.alterBlock(this.id, produce((b: DateInjectBlockDef) => { 
        b.content = blockDef 
        return b
      }), blockDef.id)
    }

    // Create ctx for child
    const contextVar = this.createContextVar()
    let contentDesignCtx = designCtx
    
    // Add context variable if knowable
    if (contextVar) {
      contentDesignCtx = { ...contentDesignCtx, contextVars: designCtx.contextVars.concat([contextVar]) }
    }

    const contentNode = designCtx.renderChildBlock(contentDesignCtx, this.blockDef.content, handleSetContent)

    return (
      <div>
        <div>
          <DatePicker
            selected={new Date()}
            onChange={() => {}}
            dateFormat="PPP"
            className="form-control"
          />
        </div>
        {contentNode}
      </div>
    )
  }

  renderInstance(instanceCtx: InstanceCtx) { 
    return <DateInjectInstance instanceCtx={instanceCtx} block={this} />
  }

  renderEditor(designCtx: DesignCtx) {
    return (
      <div/>
    )
  }
}

const DateInjectInstance = (props: { block: DateInjectBlock, instanceCtx: InstanceCtx }) => {
  const [date, setDate] = useState(moment().format("YYYY-MM-DD"))

  const { instanceCtx, block } = props
  const dateContextVar = block.createContextVar()

  return (
    <div>
      <div style={{ paddingTop: 5, paddingBottom: 5 }}>
        <DatePicker
          selected={moment(date, "YYYY-MM-DD").toDate()}
          onChange={(d) => { setDate(moment(d!).format("YYYY-MM-DD")) }}
          dateFormat="PPP"
          isClearable={false}
          className="form-control"
        />
      </div>
      <ContextVarsInjector
        injectedContextVars={[dateContextVar]}
        injectedContextVarValues={{ [dateContextVar.id]: date }}
        innerBlock={block.blockDef.content}
        instanceCtx={instanceCtx}>
          {(innerInstanceCtx: InstanceCtx, loading: boolean, refreshing: boolean) => {
            if (loading) {
              return <div style={{ color: "#AAA", fontSize: 18, textAlign: "center" }}><i className="fa fa-circle-o-notch fa-spin"/></div>
            }
            return (
              <div style={{ opacity: refreshing ? 0.6 : undefined }}>
                { innerInstanceCtx.renderChildBlock(innerInstanceCtx, block.blockDef.content) }
              </div>
            )
          }}
      </ContextVarsInjector>
    </div>
  )
}