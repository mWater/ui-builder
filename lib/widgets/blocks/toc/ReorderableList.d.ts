import { ReactElement } from "react";
import { DraggableProvidedDraggableProps, DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
export { DraggableProvidedDraggableProps, DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
/** List which provides drag and drop reordering */
export declare function ReorderableList<T>(props: {
    items: T[];
    onItemsChange: (items: T[]) => void;
    renderItem: (item: T, index: number, innerRef: (element?: HTMLElement | null) => any, draggableProps: DraggableProvidedDraggableProps, dragHandleProps?: DraggableProvidedDragHandleProps) => ReactElement;
    getItemId: (item: T) => string;
}): JSX.Element;
