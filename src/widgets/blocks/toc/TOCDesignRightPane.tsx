import React from "react";
import _ from 'lodash';
import { TOCItem } from "./toc";
import { BlockDef } from "..";
import produce from "immer";
import { LabeledProperty, ContextVarPropertyEditor, LocalizedTextPropertyEditor, ContextVarExprPropertyEditor } from "../../propertyEditors";
import { Select } from "react-library/lib/bootstrap";
import { LocalizedString } from "mwater-expressions";
import { DesignCtx } from "../../../contexts";
import { ContextVarExpr } from "../../../ContextVarExpr";

export function TOCDesignRightPane(props: {
  selectedItem: TOCItem;
  renderProps: DesignCtx;
  onItemChange: (item: TOCItem) => void;
}) {
  const { selectedItem, onItemChange, renderProps } = props;

  const selectedWidgetId = selectedItem.widgetId;

  const handleLabelBlockChange = (labelBlock: BlockDef | null) => {
    onItemChange(produce(selectedItem, draft => {
      draft.labelBlock = labelBlock;
    }));
  };

  const handleWidgetIdChange = (widgetId: string | null) => {
    onItemChange(produce(selectedItem, draft => {
      draft.widgetId = widgetId;
    }));
  };

  const handleTitleChange = (title: LocalizedString | null) => {
    onItemChange(produce(selectedItem, draft => {
      draft.title = title;
    }));
  };

  const handleContextVarMapChange = (contextVarMap: { [internalContextVarId: string]: string; }) => {
    onItemChange(produce(selectedItem, draft => {
      draft.contextVarMap = contextVarMap;
    }));
  };

  const handleConditionChange = (condition: ContextVarExpr) => {
    onItemChange(produce(selectedItem, draft => {
      draft.condition = condition;
    }));
  };

  // Create widget options 
  const widgetOptions = _.sortBy(Object.values(renderProps.widgetLibrary.widgets).map(w => ({ label: w.name, value: w.id })), "label");

  const renderContextVarValues = () => {
    if (!selectedItem!.widgetId) {
      return null;
    }

    // Find the widget
    const widgetDef = renderProps.widgetLibrary.widgets[selectedItem!.widgetId];
    if (!widgetDef) {
      return null;
    }

    const contextVarMap = selectedItem!.contextVarMap || {};

    return (
      <table className="table table-bordered table-condensed">
        <tbody>
          {widgetDef.contextVars.map(contextVar => {
            const cv = contextVarMap[contextVar.id];
            const handleCVChange = (contextVarId: string | null) => {
              if (contextVarId) {
                handleContextVarMapChange({ ...contextVarMap, [contextVar.id]: contextVarId });
              }
              else {
                handleContextVarMapChange(produce(contextVarMap, draft => { delete draft[contextVar.id]; }));
              }
            };

            return (
              <tr key={contextVar.id}>
                <td key="name">{contextVar.name}</td>
                <td key="value">
                  <ContextVarPropertyEditor
                    contextVars={renderProps.contextVars}
                    types={[contextVar.type]}
                    table={contextVar.table}
                    value={cv}
                    onChange={handleCVChange} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <div style={{ padding: 10 }}>
      <LabeledProperty label="Label">
        {renderProps.renderChildBlock(renderProps, selectedItem.labelBlock || null, handleLabelBlockChange)}
      </LabeledProperty>
      <LabeledProperty label="Widget">
        <Select value={selectedWidgetId} onChange={handleWidgetIdChange} options={widgetOptions} nullLabel="Select Widget" />
      </LabeledProperty>
      <LabeledProperty label="Page title (optional)">
        <LocalizedTextPropertyEditor value={selectedItem.title || null} onChange={handleTitleChange} locale={props.renderProps.locale} />
      </LabeledProperty>
      <LabeledProperty label="Variable Mappings">
        {renderContextVarValues()}
      </LabeledProperty>
      <LabeledProperty label="Conditional display (optional)">
        <ContextVarExprPropertyEditor
          schema={renderProps.schema}
          dataSource={renderProps.dataSource}
          contextVars={renderProps.contextVars}
          contextVarId={selectedItem.condition ? selectedItem.condition.contextVarId : null}
          expr={selectedItem.condition ? selectedItem.condition.expr : null}
          onChange={(contextVarId, expr) => { handleConditionChange({ contextVarId, expr }); }}
          types={["boolean"]} />
      </LabeledProperty>
    </div>
  );
}
