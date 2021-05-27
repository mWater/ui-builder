import produce from 'immer'
import * as React from 'react';
import { Block, BlockDef, ContextVar, ChildBlock } from '../blocks'
import * as _ from 'lodash';
import { DesignCtx, InstanceCtx } from '../../contexts';
import { Database, QueryOptions, DatabaseChangeListener, Transaction } from '../../database/Database';
import { Row, DataSource } from 'mwater-expressions';
import { useState, useRef, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LabeledProperty, PropertyEditor } from '../propertyEditors';
import { Select } from 'react-library/lib/bootstrap';
import { JsonQLQuery } from 'jsonql';

/** Block that can be printed by a print button at top right */
export interface PrintBlockDef extends BlockDef {
  type: "print"

  content: BlockDef | null

  /** Size of the paper. Default is letter-portrait */
  paperSize?: "letter-portait" | "letter-landscape"
}

export class PrintBlock extends Block<PrintBlockDef> {
  getChildren(contextVars: ContextVar[]): ChildBlock[] {
    return this.blockDef.content ? [{ blockDef: this.blockDef.content, contextVars: contextVars}] : []
  }

  validate() { return null }
 
  processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef {
    const content = action(this.blockDef.content)
    return produce(this.blockDef, draft => {
      draft.content = content
    })
  }

  renderDesign(props: DesignCtx) {
    const handleAdd = (addedBlockDef: BlockDef) => {
      props.store.alterBlock(this.id, produce((b: PrintBlockDef) => { 
        b.content = addedBlockDef 
        return b
      }), addedBlockDef.id)
    }

    return (
      <div>
        <div style={{ textAlign: "right" }}>
          <button type="button" className="btn btn-link">
            <i className="fa fa-print" />
          </button>
        </div>
        { props.renderChildBlock(props, this.blockDef.content, handleAdd) }
      </div>
    )
  }

  renderInstance(ctx: InstanceCtx) {
    return <PrintInstance ctx={ctx} blockDef={this.blockDef} />
  }

  renderEditor(props: DesignCtx) {
    return (
      <div>
        <LabeledProperty label="Paper Size">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="paperSize">
            {(value, onChange) => 
            <Select value={value || "letter-portrait"} onChange={onChange}
              options={[
                { value: "letter-portrait", label: "Letter (portrait)" },
                { value: "letter-landscape", label: "Letter (landscape)" }
              ]}
            /> }
          </PropertyEditor>
        </LabeledProperty>
      </div>
    )
  }
}

/** Instance which shows the print button and a preview */
const PrintInstance = (props: {
  blockDef: PrintBlockDef
  ctx: InstanceCtx
}) => {
  const [printing, setPrinting] = useState(false)

  const handleClick = () => {
    setPrinting(true)
  } 

  return (
    <div>
      <div style={{ textAlign: "right" }}>
        <button type="button" className="btn btn-link" onClick={handleClick}>
          <i className="fa fa-print"/>
        </button>
      </div>
      { props.ctx.renderChildBlock(props.ctx, props.blockDef.content) }
      { printing ? <ExecutePrintInstance blockDef={props.blockDef} ctx={props.ctx} onComplete={() => setPrinting(false)} /> : null }
    </div>
  )
}

/** Component which is displayed which creates the element to print in a portal,
 * waits for it to finish loading, executes the print and does a callback
 */
