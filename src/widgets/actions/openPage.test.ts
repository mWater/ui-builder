import VirtualDatabase from "../../database/VirtualDatabase";
import { NullDatabase } from "../../database/Database";
import simpleSchema from "../../__fixtures__/schema";
import { PageStack, Page } from "../../PageStack";
import { OpenPageActionDef, OpenPageAction } from "./openPage";


test("performs action", async () => {
  const ad : OpenPageActionDef = {
    type: "openPage",
    pageType: "normal",
    widgetId: "innerPage",
    contextVarValues: {
      "innercv1": {
        type: "ref",
        contextVarId: "outercv1"
      }
    }
  }
  const schema = simpleSchema()
  const database = new VirtualDatabase(new NullDatabase(), schema, "en")
  const openPage = jest.fn()
  const pageStack = {
    openPage: openPage as unknown
  } as PageStack

  const action = new OpenPageAction(ad)
  await action.performAction({
    locale: "en",
    database: database,
    schema: schema,
    pageStack: pageStack,
    contextVars: [{ id: "outercv1", table: "t2", name: "Cv1", type: "rowset" }],
    contextVarValues: { outercv1: { type: "literal", valueType: "boolean", value: true }},
    getContextVarExprValue: () => null,
    getFilters: (cvid) => {
      return cvid == "outercv1" ? [{ id: "f1", expr: { type: "literal", valueType: "boolean", value: false }}] : []
    }
  })

  const page = openPage.mock.calls[0][0] as Page

  // Should include filters in rowset
  expect(page.contextVarValues["innercv1"]).toEqual({
    type: "op",
    table: "t2",
    op: "and",
    exprs: [
      { type: "literal", valueType: "boolean", value: true },
      { type: "literal", valueType: "boolean", value: false }
    ]
  })
})

