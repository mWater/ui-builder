import { QueryCompiler } from "../QueryCompiler";
import { Schema, DataSource, Row } from "mwater-expressions";
import { DataSourceDatabase } from "./DataSourceDatabase";
import { QueryOptions } from "./Database";

jest.mock("../QueryCompiler")

const mockDataSource = {
  performQuery: (query, cb) => { cb(null, [{ c_x: 5, o0: 1 }])}
} as DataSource

test("column mapping", async () => {
  const qc = new QueryCompiler({} as Schema)
  const db = new DataSourceDatabase({} as Schema, mockDataSource, qc)

  const results = await db.query({} as QueryOptions)
  expect(results).toEqual([{ x: 5 }])
})