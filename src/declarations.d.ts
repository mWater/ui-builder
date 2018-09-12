declare module 'mwater-expressions' {
  interface LocalizedString {
    _base: string,
    [language: string]: string  // Localizations
  }
  
  interface Table {
    id: string

    /** localized name of table */
    name: LocalizedString

    /** localized description of table (optional) */
    desc?: LocalizedString
    
    /** non-localized short code for a table (optional) */
    code?: string
    
    /** column of database (not schema column) with primary key (optional). Can be JsonQL expression with `{alias}` for table alias  */
    primaryKey?: string | JsonQL
    
    /** column in schema with natural ordering (optional). */
    ordering?: string
    
    /** table with "ancestor" and "descendant". Faster than ancestry and ancestryText */
    ancestryTable?: string
    
    /** DEPRECATED: column with jsonb array of primary keys, including self. Makes table hierarchical. */
    ancestry?: string
    
    /** DEPRECATED: column with jsonb array of primary keys as JSON text, including self. Required if non-text primary keys for optimization purposes. */
    ancestryText?: string
    
    /** column with label when choosing a single row. Can be JsonQL expression with `{alias}` for table alias */
    label?: string | JsonQL
    
    /** array of content items (columns, sections and joins) of the table */
    contents: Array<Column | Section>
    
    /** true if table is deprecated. Do not show unless already selected */
    deprecated?: boolean
    
    /** Optional custom JsonQL expression. This allows a simple table to be translated to an arbitrarily complex JsonQL expression before being sent to the server.  */
    jsonql?: JsonQL
    
    /** sql expression that gets the table. Usually just name of the table. *Note*: this is only for when using a schema file for Water.org's visualization server */
    sql?: string
  }

  interface Column {
    /** table-unique id of item */
    id: string

    /** localized name of item */
    name: LocalizedString
    
    /** localized description of item */
    desc?: LocalizedString
    
    /**  optional non-localized code of item */
    code?: string
    
    /** type of content item. `id`, `text`, `number`, `enum`, `enumset`, `boolean`, `date`, `datetime`, `geometry`, `text[]`, `image`, `imagelist`, `join`, `section`, `expr`. */
    type: "id" | "text" | "number" | "enum" | "enumset" | "boolean" | "date" | "datetime" | "geometry" | "text[]" | "image" | "imagelist" | "join" | "section" | "expr"
    
    /**  Values for enum. Array of { id, name, code }. For type `enum` or `enumset` only. `id` is the string value of the enum. `code` is optional non-localized code for enum value */
    enumValues?: Array<{ id: string, name: LocalizedString, code?: string }>
    
    /**  table for id, id[] fields */
    idTable?: string
    
    /**  Details of the join. See below. For type `join` only. */
    join?: Join
    
    /**  true if column is deprecated. Do not show unless already selected */
    deprecated?: boolean
    
    /**  set to expression if the column is an mwater-expression to be evaluated */
    expr?: Expr
    
    /**  true if column contains confidential data and should be not displayed by default */
    confidential?: boolean
    
    /**  true if column is redacted and might be blank or scrambled */
    redacted?: boolean
    
    /**  Optional custom JsonQL expression. This allows a simple column to be translated to an arbitrarily complex JsonQL expresion before being sent to the server. It will have any fields with tableAlias = `{alias}` replaced by the appropriate alias. For all except `join`, `section` and `expr` */
    jsonql?: JsonQL
    
    /**  sql expression that gets the column value. Uses `{alias}` which will be substituted with the table alias. Usually just `{alias}.some_column_name`. *Note*: this is only for when using a schema file for Water.org's visualization server */
    sql?: string
  }

  interface Join {
    type: "1-n" | "n-1" | "n-n" | "1-1"
    toTable: string
    /** jsonql expression with aliases {from} and {to} */
    jsonql?: JsonQL
    /** table column to start join from or jsonql with alias {alias} */
    fromColumn?: string | JsonQL
    /** table column to end join at or jsonql with alias {alias}.  */
    toColumn?: string | JsonQL
  }

  interface Section {
    id?: string

    type: "section"

    name: LocalizedString

    contents: Array<Section | Column>
  }

  interface SchemaJson {
    tables: Table[]
  }

  class Schema {
    constructor(schemaJson?: SchemaJson)

    getTables(): Table[]

    getTable(tableId: string): Table | null
  
    getColumn(tableId: string, columnId: string): Column | null
  
    /** Gets the columns in order, flattened out from sections */
    getColumns(tableId: string): Column[]
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

  interface JsonQL {
    type: string
  }

  class DataSource {
    /** Performs a single query. Calls cb with (error, rows) */
    performQuery(query: JsonQL, cb: (error: any, rows: any[]) => void): void

    /** Get the url to download an image (by id from an image or imagelist column)
      Height, if specified, is minimum height needed. May return larger image
      Can be used to upload by posting to this url
    */
    getImageUrl(imageId: string, height: number): string

    // # Clears the cache if possible with this data source
    // clearCache: ->
    //   throw new Error("Not implemented")

    // # Get the cache expiry time in ms from epoch. No cached items before this time will be used. 0 for no cache limit.
    // # Useful for knowing when cache has been cleared, as it will be set to time of clearing.
    // getCacheExpiry: -> 
    //   throw new Error("Not implemented")
  }
}

declare module 'mwater-expressions/lib/MWaterDataSource'
//  {
//   import { DataSource } from "mwater-expressions";

//   export default class MWaterDataSource extends DataSource {
//     /**
//       serverCaching: allows server to send cached results. default true
//       localCaching allows local MRU cache. default true
//       imageApiUrl: overrides apiUrl for images
//      */
//     constructor(apiUrl: string, options?: { serverCaching?: boolean, localCaching?: boolean, imageApiUrl?: string })
//   }
// }

declare module 'mwater-expressions-ui' 

declare module 'react-library/lib/bootstrap' {
  import { ReactNode } from "react";

  class Select<T> extends React.Component<{
    value: T | null,
    onChange?: (value: T | null) => void,
    options: Array<{ value: T | null, label: string }>,
    /** "lg" or "sm" */
    size?: string
    nullLabel?: string
    style?: object
    inline?: boolean
  }> {}

  class Toggle<T> extends React.Component<{
    value: T | null
    onChange?: (value: T | null) => void,
    options: Array<{ value: T | null, label: ReactNode }>,
    /** "xs" or "sm" */
    size?: string
    allowReset?: boolean
  }> {}
}
