import * as React from 'react';
import LeafBlock from '../LeafBlock'
import { BlockDef, RenderDesignProps, RenderInstanceProps, ValidateBlockOptions, CreateBlock, NullBlockStore } from '../blocks'
import ModalWindowComponent from 'react-library/lib/ModalWindowComponent'
import { BlockPaletteEntry } from '../../designer/blockPaletteEntries';
import { Schema, DataSource } from 'mwater-expressions';
import BlockPlaceholder from '../BlockPlaceholder';
import { useState, useRef, useEffect } from 'react';
import { SearchControl } from './search/SearchBlockInstance';

export interface AddWizardBlockDef extends BlockDef {
  type: "addWizard"
}

/** Displays a popup and transforms into any other kind of block */
export class AddWizardBlock extends LeafBlock<AddWizardBlockDef> {
  createBlock: CreateBlock

  constructor(blockDef: AddWizardBlockDef, createBlock: CreateBlock) {
    super(blockDef)
    this.createBlock = createBlock;
  }

  validate(options: ValidateBlockOptions) { 
    return null 
  }

  renderDesign(props: RenderDesignProps) {
    const handleSet = (newBlockDef: BlockDef | null) => {
      if (newBlockDef) {
        props.store.alterBlock(this.blockDef.id, (bd) => {
          return { ...newBlockDef, id: this.blockDef.id }
        })
      }
      else {
        props.store.alterBlock(this.blockDef.id, (bd) => null)
      }
    }

    return (
      <ModalWindowComponent
        isOpen={true}
        onRequestClose={() => handleSet(null)}>
          <AddWizardPane
            blockPaletteEntries={props.blockPaletteEntries}
            createBlock={this.createBlock}
            schema={props.schema}
            dataSource={props.dataSource}
            onSelect={handleSet}
          />
        </ModalWindowComponent>
    )
  }

  renderInstance(props: RenderInstanceProps): React.ReactElement<any> {
    return <div/>
  }
}

/** Pane with search and allowing clicking on a widget to add */
const AddWizardPane = (props: {
  blockPaletteEntries: BlockPaletteEntry[]
  createBlock: CreateBlock
  schema: Schema
  dataSource: DataSource
  onSelect: (blockDef: BlockDef) => void
}) => {
  const [search, setSearch] = useState("")

  // Focus on load
  const searchControl = useRef<SearchControl>(null)
  useEffect(() => { 
    if (searchControl.current) {
      searchControl.current.focus()
    }
  }, [])

  // Compute visible entries
  const visibleEntries = props.blockPaletteEntries.filter(entry => {
    if (!search) {
      return true
    }
    return entry.title.toLowerCase().includes(search.toLowerCase())
  })

  return <div>
    <div>
      <SearchControl value={search} onChange={setSearch} ref={searchControl} placeholder="Search widgets..."/>
    </div>
    { visibleEntries.map(entry => {
      return <PaletteItem 
        entry={entry}
        createBlock={props.createBlock}
        schema={props.schema}
        dataSource={props.dataSource}
        onSelect={() => props.onSelect(entry.blockDef)} />
    })}
  </div>
}

/** Single item in the palette of block choices */
class PaletteItem extends React.Component<{
  entry: BlockPaletteEntry
  createBlock: CreateBlock
  schema: Schema
  dataSource: DataSource
  onSelect: () => void
}> {
  renderContents() {
    if (this.props.entry.elem) {
      return this.props.entry.elem
    }

    const block = this.props.createBlock(this.props.entry.blockDef)

    return block.renderDesign({
      selectedId: null,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      locale: "en",
      widgetLibrary: { widgets: {} },
      contextVars: [],
      store: new NullBlockStore(),
      blockPaletteEntries: [],
      renderChildBlock: (props, childBlockDef) => {
        if (childBlockDef) {
          const childBlock = this.props.createBlock(childBlockDef)
          return childBlock.renderDesign(props)
        }
        else {
          return <BlockPlaceholder/>
        }
      },
    })
  }

  render() {
    return (
      <div className="add-wizard-palette-item">
        <div className="add-wizard-palette-item-title">{this.props.entry.title}</div>
        {this.renderContents()}
        <div onClick={this.props.onSelect} className="add-wizard-palette-item-cover"/>
      </div>
    )
  }
}
