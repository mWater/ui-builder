import * as React from 'react';
import * as Blocks from './Blocks'
import { DropdownBlock, DropdownBlockDef } from './DropdownBlock'
import { HorizontalBlock, HorizontalBlockDef } from './HorizontalBlock';

class BasicBlockFactory {
  create = (blockDef: Blocks.BlockDef): Blocks.Block => {
    if (blockDef.type === "dropdown") {
      return new DropdownBlock(blockDef as DropdownBlockDef)
    }
    if (blockDef.type === "horizontal") {
      return new HorizontalBlock(blockDef as HorizontalBlockDef, this.create)
    }

    throw new Error("Type not found")
  }
}

const blockFactory = new BasicBlockFactory()

let rootBlockDef: Blocks.BlockDef = {
  id: "a",
  type: "horizontal",
  items: [
    { id: "a1", type: "dropdown" },
    { id: "a2", type: "dropdown" }
  ]
}
const rootBlock = blockFactory.create(rootBlockDef)
rootBlockDef = rootBlock.dropBlock({ id: "a3", type: "dropdown" }, "a2", Blocks.DropSide.right)

class BlockComponentDesigner extends React.Component {
  render() {
    const block = blockFactory.create(rootBlockDef)

    const props = {
      contextVars: [],
      store: {} as Blocks.BlockStore,
      wrapDesignerElem(blockDef: Blocks.BlockDef, elem: React.ReactElement<any>) {
        return <div style={{ border: "solid 1px blue", padding: 10 }}>
          {elem}
        </div>
      }
    } as Blocks.RenderDesignProps

    return block.renderDesign(props)
  }
}

export default BlockComponentDesigner;

// interface XProps {
//   a: string
// }

// class X extends React.Component<XProps> {
//   render() {
//     return null
//   }
// }

// class Y extends React.Component<{}> {
//   c: X | null;

//   render() {
//     return <X a="sdfasdf" ref={ c => this.c = c }  />
//   }
// }

// interface ZProps {
//   xelem: React.ReactElement<X>
// }

// class Z extends React.Component<ZProps> {
//   c: X | null;

//   render() {
//     return React.cloneElement(this.props.xelem, { ref: (c:X) => this.c = c })
//   }
// }