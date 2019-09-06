import * as React from "react";
import { ConnectDragSource, DragSource, DragSourceConnector, DragSourceSpec, DragSourceMonitor } from "react-dnd"
import uuid from 'uuid'
import { BlockDef } from "src/widgets/blocks";

interface Props {
  onSelect(blockId: string): void
  connectDragSource?: ConnectDragSource
}

const blockSourceSpec: DragSourceSpec<Props, { blockDef: BlockDef }> = {
  beginDrag() {
    return {
      blockDef: { id: uuid(), type: "addWizard" }
    }
  },
  endDrag(props: Props, monitor: DragSourceMonitor) {
    if (monitor.didDrop()) {
      props.onSelect(monitor.getItem().blockDef.id)
    }
  }
}

class AddWizardPalette extends React.Component<Props> {
  render() {
    return (
      this.props.connectDragSource!(
        <button type="button" className="btn btn-default btn-sm active" style={{ cursor: "move" }}>
          <i className="fa fa-arrows"/> Add Block
        </button>
      )
    )
  }
}

const collect = (connect: DragSourceConnector) => {
  return { connectDragSource: connect.dragSource() }
}

export default DragSource("block", blockSourceSpec, collect)(AddWizardPalette)
