import { shallow, mount } from 'enzyme'
import * as React from "react";

import { ContextVar, RenderInstanceProps } from "../../blocks";
import { QueryTableBlockDef, QueryTableBlock } from "./queryTable";
import QueryTableBlockInstance from "./QueryTableBlockInstance";
import simpleSchema from "../../../__fixtures__/schema";
import BlockFactory from '../../BlockFactory';
import mockDatabase from '../../../__fixtures__/mockDatabase';
import { QueryOptions } from '../../../Database';
import { Expr } from 'mwater-expressions';
import { ActionLibrary } from '../../ActionLibrary';
import { PageStack } from '../../../PageStack';

// Outer context vars
const rowsetCV = { id: "cv1", type: "rowset", name: "", table: "t1" }
const contextVars: ContextVar[] = [rowsetCV]

const schema = simpleSchema()

const exprText: Expr = { type: "field", table: "t1", column: "text" }

const qtbdSingle: QueryTableBlockDef = {
  id: "123",
  type: "queryTable",
  mode: "singleRow",
  headers: [],
  contents: [{ type: "expression", id: "re1", contextVarId: "123_row", expr: exprText }],
  rowsetId: "cv1",
  limit: 10,
  where: null,
  rowClickAction: null
}

const createBlock = new BlockFactory().createBlock.bind(null, jest.fn())

const qtbSingle = new QueryTableBlock(qtbdSingle, createBlock)

let rips: RenderInstanceProps;
let database: any

beforeEach(() => {
  database = mockDatabase()

  rips = {
   contextVars: contextVars,
   database: database,
   getContextVarExprValue: jest.fn(),
   actionLibrary: {} as ActionLibrary,
   pageStack: {} as PageStack,
   // Simple filter
   getContextVarValue: () => ({ type: "field", table: "t1", column: "boolean" }),
   getFilters: () => [],
   setFilter: jest.fn(),
   locale: "en",
   onSelectContextVar: jest.fn(),
   schema: schema,
   renderChildBlock: jest.fn()
 }
})

// single:
test("creates query", () => {
  (database.query as jest.Mock).mockResolvedValue([])

  const inst = mount(<QueryTableBlockInstance block={qtbSingle} renderInstanceProps={rips} />)
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
    limit: 10
  })
})

test("adds filters and where", () => {
  (database.query as jest.Mock).mockResolvedValue([])

  rips.getFilters = () => [{ id: "f1", expr: { type: "literal", valueType: "boolean", value: true }}]
  const qtb = createBlock({ ...qtbdSingle, where: { type: "literal", valueType: "boolean", value: false }})
  const inst = mount(<QueryTableBlockInstance block={qtb} renderInstanceProps={rips} />)

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
    limit: 10
  })

})

test("injects context variables", () => {
  (database.query as jest.Mock).mockResolvedValue([])

  const inst = mount(<QueryTableBlockInstance block={qtbSingle} renderInstanceProps={rips} />)
  inst.setState({ rows: [{ id: "r1", e0: "abc" }] })
  const rowRips = (inst.instance() as QueryTableBlockInstance).createRowRenderInstanceProps(0) as RenderInstanceProps

  expect(rowRips.getContextVarValue("123_row")).toBe("r1")

  expect(rowRips.getContextVarExprValue("123_row", exprText)).toBe("abc")
})

// TODO performs action on row click

