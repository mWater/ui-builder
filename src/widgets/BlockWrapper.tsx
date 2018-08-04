import * as React from "react";
import { BlockDef } from "./blocks";

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
    const style = {
      border: "solid 1px grey",
      padding: 5,
      margin: 2
    }

    if (this.props.selectedBlockId === this.props.blockDef.id) {
      style.border = "dashed 3px blue"
      style.margin = 0
    }

    return (
      <div onClick={this.handleClick} style={style} >
        {this.props.children}
      </div>
    )
  }
}