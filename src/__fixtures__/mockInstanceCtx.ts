import { ActionLibrary } from "../widgets/ActionLibrary";
import { PageStack } from "../PageStack";
import { Database } from "../database/Database";
import { Schema, DataSource } from "mwater-expressions";
import { InstanceCtx } from "../contexts";

export default () => {
  return {
    createBlock: jest.fn(),
    contextVars: [],
    database: {} as Database,
    getContextVarExprValue: jest.fn(),
    actionLibrary: {} as ActionLibrary,
    pageStack: {} as PageStack,
    contextVarValues: { },
    getFilters: () => [],
    setFilter: jest.fn(),
    locale: "en",
    onSelectContextVar: jest.fn(),
    schema: {} as Schema,
    dataSource: {} as DataSource,
    renderChildBlock: jest.fn(),
    widgetLibrary: { widgets: {} },
    registerForValidation: () => () => {}
  } as InstanceCtx
}
