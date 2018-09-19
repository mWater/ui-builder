declare module 'mwater-expressions/lib/MWaterDataSource' {
  import { DataSource } from "mwater-expressions";

  export default class MWaterDataSource extends DataSource {
    /**
      serverCaching: allows server to send cached results. default true
      localCaching allows local MRU cache. default true
      imageApiUrl: overrides apiUrl for images
     */
    constructor(apiUrl: string, client?: string | null, options?: { serverCaching?: boolean, localCaching?: boolean, imageApiUrl?: string })
  }
}

declare module 'mwater-expressions-ui' {
  import { Schema, DataSource, Expr, LocalizedString, AggrStatus } from 'mwater-expressions'

  class ExprComponent extends React.Component<{
    schema: Schema
    dataSource: DataSource
    table: string
    value: Expr
    onChange: (expr: Expr) => void

    /** If specified, the types (value type) of expression required. e.g. ["boolean"] */
    types?: string[]
    enumValues?: Array<{ id: string, name: LocalizedString }>
    idTable?: string
    preferLiteral?: boolean
    aggrStatuses?: Array<AggrStatus>
    placeholder?: string
  }> {}
}

declare module 'canonical-json'

