import produce from 'immer';
import * as React from 'react';
import CompoundBlock from '../CompoundBlock';
import * as _ from 'lodash';
export class CollapsibleBlock extends CompoundBlock {
    getChildren(contextVars) {
        return _.compact([this.blockDef.label, this.blockDef.content]).map(bd => ({ blockDef: bd, contextVars: contextVars }));
    }
    validate() { return null; }
    processChildren(action) {
        return produce(this.blockDef, draft => {
            if (draft.label) {
                draft.label = action(draft.label);
            }
            if (draft.content) {
                draft.content = action(draft.content);
            }
        });
    }
    renderDesign(props) {
        // Allow dropping
        const handleSetLabel = (blockDef) => {
            props.store.alterBlock(this.id, produce((b) => {
                b.label = blockDef;
                return b;
            }), blockDef.id);
        };
        const handleSetContent = (blockDef) => {
            props.store.alterBlock(this.id, produce((b) => {
                b.content = blockDef;
                return b;
            }), blockDef.id);
        };
        const labelNode = props.renderChildBlock(props, this.blockDef.label, handleSetLabel);
        const contentNode = props.renderChildBlock(props, this.blockDef.content, handleSetContent);
        return (React.createElement("div", { style: { paddingTop: 5, paddingBottom: 5 } },
            React.createElement(Collapsible, { label: labelNode, forceOpen: true }, contentNode)));
    }
    renderInstance(props) {
        const labelNode = this.blockDef.label ?
            this.createBlock(this.blockDef.label).renderInstance(props) : null;
        const contentNode = this.blockDef.content ?
            this.createBlock(this.blockDef.content).renderInstance(props) : null;
        return (React.createElement("div", { style: { paddingTop: 5, paddingBottom: 5 } },
            React.createElement(Collapsible, { label: labelNode }, contentNode)));
    }
}
class Collapsible extends React.Component {
    constructor(props) {
        super(props);
        this.handleToggle = () => {
            if (!this.props.forceOpen) {
                this.setState({ collapsed: !this.state.collapsed });
            }
        };
        this.state = {
            collapsed: false
        };
    }
    render() {
        if (this.state.collapsed) {
            return (React.createElement("div", { onClick: this.handleToggle },
                React.createElement("div", { style: { float: "left", marginRight: 5, fontSize: 18, color: "#3bd" } },
                    React.createElement("i", { className: "fa fa-caret-right" })),
                this.props.label));
        }
        return (React.createElement("div", { onClick: this.handleToggle },
            React.createElement("div", null,
                React.createElement("div", { style: { float: "left", marginRight: 5, fontSize: 18, color: "#3bd" } },
                    React.createElement("i", { className: "fa fa-caret-down" })),
                this.props.label),
            this.props.children));
    }
}
//# sourceMappingURL=collapsible.js.map