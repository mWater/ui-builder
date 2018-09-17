import { Schema } from "mwater-expressions";

export default function simpleSchema(): Schema {
  let schema = new Schema()
  schema = schema.addTable({ id: "t1", name: { _base: "en", en: "T1" }, primaryKey: "primary", contents: [
    { id: "text", name: { _base: "en", en: "Text" }, type: "text" },
    { id: "number", name: { _base: "en", en: "Number" }, type: "number" },
    { id: "enum", name: { _base: "en", en: "Enum" }, type: "enum", enumValues: [{ id: "a", name: { _base: "en", en: "A"}}, { id: "b", name: { _base: "en", en: "B"}}] },
    { id: "enumset", name: { _base: "en", en: "Enumset" }, type: "enumset", enumValues: [{ id: "a", name: { _base: "en", en: "A"}}, { id: "b", name: { _base: "en", en: "B"}}] },
    { id: "date", name: { _base: "en", en: "Date" }, type: "date" },
    { id: "datetime", name: { _base: "en", en: "Datetime" }, type: "datetime" },
    { id: "boolean", name: { _base: "en", en: "Boolean" }, type: "boolean" },
    { id: "geometry", name: { _base: "en", en: "Geometry" }, type: "geometry" },
    { id: "text[]", name: { _base: "en", en: "Textarr" }, type: "text[]" },
    { id: "1-2", name: { _base: "en", en: "T1->T2" }, type: "join", join: { fromColumn: "primary", toTable: "t2", toColumn: "t1", type: "1-n" }}
  ]})

  schema = schema.addTable({ id: "t2", name: { _base: "en", en: "T2" }, primaryKey: "primary", ordering: "number", contents: [
    { id: "t1", name: { _base: "en", en: "T1" }, type: "id" },
    { id: "text", name: { _base: "en", en: "Text" }, type: "text" },
    { id: "number", name: { _base: "en", en: "Number" }, type: "number" },
    { id: "2-1", name: { _base: "en", en: "T2->T1" }, type: "join", join: { fromColumn: "t1", toTable: "t1", toColumn: "primary", type: "n-1" }}
  ]})

  return schema
}