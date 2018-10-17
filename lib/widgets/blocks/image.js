import * as React from 'react';
import LeafBlock from '../LeafBlock';
import { LabeledProperty, PropertyEditor } from '../propertyEditors';
import { TextInput } from 'react-library/lib/bootstrap';
export class ImageBlock extends LeafBlock {
    validate(options) {
        if (!this.blockDef.url) {
            return "URL required";
        }
        return null;
    }
    renderImage() {
        if (!this.blockDef.url) {
            return React.createElement("i", { className: "fa fa-picture-o" });
        }
        return (React.createElement("img", { src: this.blockDef.url }));
    }
    renderDesign(props) {
        return this.renderImage();
    }
    renderInstance(props) {
        return this.renderImage();
    }
    renderEditor(props) {
        return (React.createElement("div", null,
            React.createElement(LabeledProperty, { label: "URL" },
                React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "url" }, (value, onChange) => React.createElement(TextInput, { value: value, onChange: onChange })))));
    }
}
//# sourceMappingURL=image.js.map