import * as React from "react";
/** Allows editing of a list and removing of items */
export default class ListEditor extends React.Component {
    constructor() {
        super(...arguments);
        this.handleRemove = (index) => {
            const items = this.props.items.slice();
            items.splice(index, 1);
            this.props.onItemsChange(items);
        };
        this.handleItemChange = (index, item) => {
            const items = this.props.items.slice();
            items[index] = item;
            this.props.onItemsChange(items);
        };
    }
    renderItem(item, index) {
        return (React.createElement("li", { className: "list-group-item" },
            React.createElement("span", { style: { float: "right" }, onClick: this.handleRemove.bind(null, index) },
                React.createElement("i", { className: "fa fa-remove" })),
            this.props.children(item, this.handleItemChange.bind(null, index))));
    }
    render() {
        return (React.createElement("ul", { className: "list-group" }, this.props.items.map((item, index) => this.renderItem(item, index))));
    }
}
//# sourceMappingURL=ListEditor.js.map