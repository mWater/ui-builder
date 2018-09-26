import * as React from "react";
import { SearchBlockDef, SearchBlock } from "./search";
import { RenderInstanceProps, ContextVar } from "../../blocks";
import { Row, Expr } from "mwater-expressions";
import * as _ from "lodash";
import { localize } from "../../localization";

interface Props {
  blockDef: SearchBlockDef
  renderInstanceProps: RenderInstanceProps
}

interface State {
  searchText: string
}

export default class SearchBlockInstance extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = { searchText: "" }
  }

  createFilter(searchText: string) {
    const blockDef = this.props.blockDef
    
    // Get table
    const table = this.props.renderInstanceProps.contextVars.find(cv => cv.id === blockDef.rowsetId)!.table!

    if (searchText) {
      const searchExprs: Expr[] = blockDef.searchExprs.map(se => {
        return {
          type: "op",
          op: "~*",
          table: table,
          exprs: [
            se,
            { type: "literal", valueType: "text", value: searchText }
          ]
        } as Expr
      })

      const expr: Expr = {
        type: "op", 
        op: "or",
        table: table, 
        exprs: searchExprs
      }

      return { id: blockDef.id, expr: expr }
    }
    else {
      return { id: blockDef.id, expr: null }
    }
  }

  handleChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const blockDef = this.props.blockDef
    const searchText = ev.target.value
    this.setState({ searchText: searchText })

    // Set filter 
    this.props.renderInstanceProps.setFilter(blockDef.rowsetId!, this.createFilter(searchText))
  }

  render() {
    return (
      <div className="input-group" style={{ padding: 5 }}>
        <span className="input-group-addon"><i className="fa fa-search"/></span>
        <input 
          type="text" 
          className="form-control input-sm" 
          style={{maxWidth: "20em"}} 
          value={this.state.searchText} 
          onChange={this.handleChange}
          placeholder={localize(this.props.blockDef.placeholder, this.props.renderInstanceProps.locale)} 
          />
      </div>
    )
  }
}