declare module 'mwater-expressions/lib/MWaterDataSource' {
  import { DataSource, JsonQL } from "mwater-expressions";

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
  import { Schema, DataSource, JsonQL, Expr, LocalizedString, AggrStatus } from 'mwater-expressions'

  class ExprComponent extends React.Component<{
    schema: Schema
    dataSource: DataSource
    table: string
    value: Expr | null
    onChange: (expr: Expr | null) => void

    /** If specified, the types (value type) of expression required. e.g. ["boolean"] */
    types?: string[]
    enumValues?: Array<{ id: string, name: LocalizedString }>
    idTable?: string
    preferLiteral?: boolean
    aggrStatuses?: Array<AggrStatus>
    placeholder?: string
  }> {}

  class IdLiteralComponent extends React.Component<{
    /** String value of primary key or array of primary keys */
    value: string | string[] | null

    /** Called with primary key or array of primary keys */
    onChange: (value: string | string[] | null) => void

    idTable: string

    /** Schema of the database */
    schema: Schema

    /** Data source to use to get values */
    dataSource: DataSource

    /** Placeholder to display */
    placeholder?: string

    /** Optional extra orderings. Put "main" as tableAlias. JsonQL */
    orderBy?: any // TODO

    /** Allow multiple values (id[] type) */
    multi?: boolean

    /** Optional extra filter. Put "main" as tableAlias. JsonQL   */
    filter?: JsonQL
  }> {}
}

declare module 'canonical-json'

