import * as React from "react";
interface ListEditorProps<T> {
    items: T[];
    onItemsChange(items: T[]): void;
    children(item: T, onItemChange: (item: T) => void, index: number): React.ReactElement<any>;
}
/** Allows editing of a list and removing of items */
export default class ListEditor<T> extends React.Component<ListEditorProps<T>> {
    handleRemove: (index: number) => void;
    handleItemChange: (index: number, item: T) => void;
    renderItem(item: T, index: number): JSX.Element;
    render(): JSX.Element;
}
export {};
