import * as React from 'react';
import LeafBlock from '../LeafBlock';
// TODO
export class SpacerBlock extends LeafBlock {
    validate() { return null; }
    renderDesign(props) {
        return (React.createElement("div", null));
    }
    renderInstance(props) {
        return (React.createElement("div", null));
    }
}
//# sourceMappingURL=spacer.js.map