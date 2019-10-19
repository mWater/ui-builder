import { shallow, mount } from 'enzyme'
import * as React from "react";

import { ContextVar } from "../../blocks";
import { QueryRepeatBlockDef, QueryRepeatBlock } from "./queryRepeat";
import QueryRepeatBlockInstance from "./QueryRepeatBlockInstance";
import simpleSchema from "../../../__fixtures__/schema";
import BlockFactory from '../../BlockFactory';
import mockDatabase from '../../../__fixtures__/mockDatabase';
import { QueryOptions, OrderByDir } from '../../../database/Database';
import { Expr, DataSource } from 'mwater-expressions';
import { ActionLibrary } from '../../ActionLibrary';
import { PageStack } from '../../../PageStack';
import { InstanceCtx } from '../../../contexts';

// Outer context vars
const rowsetCV: ContextVar = { id: "cv1", type: "rowset", name: "", table: "t1" }
const contextVars: ContextVar[] = [rowsetCV]

const schema = simpleSchema()

const exprText: Expr = { type: "field", table: "t1", column: "text" }

const qrbd: QueryRepeatBlockDef = {
  id: "123",
  type: "queryRepeat",
  separator: "solid_line",
  content: { type: "expression", id: "re1", contextVarId: "123_row", expr: exprText },
  rowsetContextVarId: "cv1",
  orderBy: null,
  limit: 10,
  where: null
}

const createBlock = new BlockFactory().createBlock

const qtb = new QueryRepeatBlock(qrbd, createBlock)

let rips: InstanceCtx
let database: any

beforeEach(() => {
  database = mockDatabase()

  rips = {
   createBlock: createBlock,
   contextVars: contextVars,
   database: database,
   getContextVarExprValue: jest.fn(),
   actionLibrary: {} as ActionLibrary,
   pageStack: {} as PageStack,
   // Simple filter
   contextVarValues: { cv1: { type: "field", table: "t1", column: "boolean" } },
   getFilters: () => [],
   setFilter: jest.fn(),
   locale: "en",
   onSelectContextVar: jest.fn(),
   schema: schema,
   dataSource: {} as DataSource,
   renderChildBlock: jest.fn(),
   widgetLibrary: { widgets: {} },
   registerForValidation: () => () => {}
 }
})

test("creates query", () => {
  (database.query as jest.Mock).mockResolvedValue([])

  const inst = mount(<QueryRepeatBlockInstance block={qtb} instanceCtx={rips} />)
  const queryOptions = database.query.mock.calls[0][0] as QueryOptions
  expect(queryOptions).toEqual({
    select: { 
      id: { type: "id", table: "t1" },
      e0: exprText
    },
    from: "t1",
    where: {
      type: "op",
      op: "and",
      table: "t1",
      exprs: [{ type: "field", table: "t1", column: "boolean" }],
    },
    orderBy: [{ expr: { type: "id", table: "t1" }, dir: "asc" }],
    limit: 10
  })
})

test("adds filters, orderBy and where", () => {
  (database.query as jest.Mock).mockResolvedValue([])

  rips.getFilters = () => [{ id: "f1", expr: { type: "literal", valueType: "boolean", value: true }}]
  const qtb = createBlock({ 
    ...qrbd, 
    where: { type: "literal", valueType: "boolean", value: false },
    orderBy: [
      { expr: { type: "field", table: "t1", column: "number" }, dir: "desc" }
    ]
  }) as QueryRepeatBlock
  const inst = mount(<QueryRepeatBlockInstance block={qtb} instanceCtx={rips} />)

  const queryOptions = database.query.mock.calls[0][0] as QueryOptions
  expect(queryOptions).toEqual({
    select: { 
      id: { type: "id", table: "t1" },
      e0: exprText
    },
    from: "t1",
    where: {
      type: "op",
      op: "and",
      table: "t1",
      exprs: [
        { type: "field", table: "t1", column: "boolean" },
        { type: "literal", valueType: "boolean", value: true },
        { type: "literal", valueType: "boolean", value: false }
      ]
    },
    orderBy: [
      { expr: { type: "field", table: "t1", column: "number" }, dir: "desc" },
      { expr: { type: "id", table: "t1" }, dir: "asc" }
    ],
    limit: 10
  })

})

test("injects context variables", () => {
  (database.query as jest.Mock).mockResolvedValue([])

  const inst = mount(<QueryRepeatBlockInstance block={qtb} instanceCtx={rips} />)
  inst.setState({ rows: [{ id: "r1", e0: "abc" }] })
  const rowRips = (inst.instance() as QueryRepeatBlockInstance).createRowInstanceCtx(0) as InstanceCtx

  expect(rowRips.contextVarValues["123_row"]).toBe("r1")

  expect(rowRips.getContextVarExprValue("123_row", exprText)).toBe("abc")
})

// TODO performs action on row click

