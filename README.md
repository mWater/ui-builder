# UI Builder

The goal of the UI Builder is to allow easy creation of relatively complex user interfaces using only drag and drop and thus
allow rapid iteration with clients.

Features include:

- Standard controls like text boxes, dropdowns, radio buttons
- Tables with multiple filters 
- Text with embedded expressions
- Repeated sections (e.g. repeat a group for each water point)
- Popups which can be shared between widgets
- Required fields and complex validation
- Tabs and collapsible sections
- Cascading selection of values
- Easy to embed custom controls
- Able to work in an offline mobile environment

Non-features:

- Does not include a scripting language. Custom work should be done as custom components

## Requirements

Requires Bootstrap 3 to be present, as well as Font Awesome 4.7+.

## Concepts

### Blocks

Blocks are the smallest item. They are a rectangular item on the screen such as a drop down box, text field, expression ,table, etc

Blocks may contain other blocks, but the method of embedding the children blocks is entirely up to the parent block.

### Context variables

Contacts variables are variable values that are passed down through the tree of blocks. They may be of the type `row` indicating a single 
row of a table. `rowset` is a Boolean expression determining which rows of a table are included in a set of rows. They can also be `text`,
`number`, etc and other literals.

A block may use one or more context variables. Furthermore, for row and rowset variables, the block may request the value of one or more
expressions based on the variable. For example, a text box may request the value of a text column of a row so that it doesn't have to query
it itself.

`rowset` can be filtered by widgets. Each widget can apply filters to the rowset dynamically as well as specifying initial filters to be applied.
The filters are not present in the `contextVarValues` and must be applied manually if a widget wants to include filters.

`row` is only different from `id` in that `row` can have expressions based on it. Also, `row` stores its table in `table` where 
`id` uses `idTable`.

The values of context variables depends on the type. 

`row`: actual value of the row's primary key. `null` for none

`rowset`: expression with a boolean value. e.g. `{ type: "op", table: "customers", op: "is not null", exprs: [{ type: "field", table: "customers", column: "name" }] }`

Other: mWater expression. Which means that, for example, number variables could have value `{ type: "literal", valueType: "number", value: 123 }`, not `123`

### Widgets

A widget contains a single block and has a human readable name. It also defines 0 or more contexts variables that will be passed to the block.

The purpose of the UI Builder is primarily to create widgets which represent pages of the website or that represents smaller pieces that can be reused.

### Widget Library

Collection of widgets. Usually an app will have a single widget Library that is serializable to Json.

## How to add a new block type

- Create block def and block in the blocks folder
- Add to BlockFactory in `widgets/BlockFactory.ts`
- Add to palette in `designer/blockPaletteEntries.tsx`

## Actions

Actions are things that buttons, etc perform.

- openModal (widget, contextVar values)
- addRow (table, column values)
- deleteRow (table, row id)
- gotoUrl (url, exprs)
- close (closes current view)

## Selection

TODO
