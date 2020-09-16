import { createChartRows, GanttQueryRow } from "./GanttChartInstance"


test("sorts simple list", () => {
  // Simple rows
  const queryRows = [
    { id: "1", order: 1, label: "A" },
    { id: "3", order: 3, label: "C" },
    { id: "2", order: 2, label: "B" },
  ] as GanttQueryRow[]

  const chartRows = createChartRows({ queryRows, getColor: () => "red", prefixNumber: false })

  expect(chartRows.map(r => r.id)).toEqual(["1", "2", "3"])
})

test("sorts nested list", () => {
  // Simple rows
  const queryRows = [
    { id: "1ba", order: 1, parent: "1b", label: "ABA" },
    { id: "1", order: 1, label: "A" },
    { id: "3", order: 3, label: "C" },
    { id: "2", order: 2, label: "B" },
    { id: "1b", order: 2, parent: "1", label: "AB" },
    { id: "1a", order: 1, parent: "1", label: "AA" }
  ] as GanttQueryRow[]

  const chartRows = createChartRows({ queryRows, getColor: () => "red", prefixNumber: true })

  expect(chartRows.map(r => r.id)).toEqual(["1", "1a", "1b", "1ba", "2", "3"])
  expect(chartRows.map(r => r.level)).toEqual([0, 1, 1, 2, 0, 0])
  expect(chartRows.map(r => r.label)).toEqual([
    "1. A", 
    "1.1. AA", 
    "1.2. AB", 
    "1.2.1. ABA", 
    "2. B", 
    "3. C"])
})