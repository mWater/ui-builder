declare module 'mwater-expressions' {
  class Schema {
    constructor(schema?: Schema)
  }

  type Expr = LiteralExpr | FieldExpr | OpExpr

  interface LiteralExpr {
    type: "literal"
    valueType: string
    value: any  
  }

  interface FieldExpr {
    type: "field"
    table: string
    column: string
  }

  interface OpExpr {
    type: "op"
    table: string
    op: string
    exprs: Expr[]
  }

}
declare module 'mwater-expressions-ui' 
declare module 'react-library/lib/bootstrap'
