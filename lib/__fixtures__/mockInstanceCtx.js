"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (function () {
    return {
        createBlock: jest.fn(),
        contextVars: [],
        database: {},
        getContextVarExprValue: jest.fn(),
        actionLibrary: {},
        pageStack: {},
        contextVarValues: {},
        getFilters: function () { return []; },
        setFilter: jest.fn(),
        locale: "en",
        onSelectContextVar: jest.fn(),
        schema: {},
        dataSource: {},
        renderChildBlock: jest.fn(),
        widgetLibrary: { widgets: {} },
        registerForValidation: function () { return function () { }; },
        T: function (str) { return str; }
    };
});