const ExecutePrintInstance = (props: {
  blockDef: PrintBlockDef
  ctx: InstanceCtx
  /** Call when completed printing */
  onComplete: () => void
}) => {

  /** Keep track of number of pending queries */
  const pendingQueriesRef = useRef(0)

  /** Keep track of number of total queries */
  const totalQueriesRef = useRef(0)

  /** Query status string */
  const [statusString, setStatusString] = useState("")

  /** Create tracking database and data source to make context that tracks query requests */
  const printCtx: InstanceCtx = useMemo(() => {
    const onStartQuery = () => { 
      pendingQueriesRef.current = pendingQueriesRef.current + 1 
      totalQueriesRef.current = totalQueriesRef.current + 1 
      setStatusString(`${totalQueriesRef.current - pendingQueriesRef.current} / ${totalQueriesRef.current}`)
    }
    const onEndQuery = () => { 
      pendingQueriesRef.current = pendingQueriesRef.current - 1 
      setStatusString(`${totalQueriesRef.current - pendingQueriesRef.current} / ${totalQueriesRef.current}`)
    }
    
    return { ...props.ctx,
      database: new TrackingDatabase(props.ctx.database, onStartQuery, onEndQuery),
      dataSource: props.ctx.dataSource ? new TrackingDataSource(props.ctx.dataSource, onStartQuery, onEndQuery) : undefined
    }
  }, [])

  // Create printable element
  const printElem = useMemo(() => {
    const paperSize = props.blockDef.paperSize || "letter-portait"

    // Create element at 96 dpi (usual for browsers) and 7.5" across (letter - 0.5" each side). 1440 is double, so scale down
    let width = 1440
    if (paperSize == "letter-landscape") {
      width = 1920
    }

    return <div style={{ transform: "scale(0.5)", transformOrigin: "top left" }}>
      <div style={{ width: width }}>
        { printCtx.renderChildBlock(printCtx, props.blockDef.content) }
      </div>
    </div>
  }, [printCtx])
  
  // Perform print after delay of waiting for no queries
  useEffect(() => {
    // Repeatedly check pending queries
    const interval = setInterval(() => {
      // If no queries, print after cancelling intervals
      if (pendingQueriesRef.current == 0) {
        clearInterval(interval)

        // Extra delay to ensure finished rendering
        setTimeout(() => {
          window.print()
          props.onComplete()
        }, 3000)
      }
    }, 3000)

    return () => { clearInterval(interval) }
  }, [])

  // Create size css string
  const sizeCss = (props.blockDef.paperSize || "letter-portait") == "letter-portait" ? "8.5in 11in" : "11in 8.5in landscape"

  // Fragment that contains CSS, splash screen and element to print
  const printFragment = <React.Fragment>
    <style>
      {`
        @media print {
        /* Hide body and get rid of margins */
        body {
          visibility: hidden;
          margin: 0;
          padding: 0;
          opacity: 100%
        }

        /* Hide all children of body */
        body > * {
          display: none;
        }

        /* Setup special region */
        #react_element_printer {
          display: block !important;
          visibility: visible;
        }
      }

      @media screen {
        /* REMOVED: Don't show when not printing. Caused c3 problems */
        /*#react_element_printer {
          visibility: hidden;
        }*/
      }

      @page  {
        size: ${sizeCss}; 
        margin: 0.5in 0.5in 0.5in 0.5in; 
      }

      #react_element_printer_splash {
        display: flex; 
        align-items: center;
        justify-content: center;    
        position: fixed; 
        left: 0;
        top: 0;
        z-index: 9999;
        width: 100%;
        height: 100%;
        overflow: visible;    
        background-color: rgba(255,255,255,0.8);
      }

      @media print {
        #react_element_printer_splash {
          display: none;
        }
      }
    `}
    </style>
    <div id="react_element_printer">{printElem}</div>

    <div id="react_element_printer_splash">
      <div style={{ fontSize: 30, width: "50%" }}>
        <div className="progress">
          <div className="progress-bar progress-bar-striped active" role="progressbar" style={{ width: "100%" }}>
            <i className="fa fa-print"/>&nbsp;&nbsp;{statusString}
          </div>
        </div>    
      </div>
    </div>
  </React.Fragment>

  return createPortal(printFragment, document.body)
}

/** Database that proxies another database but calls callback whenever a query is started or ended. 
 * Allows tracking of when queries have gone idle */
class TrackingDatabase implements Database {
  database: Database
  onStartQuery: () => void
  onEndQuery: () => void

  constructor(database: Database, onStartQuery: () => void, onEndQuery: () => void) {
    this.database = database
    this.onStartQuery = onStartQuery
    this.onEndQuery = onEndQuery
  }

  query(options: QueryOptions, contextVars: ContextVar[], filteredContextVarValues: { [contextVarId: string]: any; }): Promise<Row[]> {
    // Notify of query
    this.onStartQuery()

    return new Promise<Row[]>((resolve, reject) => {
      this.database.query(options, contextVars, filteredContextVarValues).then((rows) => {
        resolve(rows)
      }).catch((reason) => { reject(reason) }).finally(() => {
        this.onEndQuery()
      })
    })
  }

  addChangeListener(changeListener: DatabaseChangeListener): void {
    // Do nothing as printing should not update dynamically
  }

  removeChangeListener(changeListener: DatabaseChangeListener): void {
    // Do nothing as printing should not update dynamically
  }

  transaction(): Transaction {
    return this.database.transaction()
  } 
}

/** Data source that proxies another data source but calls callback whenever a query is performed. 
 * Allows tracking of when queries have gone idle */
class TrackingDataSource extends DataSource {
  dataSource: DataSource
  onStartQuery: () => void
  onEndQuery: () => void

  constructor(dataSource: DataSource, onStartQuery: () => void, onEndQuery: () => void) {
    super()
    this.dataSource = dataSource
    this.onStartQuery = onStartQuery
    this.onEndQuery = onEndQuery
  }

  /** Performs a single query. Calls cb with (error, rows) */
  performQuery(query: JsonQLQuery): Promise<Row[]>;
  performQuery(query: JsonQLQuery, cb: (error: any, rows: Row[]) => void): void;
  performQuery(query: any, cb?: (error: any, rows: Row[]) => void): Promise<Row[]> | void {
    if (!cb) {
      return new Promise<Row[]>((resolve, reject) => {
        this.performQuery(query, (error, rows) => {
          if (error) {
            reject(error)
          }
          else {
            resolve(error)
          }
        })
      })
    }
    this.onStartQuery()
    this.dataSource.performQuery(query, (error, rows) => {
      this.onEndQuery()
      cb(error, rows)
    })
    return
  }

  /** Get the url to download an image (by id from an image or imagelist column)
    Height, if specified, is minimum height needed. May return larger image
    Can be used to upload by posting to this url
  */
  getImageUrl(imageId: string, height: number) {
    return this.dataSource.getImageUrl(imageId, height)
  }

  // Clears the cache if possible with this data source
  clearCache() {
    this.dataSource.clearCache()
  }

  // Get the cache expiry time in ms from epoch. No cached items before this time will be used. 0 for no cache limit.
  // Useful for knowing when cache has been cleared, as it will be set to time of clearing.
  getCacheExpiry() { return this.dataSource.getCacheExpiry() }
}
