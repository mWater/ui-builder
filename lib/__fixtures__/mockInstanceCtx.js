"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => {
    return {
        createBlock: jest.fn(),
        contextVars: [],
        database: {},
        getContextVarExprValue: jest.fn(),
        actionLibrary: {},
        pageStack: {},
        contextVarValues: {},
        getFilters: () => [],
        setFilter: jest.fn(),
        locale: "en",
        onSelectContextVar: jest.fn(),
        schema: {},
        dataSource: {},
        renderChildBlock: jest.fn(),
        widgetLibrary: { widgets: {} },
        registerForValidation: () => () => { },
        T: (str) => str
    };
};
