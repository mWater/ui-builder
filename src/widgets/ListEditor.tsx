import * as React from "react";

interface ListEditorProps<T> {
  items: T[],
  onItemsChange(items: T[]): void,
  children(item: T, onItemChange: ((item: T) => void)): React.ReactElement<any>
}

/** Allows editing of a list and removing of items */
export default class ListEditor<T> extends React.Component<ListEditorProps<T>> {
  handleRemove = (index: number) => {
    const items = this.props.items.slice()
    items.splice(index, 1)
    this.props.onItemsChange(items)
  }

  handleItemChange = (index: number, item: T) => {
    const items = this.props.items.slice()
    items[index] = item
    this.props.onItemsChange(items)
  }

  renderItem(item: T, index: number) {
    return (
      <li className="list-group-item">
        <span style={{ float: "right"}} onClick={this.handleRemove.bind(null, index)}>
          <i className="fa fa-remove"/>
        </span>
        {this.props.children(item, this.handleItemChange.bind(null, index))}
      </li>
    )
  }

  render() {
    return (
      <ul className="list-group">
        {this.props.items.map((item, index) => this.renderItem(item, index))}
      </ul>
    )
  }
}

