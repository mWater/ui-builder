"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GanttChartInstance_1 = require("./GanttChartInstance");
test("sorts simple list", function () {
    // Simple rows
    var queryRows = [
        { id: "1", order: 1, label: "A" },
        { id: "3", order: 3, label: "C" },
        { id: "2", order: 2, label: "B" },
    ];
    var chartRows = GanttChartInstance_1.createChartRows({ queryRows: queryRows, getColor: function () { return "red"; }, prefixNumber: false });
    expect(chartRows.map(function (r) { return r.id; })).toEqual(["1", "2", "3"]);
});
test("sorts nested list", function () {
    // Simple rows
    var queryRows = [
        { id: "1ba", order: 1, parent: "1b", label: "ABA" },
        { id: "1", order: 1, label: "A" },
        { id: "3", order: 3, label: "C" },
        { id: "2", order: 2, label: "B" },
        { id: "1b", order: 2, parent: "1", label: "AB" },
        { id: "1a", order: 1, parent: "1", label: "AA" }
    ];
    var chartRows = GanttChartInstance_1.createChartRows({ queryRows: queryRows, getColor: function () { return "red"; }, prefixNumber: true });
    expect(chartRows.map(function (r) { return r.id; })).toEqual(["1", "1a", "1b", "1ba", "2", "3"]);
    expect(chartRows.map(function (r) { return r.level; })).toEqual([0, 1, 1, 2, 0, 0]);
    expect(chartRows.map(function (r) { return r.label; })).toEqual([
        "1. A",
        "1.1. AA",
        "1.2. AB",
        "1.2.1. ABA",
        "2. B",
        "3. C"
    ]);
});
