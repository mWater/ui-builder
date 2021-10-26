import React from "react"
import { ReactElement } from "react"
import {
  DragDropContext,
  Draggable,
  DraggableProvidedDraggableProps,
  DraggableProvidedDragHandleProps,
  Droppable,
  DropResult
} from "react-beautiful-dnd"

export { DraggableProvidedDraggableProps, DraggableProvidedDragHandleProps } from "react-beautiful-dnd"

/** List which provides drag and drop reordering */
export function ReorderableList<T>(props: {
  items: T[]
  onItemsChange: (items: T[]) => void
  renderItem: (
    item: T,
    index: number,
    innerRef: (element?: HTMLElement | null) => any,
    draggableProps: DraggableProvidedDraggableProps,
    dragHandleProps?: DraggableProvidedDragHandleProps
  ) => ReactElement
  getItemId: (item: T) => string
}) {
  function onDragEnd(result: DropResult) {
    // dropped outside the list
    if (!result.destination) {
      return
    }

    props.onItemsChange(reorder(props.items, result.source.index, result.destination.index))
  }

  function renderDraggable(item: T, index: number) {
    const id = props.getItemId(item)

    return (
      <Draggable key={id} draggableId={id} index={index}>
        {(provided, snapshot) =>
          props.renderItem(item, index, provided.innerRef, provided.draggableProps, provided.dragHandleProps)
        }
      </Draggable>
    )
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="abc">
        {(provided, snapshot) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {props.items.map(renderDraggable)}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}

function reorder<T>(list: T[], startIndex: number, endIndex: number) {
  const result = list.slice()
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)
  return result
}
