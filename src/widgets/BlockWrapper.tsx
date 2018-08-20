import * as React from "react"
import { BlockDef } from "./blocks"
import "./BlockWrapper.css"

interface Props {
  blockDef: BlockDef;
  selectedBlockId: string | null;
  onSelect(): void;
}

export default class BlockWrapper extends React.Component<Props> {
  handleClick = (ev: React.MouseEvent) => {
    ev.stopPropagation()
    this.props.onSelect()
  } 

  render() {
    const selected = this.props.selectedBlockId === this.props.blockDef.id;

    return (
      <div onClick={this.handleClick} className={selected ? "block-wrapper selected" : "block-wrapper"} >
        {this.props.children}
      </div>
    )
  }
}